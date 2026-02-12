import { prisma } from '../lib/prisma'

async function cleanupBaiduArticles() {
  console.log('开始删除百度热搜数据...')
  
  try {
    // 删除来源为"百度热搜"的文章
    const result = await prisma.article.deleteMany({
      where: {
        sourceName: '百度热搜'
      }
    })
    
    console.log(`成功删除 ${result.count} 条百度热搜文章`)
    
    // 可选：删除百度热搜的新闻源记录
    const sourceResult = await prisma.newsSource.deleteMany({
      where: {
        name: '百度热搜'
      }
    })
    
    console.log(`成功删除 ${sourceResult.count} 个百度热搜源记录`)
    
  } catch (error) {
    console.error('删除失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupBaiduArticles()
