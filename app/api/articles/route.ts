import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 简单的内存缓存（生产环境建议使用 Redis）
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1分钟缓存

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '30')
  const search = searchParams.get('search')
  const daily = searchParams.get('daily')

  // 限制最大返回数量
  const safeLimit = Math.min(limit, 50)
  const skip = (page - 1) * safeLimit

  // 生成缓存键
  const cacheKey = `articles:${category}:${page}:${safeLimit}:${search}:${daily}`

  // 检查缓存
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=60',
      },
    })
  }

  try {
    const where: any = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { translatedTitle: { contains: search, mode: 'insensitive' } },
        { translatedSummary: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 日报模式：获取最近24小时的热门新闻
    if (daily) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      where.publishedAt = { gte: oneDayAgo }
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [
          { publishedAt: 'desc' },
          { viewCount: 'desc' },
        ],
        skip,
        take: safeLimit,
        select: {
          id: true,
          title: true,
          summary: true,
          originalUrl: true,
          category: true,
          sourceName: true,
          source: {
            select: {
              language: true,
            },
          },
          publishedAt: true,
          viewCount: true,
          translatedTitle: true,
          translatedSummary: true,
          translationStatus: true,
          originalLanguage: true,
        },
      }),
      prisma.article.count({ where }),
    ])

    // 格式化返回数据 - 优先使用中文翻译
    const formattedArticles = articles.map(article => {
      const needsTranslation = article.originalLanguage !== 'zh' && !article.translatedTitle
      const displayTitle = article.translatedTitle || article.title
      const displaySummary = article.translatedSummary || article.summary

      return {
        id: article.id,
        title: displayTitle,
        originalTitle: article.title,
        summary: displaySummary,
        originalSummary: article.summary,
        originalUrl: article.originalUrl,
        category: article.category,
        sourceName: article.sourceName,
        sourceLanguage: article.source.language,
        publishedAt: article.publishedAt,
        viewCount: article.viewCount,
        isTranslated: !!article.translatedTitle,
        needsTranslation, // 前端可根据此字段判断是否需要调用翻译 API
        translationStatus: article.translationStatus,
      }
    })

    const responseData = {
      articles: formattedArticles,
      pagination: {
        page,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    }

    // 存入缓存
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() })

    // 清理过期缓存
    if (cache.size > 100) {
      const now = Date.now()
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key)
        }
      }
    }

    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=60',
      },
    })

  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: '获取新闻失败' },
      { status: 500 }
    )
  }
}
