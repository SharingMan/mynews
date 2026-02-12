import Parser from 'rss-parser'
import * as cheerio from 'cheerio'
import crypto from 'crypto'
import { categoryKeywords } from './news-sources'
import { translateText as _translateText } from './translate'

const rssParser = new Parser({
  timeout: 10000,
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

// 自动分类
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
function extractSummary(text: string, maxLength: number = 350): string {
  const cleanText = stripHtml(text)
  if (cleanText.length <= maxLength) {
    return cleanText
  }
  return cleanText.substring(0, maxLength) + '...'
}

// 抓取RSS源
export async function fetchRSSFeed(url: string): Promise<RawArticle[]> {
  try {
    const feed = await rssParser.parseURL(url)
    const articles: RawArticle[] = []

    for (const item of feed.items.slice(0, 35)) { // 只取最新的35条
      if (!item.title || !item.link) continue

      const title = stripHtml(item.title)
      const content = item['content:encoded'] || item.content || item.summary || ''
      const summary = extractSummary(content, 300)
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

      // 只保留24小时内的新闻
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
      if (publishedAt < twoDaysAgo) continue

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

    return articles
  } catch (error) {
    console.error(`Error fetching RSS feed ${url}:`, error)
    throw error
  }
}

// 抓取百度热搜
export async function fetchBaiduHotSearch(): Promise<RawArticle[]> {
  try {
    const response = await fetch('https://top.baidu.com/board?platform=pc&sa=pcindex_entry', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.baidu.com/',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // 检查是否被反爬
    if (html.includes('验证码') || html.includes('安全验证') || html.length < 1000) {
      throw new Error('Baidu returned anti-scraping page')
    }

    const $ = cheerio.load(html)
    const articles: RawArticle[] = []

    // 尝试多种选择器解析百度热搜
    const selectors = [
      '.category-wrap_iQLoo',
      '.item-wrap_2o6Z8',
      '[data-click*="log_title"]',
      '.title_3q6S5',
      'a[href*="/s?wd="]',
    ]

    for (const selector of selectors) {
      $(selector).each((index, element) => {
        try {
          const $item = $(element)

          // 尝试多种方式获取标题
          let title = ''
          const titleSelectors = ['.c-single-text-ellipsis', '.title_3q6S5', '.content-title', 'a']
          for (const ts of titleSelectors) {
            title = $item.find(ts).first().text().trim()
            if (title) break
          }
          if (!title) {
            title = $item.text().trim()
          }

          // 尝试获取链接
          let originalUrl = $item.attr('href') || $item.find('a').attr('href') || ''
          if (originalUrl && !originalUrl.startsWith('http')) {
            originalUrl = 'https://top.baidu.com' + originalUrl
          }
          if (!originalUrl && title) {
            // 如果没有链接，使用百度搜索链接
            originalUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(title)}`
          }

          // 获取热度
          const hotScore = $item.find('.hot-index_1Bl1a, .score_1iQ-l, .heat-score').text().trim() || '0'

          // 生成摘要
          const summary = hotScore !== '0'
            ? `百度搜索热度: ${hotScore}万`
            : '百度热搜话题'

          if (title && title.length > 3 && title.length < 100) {
            const hash = generateHash(title, originalUrl || title)

            // 检查是否已存在
            if (!articles.find(a => a.hash === hash)) {
              articles.push({
                title,
                summary,
                content: summary,
                originalUrl: originalUrl || `https://www.baidu.com/s?wd=${encodeURIComponent(title)}`,
                publishedAt: new Date(),
                hash,
              })
            }
          }
        } catch (itemError) {
          // 忽略单个条目错误
        }
      })

      // 如果找到足够数据，停止尝试其他选择器
      if (articles.length >= 10) break
    }

    // 限制数量
    const uniqueArticles = articles.slice(0, 30)

    console.log(`Fetched ${uniqueArticles.length} articles from Baidu Hot Search`)
    return uniqueArticles
  } catch (error) {
    console.error('Error fetching Baidu Hot Search:', error)
    // 返回空数组而不是抛出错误，避免中断其他源抓取
    return []
  }
}

// 翻译函数 - 使用 DeepL Free API
// 从 lib/translate.ts 导入实际的翻译实现 (import 在文件顶部)
export async function translateText(text: string, targetLang: string): Promise<string> {
  return _translateText(text, targetLang)
}
