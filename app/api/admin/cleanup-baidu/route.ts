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
    // 首先查找百度热搜的源ID
    const baiduSource = await prisma.newsSource.findFirst({
      where: {
        OR: [
          { name: '百度热搜' },
          { id: 'baidu-hot' }
        ]
      }
    })

    let deletedArticles = 0
    let deletedSource = 0

    // 删除来源为"百度热搜"的文章
    const articlesResult = await prisma.article.deleteMany({
      where: {
        OR: [
          { sourceName: '百度热搜' },
          { sourceId: 'baidu-hot' },
          baiduSource ? { sourceId: baiduSource.id } : {}
        ]
      }
    })
    deletedArticles = articlesResult.count

    // 删除百度热搜源
    const sourceResult = await prisma.newsSource.deleteMany({
      where: {
        OR: [
          { name: '百度热搜' },
          { id: 'baidu-hot' }
        ]
      }
    })
    deletedSource = sourceResult.count

    return NextResponse.json({
      success: true,
      deletedArticles,
      deletedSources: deletedSource,
      message: `成功删除 ${deletedArticles} 条百度热搜文章和 ${deletedSource} 个源记录`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cleanup Baidu error:', error)
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
