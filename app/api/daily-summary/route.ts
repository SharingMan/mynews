import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// 从环境变量读取 DeepSeek API Key
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

interface DailySummaryCache {
    id: string
    date: string
    summary: string
    highlights: string[]
    createdAt: Date
}

// 调用 DeepSeek API 生成总结
async function generateSummaryWithAI(articles: any[]): Promise<{ summary: string; highlights: string[] }> {
    const categoryNames: Record<string, string> = {
        tech: '科技',
        ai: 'AI',
        finance: '财经',
        overseas: '海外',
        china: '中国',
        sports: '体育',
        politics: '政治',
        entertainment: '娱乐',
        health: '健康',
        education: '教育',
        environment: '环境',
    }

    // 准备新闻摘要
    const newsDigest = articles.slice(0, 30).map((article, idx) => {
        const catName = categoryNames[article.category] || article.category
        return `${idx + 1}. [${catName}] ${article.translatedTitle || article.title} (来源: ${article.sourceName})`
    }).join('\n')

    const prompt = `你是一位资深的全球新闻主编和分析师，拥有敏锐的洞察力。请分析以下今日全球新闻列表，撰写一份深度日报。

今日新闻列表（来源真实，请据此分析）：
${newsDigest}

请严格按以下结构输出（不要包含Markdown标题以外的废话）：

【深度综述】
请写一段约150-200字的深度综述。不要只是罗列新闻，而是要分析今日全球发生的核心事件背后的关联、共同趋势或潜在的国际/行业影响。语言风格要专业、客观且具有解释力。

【核心要闻】
请挑选5-8个最具影响力的新闻事件，进行详细解读。每个要闻的格式如下：
- [领域] **标题/核心事件**：详细描述事件内容，并补充一到两句关于其背景或潜在影响的分析。（每条约50-80字）

要求：
1. 摒弃流水账式的报道，注重内容的深度和逻辑性。
2. "核心要闻"需要覆盖科技、财经、政治、国际等关键领域，避免单一类别。
3. 必须基于提供的列表进行总结，严禁编造不存在的新闻。
4. 保持中文语境的通顺与专业感。`

    // 验证 API Key 是否存在
    if (!DEEPSEEK_API_KEY) {
        console.error('DEEPSEEK_API_KEY is not configured')
        return generateBasicSummary(articles)
    }

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: '你是一位资深的全球新闻分析师，擅长深度解读新闻背后的趋势和影响。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        })

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.statusText}`)
        }

        const data = await response.json()
        const content = data.choices[0]?.message?.content || ''

        // 解析返回的内容
        const summaryMatch = content.match(/【深度综述】\s*([\s\S]*?)(?=【核心要闻】|$)/)
        const highlightsMatch = content.match(/【核心要闻】\s*([\s\S]*)/)

        const summary = summaryMatch ? summaryMatch[1].trim() : '今日新闻涵盖多个领域，内容深度丰富。'
        const highlightsText = highlightsMatch ? highlightsMatch[1].trim() : ''
        const highlights = highlightsText
            .split('\n')
            .filter((line: string) => line.trim().startsWith('-'))
            .map((line: string) => line.trim().replace(/^-\s*/, ''))
            .slice(0, 8)

        return {
            summary: summary || '今日新闻涵盖科技、财经、政治、体育等多个领域。',
            highlights: highlights.length > 0 ? highlights : ['今日新闻精彩纷呈'],
        }
    } catch (error) {
        console.error('DeepSeek API error:', error)
        // 降级到基本总结
        return generateBasicSummary(articles)
    }
}

// 基本总结生成（降级方案）
function generateBasicSummary(articles: any[]): { summary: string; highlights: string[] } {
    const categoryNames: Record<string, string> = {
        tech: '科技',
        ai: 'AI',
        finance: '财经',
        overseas: '海外',
        china: '中国',
        sports: '体育',
        politics: '政治',
        entertainment: '娱乐',
        health: '健康',
        education: '教育',
        environment: '环境',
    }

    const categoryCounts: Record<string, number> = {}
    articles.forEach(article => {
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1
    })

    const topCategories = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => categoryNames[cat] || cat)

    const summary = `今日共收录 ${articles.length} 条全球新闻，覆盖 ${Object.keys(categoryCounts).length} 个领域。` +
        `${topCategories.join('、')}等领域最为活跃。`

    const highlights = articles.slice(0, 5).map((article, idx) => {
        const catName = categoryNames[article.category] || article.category
        return `【${catName}】${article.translatedTitle || article.title}`
    })

    return { summary, highlights }
}

// 每天早上8点调用此API来生成每日总结
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const force = searchParams.get('force') === 'true'

        const now = new Date()
        const today = now.toLocaleDateString('zh-CN')
        const currentHour = now.getHours()

        // 检查是否已有今日的缓存总结
        const cachedSummary = await prisma.dailyNews.findFirst({
            where: {
                date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
            orderBy: { date: 'desc' },
        })

        // 如果有缓存且在今天，直接返回
        // 除非: 1. 强制刷新 2. 缓存的文章数为0 (说明可能是之前数据没抓好)
        if (!force && cachedSummary && cachedSummary.summary) {
            try {
                // 尝试解析 JSON 格式的 summary
                const parsedData = JSON.parse(cachedSummary.summary)

                // 如果是空缓存，允许重新生成（除非还没到新闻更新时间）
                if (parsedData.totalArticles === 0 && currentHour >= 8) {
                    console.log('Cache is empty, regenerating...')
                } else {
                    return NextResponse.json({
                        summary: parsedData.summary || cachedSummary.summary,
                        highlights: parsedData.highlights || [],
                        totalArticles: parsedData.totalArticles || 0,
                        date: today,
                        cached: true,
                    })
                }
            } catch {
                // 如果不是 JSON 格式，按旧格式返回
                return NextResponse.json({
                    summary: cachedSummary.summary,
                    highlights: [],
                    totalArticles: 0,
                    date: today,
                    cached: true,
                })
            }
        }

        // 获取过去24小时的新闻
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        let articles = await prisma.article.findMany({
            where: {
                publishedAt: {
                    gte: yesterday,
                },
            },
            orderBy: { viewCount: 'desc' },
            take: 50,
            select: {
                id: true,
                title: true,
                translatedTitle: true,
                category: true,
                sourceName: true,
                publishedAt: true,
                viewCount: true,
            },
        })

        // 如果没有找到（可能是时区问题或没有新发布），尝试按抓取时间查询
        if (articles.length === 0) {
            console.log('No articles found by publishedAt, trying createdAt...')
            articles = await prisma.article.findMany({
                where: {
                    createdAt: {
                        gte: yesterday,
                    },
                },
                orderBy: { viewCount: 'desc' },
                take: 50,
                select: {
                    id: true,
                    title: true,
                    translatedTitle: true,
                    category: true,
                    sourceName: true,
                    publishedAt: true,
                    viewCount: true,
                },
            })
        }

        // 如果还是没有，获取最新的 50 条（作为兜底）
        if (articles.length === 0) {
            console.log('No articles found in last 24h, fetching latest 50...')
            articles = await prisma.article.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: {
                    id: true,
                    title: true,
                    translatedTitle: true,
                    category: true,
                    sourceName: true,
                    publishedAt: true,
                    viewCount: true,
                },
            })
        }

        // 仍然没有数据
        if (articles.length === 0) {
            return NextResponse.json({
                summary: '今日暂无新闻数据',
                highlights: [],
                totalArticles: 0,
                date: today,
            })
        }

        // 生成AI总结
        const { summary, highlights } = await generateSummaryWithAI(articles)

        // 将 summary 和 highlights 组合成 JSON 存储
        const summaryData = JSON.stringify({ summary, highlights, totalArticles: articles.length })

        // 保存到数据库（作为今日总结的缓存）
        try {
            await prisma.dailyNews.upsert({
                where: {
                    date: new Date(new Date().setHours(0, 0, 0, 0)),
                },
                create: {
                    date: new Date(new Date().setHours(0, 0, 0, 0)),
                    summary: summaryData,
                    title: `${today} 全球新闻日报`,
                },
                update: {
                    summary: summaryData,
                },
            })
        } catch (error) {
            console.error('Failed to cache summary:', error)
        }

        return NextResponse.json({
            summary,
            highlights,
            totalArticles: articles.length,
            date: today,
            cached: false,
        })
    } catch (error) {
        console.error('Error generating daily summary:', error)
        return NextResponse.json(
            {
                error: '生成总结失败',
                summary: '暂时无法生成总结，请稍后重试。',
                highlights: [],
                totalArticles: 0,
            },
            { status: 500 }
        )
    }
}
