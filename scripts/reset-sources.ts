import { prisma } from '../lib/prisma'

async function resetSources() {
  console.log('🔄 重置所有新闻源状态...')

  // 重置所有源为 active 并清空错误计数
  const result = await prisma.newsSource.updateMany({
    data: {
      isActive: true,
      errorCount: 0,
    },
  })

  console.log(`✅ 已重置 ${result.count} 个新闻源`)

  // 显示当前源状态
  const sources = await prisma.newsSource.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,
      errorCount: true,
      lastFetched: true,
    },
    orderBy: {
      lastFetched: 'desc',
    },
  })

  console.log('\n📊 当前新闻源状态：')
  console.table(sources)

  await prisma.$disconnect()
}

resetSources().catch(console.error)
