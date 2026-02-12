import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 获取每个分类的最新热门新闻
    const categories = ['tech', 'finance', 'international', 'sports', 'domestic']
    
    const featuredArticles = await prisma.article.findMany({
      where: {
        category: {
          in: categories,
        },
        publishedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: [
        { viewCount: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: 6,
      include: {
        source: {
          select: {
            name: true,
          },
        },
      },
    })
    
    const formatted = featuredArticles.map(article => ({
      id: article.id,
      title: article.translatedTitle || article.title,
      summary: article.translatedSummary || article.summary,
      imageUrl: article.imageUrl,
      category: article.category,
      sourceName: article.sourceName,
      publishedAt: article.publishedAt,
    }))
    
    return NextResponse.json({ articles: formatted })
    
  } catch (error) {
    console.error('Error fetching featured articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured articles' },
      { status: 500 }
    )
  }
}
