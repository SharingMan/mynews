import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 验证请求
function validateRequest(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret') || new URL(request.url).searchParams.get('secret')
  return secret === process.env.CRON_SECRET
}

export async function DELETE(request: NextRequest) {
  // 验证
  if (!validateRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 删除百度热搜的文章
    const articlesResult = await prisma.article.deleteMany({
      where: {
        sourceName: '百度热搜'
      }
    })

    // 删除百度热搜源
    const sourceResult = await prisma.newsSource.deleteMany({
      where: {
        name: '百度热搜'
      }
    })

    return NextResponse.json({
      success: true,
      deletedArticles: articlesResult.count,
      deletedSources: sourceResult.count,
      message: `成功删除 ${articlesResult.count} 条百度热搜文章和 ${sourceResult.count} 个源记录`
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({
      error: '删除失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 也支持GET请求方便测试
export async function GET(request: NextRequest) {
  return DELETE(request)
}
