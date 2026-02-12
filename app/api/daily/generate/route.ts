import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 验证cron请求
function validateCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.warn('CRON_SECRET not set, allowing request for development')
    return true
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  // 验证请求
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 检查是否已生成今日日报
    const existingDaily = await prisma.dailyNews.findUnique({
      where: { date: today },
    })
    
    if (existingDaily) {
      return NextResponse.json({
        success: true,
        message: '今日日报已存在',
        dailyId: existingDaily.id,
      })
    }
    
    // 获取昨日0点到今日0点的新闻
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const articles = await prisma.article.findMany({
      where: {
        publishedAt: {
          gte: yesterday,
          lt: today,
        },
      },
      orderBy: [
        { viewCount: 'desc' },
        { publishedAt: 'desc' },
      ],
    })
    
    // 按分类分组并取Top 5
    const categories = ['tech', 'finance', 'politics', 'sports', 'entertainment', 'health', 'education', 'environment', 'international', 'domestic']
    
    const categoryArticles: Record<string, typeof articles> = {}
    for (const cat of categories) {
      categoryArticles[cat] = articles
        .filter(a => a.category === cat)
        .slice(0, 5)
    }
    
    // 创建日报
    const dailyNews = await prisma.dailyNews.create({
      data: {
        date: today,
        title: `全球新闻日报 - ${today.toLocaleDateString('zh-CN')}`,
        summary: `今日精选 ${articles.length} 条重要新闻`,
        techCount: categoryArticles.tech.length,
        financeCount: categoryArticles.finance.length,
        politicsCount: categoryArticles.politics.length,
        sportsCount: categoryArticles.sports.length,
        entertainmentCount: categoryArticles.entertainment.length,
        healthCount: categoryArticles.health.length,
        educationCount: categoryArticles.education.length,
        environmentCount: categoryArticles.environment.length,
        internationalCount: categoryArticles.international.length,
        domesticCount: categoryArticles.domestic.length,
        totalCount: Object.values(categoryArticles).flat().length,
        isPublished: true,
        publishedAt: new Date(),
      },
    })
    
    // 关联文章
    for (const [category, catArticles] of Object.entries(categoryArticles)) {
      for (let i = 0; i < catArticles.length; i++) {
        await prisma.dailyArticle.create({
          data: {
            dailyId: dailyNews.id,
            articleId: catArticles[i].id,
            category,
            order: i,
          },
        })
        
        // 标记为已选入日报
        await prisma.article.update({
          where: { id: catArticles[i].id },
          data: { isDailySelected: true },
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      dailyId: dailyNews.id,
      totalArticles: articles.length,
      selectedArticles: Object.values(categoryArticles).flat().length,
    })
    
  } catch (error) {
    console.error('Daily generation error:', error)
    return NextResponse.json(
      { error: '日报生成失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
