import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const checks: any = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? '已设置' : '未设置',
    databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : '空',
  }

  // 测试数据库连接
  try {
    const articleCount = await prisma.article.count()
    checks.database = '连接成功'
    checks.articleCount = articleCount
  } catch (error: any) {
    checks.database = '连接失败'
    checks.dbError = error.message
    checks.dbErrorCode = error.code
  }

  // 测试新闻源
  try {
    const sourceCount = await prisma.newsSource.count()
    checks.newsSourceCount = sourceCount
  } catch (error: any) {
    checks.newsSourceError = error.message
  }

  const isHealthy = checks.database === '连接成功'

  return NextResponse.json(checks, { 
    status: isHealthy ? 200 : 500 
  })
}
