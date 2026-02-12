import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 获取单篇文章详情
 * GET /api/articles/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        source: true,
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    // 增加浏览计数
    await prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({
      id: article.id,
      title: article.title,
      translatedTitle: article.translatedTitle,
      summary: article.summary,
      translatedSummary: article.translatedSummary,
      originalUrl: article.originalUrl,
      category: article.category,
      sourceName: article.sourceName,
      viewCount: article.viewCount + 1, // 返回更新后的计数
      originalLanguage: article.originalLanguage,
      translationStatus: article.translationStatus,
      publishedAt: article.publishedAt,
      source: {
        language: article.source.language,
      },
    })

  } catch (error) {
    console.error('[Article] Error:', error)
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    )
  }
}
