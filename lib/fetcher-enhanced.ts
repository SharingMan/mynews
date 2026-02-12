import Parser from 'rss-parser'
import crypto from 'crypto'
import { categoryKeywords } from './news-sources'
import { translateText as _translateText } from './translate'

const rssParser = new Parser({
  timeout: 15000, // 增加超时时间
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; GlobalNewsBot/1.0)',
  },
})

export interface RawArticle {
  title: string
  summary: string
  content: string
  originalUrl: string
  imageUrl?: string
  publishedAt: Date
  hash: string
}

// 生成内容哈希用于去重
export function generateHash(title: string, url: string): string {
  return crypto.createHash('md5').update(title + url).digest('hex')
}

// 增强的自动分类 - 更准确的分类算法
export function autoCategory(title: string, content: string, defaultCategory: string): string {
  const text = (title + ' ' + content).toLowerCase()

  const scores: Record<string, number> = {}

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    scores[category] = 0
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi')
      const matches = text.match(regex)
      if (matches) {
        // 标题中匹配的权重更高
        const titleMatches = title.toLowerCase().match(regex)
        scores[category] += matches.length + (titleMatches ? titleMatches.length * 2 : 0)
      }
    }
  }

  // 找到得分最高的分类，需要达到最低阈值
  let bestCategory = defaultCategory
  let maxScore = 2 // 最低阈值，避免误分类

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      bestCategory = category
    }
  }

  return bestCategory
}

// 提取图片URL
function extractImageUrl(item: any): string | undefined {
  // 尝试不同的RSS图片字段
  if (item.enclosure?.url) {
    return item.enclosure.url
  }
  if (item['media:content']?.$.url) {
    return item['media:content'].$.url
  }
  if (item['media:thumbnail']?.$.url) {
    return item['media:thumbnail'].$.url
  }
  // 从content中提取第一个图片
  const content = item['content:encoded'] || item.content || ''
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/)
  if (imgMatch) {
    return imgMatch[1]
  }
  return undefined
}

// 清理HTML标签
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// 截取摘要
function extractSummary(text: string, maxLength: number = 300): string {
  const cleanText = stripHtml(text)
  if (cleanText.length <= maxLength) {
    return cleanText
  }
  return cleanText.substring(0, maxLength) + '...'
}

// 检查是否为最新新闻
function isRecentNews(publishedAt: Date, hoursLimit: number = 48): boolean {
  const now = new Date()
  const timeLimitAgo = new Date(now.getTime() - hoursLimit * 60 * 60 * 1000)
  return publishedAt >= timeLimitAgo
}

// 增强的RSS抓取器
export async function fetchRSSFeedEnhanced(url: string, maxItems: number = 35): Promise<RawArticle[]> {
  try {
    const feed = await rssParser.parseURL(url)
    const articles: RawArticle[] = []

    for (const item of feed.items.slice(0, maxItems)) { // 抓取更多新闻
      if (!item.title || !item.link) continue

      const title = stripHtml(item.title)
      const content = item['content:encoded'] || item.content || item.summary || ''
      const summary = extractSummary(content, 350)
      const originalUrl = item.link
      const imageUrl = extractImageUrl(item)

      // 解析发布时间
      let publishedAt = new Date()
      if (item.pubDate || item.isoDate) {
        const date = new Date(item.pubDate || item.isoDate!)
        if (!isNaN(date.getTime())) {
          publishedAt = date
        }
      }

      // 扩展到48小时内的新闻
      if (!isRecentNews(publishedAt, 48)) {
        continue
      }

      const hash = generateHash(title, originalUrl)

      articles.push({
        title,
        summary,
        content: stripHtml(content),
        originalUrl,
        imageUrl,
        publishedAt,
        hash,
      })
    }

    // 按发布时间排序，最新的在前
    articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

    return articles
  } catch (error) {
    console.error(`Error fetching RSS feed ${url}:`, error)
    throw error
  }
}

// 翻译函数 - 使用 DeepL Free API
// 从 lib/translate.ts 导入实际的翻译实现 (import 在文件顶部)
export async function translateText(text: string, targetLang: string): Promise<string> {
  return _translateText(text, targetLang)
}

// 批量抓取多个RSS源
export async function batchFetchNews(sources: Array<{id: string, url: string, category: string}>): Promise<Map<string, RawArticle[]>> {
  const results = new Map<string, RawArticle[]>()

  // 并发抓取，但限制并发数量
  const concurrencyLimit = 5
  const chunks = []
  for (let i = 0; i < sources.length; i += concurrencyLimit) {
    chunks.push(sources.slice(i, i + concurrencyLimit))
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (source) => {
      try {
        const articles = await fetchRSSFeedEnhanced(source.url)
        results.set(source.id, articles)
      } catch (error) {
        console.error(`Failed to fetch ${source.id}:`, error)
        results.set(source.id, [])
      }
    })

    await Promise.all(promises)
  }

  return results
}
