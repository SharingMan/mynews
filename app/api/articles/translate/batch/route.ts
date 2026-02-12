import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { translateBatch } from '@/lib/translate'

// 批量翻译 API
// POST /api/articles/translate/batch

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '请提供文章 ID 数组' },
        { status: 400 }
      )
    }

    // 限制批量数量
    if (ids.length > 10) {
      return NextResponse.json(
        { error: '一次最多翻译 10 篇文章' },
        { status: 400 }
      )
    }

    // 获取需要翻译的文章
    const articles = await prisma.article.findMany({
      where: {
        id: { in: ids },
        originalLanguage: { not: 'zh' },
        translatedTitle: null, // 只翻译未翻译的
      },
    })

    if (articles.length === 0) {
      return NextResponse.json({
        translated: 0,
        message: '没有需要翻译的文章',
      })
    }

    // 批量翻译
    const titles = articles.map(a => a.title)
    const summaries = articles.map(a => a.summary || '')

    const [translatedTitles, translatedSummaries] = await Promise.all([
      translateBatch(titles, 'zh'),
      translateBatch(summaries, 'zh'),
    ])

    // 更新数据库
    const updates = articles.map((article, index) =>
      prisma.article.update({
        where: { id: article.id },
        data: {
          translatedTitle: translatedTitles[index],
          translatedSummary: translatedSummaries[index],
          translationStatus: 'completed',
        },
      })
    )

    await Promise.all(updates)

    return NextResponse.json({
      translated: articles.length,
      articles: articles.map((a, i) => ({
        id: a.id,
        originalTitle: a.title,
        translatedTitle: translatedTitles[i],
      })),
      message: `成功翻译 ${articles.length} 篇文章`,
    })

  } catch (error) {
    console.error('[Batch Translate] Error:', error)
    return NextResponse.json(
      { error: '批量翻译失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
