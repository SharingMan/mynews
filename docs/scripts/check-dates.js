const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDates() {
    try {
        const now = new Date()
        console.log('当前服务器时间:', now.toISOString(), now.toLocaleString())

        // 获取最新的5条新闻
        const latestArticles = await prisma.article.findMany({
            take: 5,
            orderBy: { publishedAt: 'desc' },
            select: { title: true, publishedAt: true, createdAt: true }
        })

        console.log('最新5条新闻的时间:')
        latestArticles.forEach((a, i) => {
            console.log(`${i + 1}. [${a.title.substring(0, 10)}...] 发布于: ${a.publishedAt.toISOString()} (抓取于: ${a.createdAt.toISOString()})`)
        })

        // 检查过去24小时内的新闻数量 (publishedAt)
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const countPublished = await prisma.article.count({
            where: { publishedAt: { gte: yesterday } }
        })
        console.log(`过去24小时发布的文章数 (publishedAt >= ${yesterday.toISOString()}): ${countPublished}`)

        // 检查过去24小时内抓取的新闻数量 (createdAt)
        const countCreated = await prisma.article.count({
            where: { createdAt: { gte: yesterday } }
        })
        console.log(`过去24小时抓取的文章数 (createdAt >= ${yesterday.toISOString()}): ${countCreated}`)

    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

checkDates()
