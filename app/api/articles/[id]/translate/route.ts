import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { translateText } from '@/lib/translate'

/**
 * 按需翻译单篇文章
 * POST /api/articles/[id]/translate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // 获取文章
    const article = await prisma.article.findUnique({
      where: { id },
      include: { source: true },
    })

    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    // 如果已经是中文，不需要翻译
    if (article.originalLanguage === 'zh') {
      return NextResponse.json({
        id: article.id,
        translatedTitle: article.title,
        translatedSummary: article.summary,
        translationStatus: 'not_needed',
        message: '原文已经是中文，无需翻译',
      })
    }

    // 如果已经翻译过，直接返回缓存结果
    if (article.translatedTitle && article.translatedSummary) {
      return NextResponse.json({
        id: article.id,
        translatedTitle: article.translatedTitle,
        translatedSummary: article.translatedSummary,
        translationStatus: 'completed',
        message: '使用已缓存的翻译',
      })
    }

    // 执行翻译
    console.log(`[Translate] Translating article ${id}: ${article.title.substring(0, 50)}...`)
    const startTime = Date.now()

    const [translatedTitle, translatedSummary] = await Promise.all([
      translateText(article.title, 'zh'),
      article.summary ? translateText(article.summary, 'zh') : Promise.resolve(''),
    ])

    const duration = Date.now() - startTime
    console.log(`[Translate] Completed in ${duration}ms`)

    // 更新数据库
    await prisma.article.update({
      where: { id },
      data: {
        translatedTitle,
        translatedSummary,
        translationStatus: 'completed',
      },
    })

    return NextResponse.json({
      id: article.id,
      translatedTitle,
      translatedSummary,
      translationStatus: 'completed',
      duration,
      message: '翻译成功',
    })

  } catch (error) {
    console.error('[Translate] Error:', error)

    // 更新翻译状态为失败
    try {
      await prisma.article.update({
        where: { id },
        data: { translationStatus: 'failed' },
      })
    } catch (e) {
      // 忽略更新失败的错误
    }

    return NextResponse.json(
      { error: '翻译失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * 获取翻译状态
 * GET /api/articles/[id]/translate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        translatedTitle: true,
        translatedSummary: true,
        translationStatus: true,
        originalLanguage: true,
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: article.id,
      originalTitle: article.title,
      translatedTitle: article.translatedTitle,
      translatedSummary: article.translatedSummary,
      translationStatus: article.translationStatus,
      originalLanguage: article.originalLanguage,
      needsTranslation: article.originalLanguage !== 'zh' && !article.translatedTitle,
    })

  } catch (error) {
    console.error('[Translate] Error:', error)
    return NextResponse.json(
      { error: '获取翻译状态失败' },
      { status: 500 }
    )
  }
}
