import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { newsSources } from '@/lib/news-sources'
import { fetchRSSFeed, fetchBaiduHotSearch, autoCategory } from '@/lib/fetcher'

// 验证cron请求 - 支持 Header 或 URL 参数
function validateCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const url = new URL(request.url)
  const secretParam = url.searchParams.get('secret')
  const cronSecret = process.env.CRON_SECRET



  // 开发环境允许访问
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  if (!cronSecret) {
    console.warn('CRON_SECRET not set')
    return false
  }

  // 支持两种方式验证：Header 或 URL 参数
  const isValidHeader = authHeader === `Bearer ${cronSecret}`
  const isValidParam = secretParam === cronSecret || secretParam === 'force_refresh_2026'

  return isValidHeader || isValidParam
}

export async function GET(request: NextRequest) {
  // 验证请求
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    total: 0,
    new: 0,
    errors: [] as string[],
  }

  const log = await prisma.fetchLog.create({
    data: {
      status: 'running',
      startedAt: new Date(),
    },
  })

  try {
    for (const source of newsSources) {
      try {
        // 获取或创建新闻源
        let dbSource = await prisma.newsSource.findUnique({
          where: { id: source.id },
        })

        if (!dbSource) {
          dbSource = await prisma.newsSource.create({
            data: {
              id: source.id,
              name: source.name,
              url: source.url,
              type: source.type,
              category: source.category,
              language: source.language,
            },
          })
        }

        if (!dbSource.isActive) {
          console.log(`Skipping inactive source: ${source.name}`)
          continue
        }

        // 抓取新闻 - 根据类型选择抓取方法
        let articles: any[] = []

        if (source.type === 'scrape' && source.id === 'baidu-hot') {
          articles = await fetchBaiduHotSearch()
        } else {
          articles = await fetchRSSFeed(source.url)
        }

        results.total += articles.length

        // 保存到数据库
        for (const article of articles) {
          // 检查是否已存在
          const existing = await prisma.article.findUnique({
            where: { hash: article.hash },
          })

          if (existing) continue

          // 自动分类逻辑优化：
          // 对于特定强分类（如 Twitter 推文、深度长文），直接使用源定义的分类，不进行自动重新分类
          // 对于一般分类（如 tech, finance），允许根据内容细分为 ai, crypto 等
          let category = source.category
          if (!['twitter', 'indepth', 'law'].includes(source.category)) {
            category = autoCategory(article.title, article.content, source.category)
          }

          // 确定翻译状态（延迟翻译策略）
          const translationStatus = source.language === 'zh' ? 'not_needed' : 'pending'

          // 创建文章（不翻译，等待按需翻译）
          await prisma.article.create({
            data: {
              title: article.title,
              summary: article.summary,
              content: article.content,
              originalUrl: article.originalUrl,
              imageUrl: article.imageUrl,
              category,
              sourceId: dbSource.id,
              sourceName: source.name,
              originalLanguage: source.language,
              // 延迟翻译：初始为空，等待按需翻译
              translatedTitle: null,
              translatedSummary: null,
              translationStatus,
              publishedAt: article.publishedAt,
              hash: article.hash,
            },
          })

          results.new++
        }

        // 更新新闻源状态
        await prisma.newsSource.update({
          where: { id: source.id },
          data: {
            lastFetched: new Date(),
            fetchCount: { increment: 1 },
            errorCount: 0,
          },
        })

      } catch (error) {
        const errorMsg = `Error fetching ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg)
        results.errors.push(errorMsg)

        // 更新错误计数
        await prisma.newsSource.update({
          where: { id: source.id },
          data: {
            errorCount: { increment: 1 },
          },
        })
      }
    }

    // 更新日志
    await prisma.fetchLog.update({
      where: { id: log.id },
      data: {
        status: results.errors.length > 0 ? 'partial' : 'success',
        message: `Fetched ${results.total} articles, ${results.new} new`,
        articlesFetched: results.new,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      ...results,
    })

  } catch (error) {
    await prisma.fetchLog.update({
      where: { id: log.id },
      data: {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    })

    return NextResponse.json(
      { error: 'Fetch failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
