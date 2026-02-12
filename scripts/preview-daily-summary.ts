
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Load env if not present
if (!process.env.DEEPSEEK_API_KEY) {
    try {
        const envPath = path.resolve(process.cwd(), '.env')
        if (fs.existsSync(envPath)) {
            const envConfig = require('dotenv').parse(fs.readFileSync(envPath))
            for (const k in envConfig) {
                process.env[k] = envConfig[k]
            }
        }
    } catch (e) {
        console.warn('Warning: Could not load .env file manually')
    }
}

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const prisma = new PrismaClient()

async function main() {
    if (!DEEPSEEK_API_KEY) {
        console.error('❌ Error: DEEPSEEK_API_KEY not found in environment variables')
        process.exit(1)
    }

    console.log('🔍 Fetching recent articles from database...')

    // Fetch articles from last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const articles = await prisma.article.findMany({
        where: {
            publishedAt: {
                gte: yesterday
            }
        },
        orderBy: { viewCount: 'desc' },
        take: 50,
        select: {
            title: true,
            translatedTitle: true,
            category: true,
            sourceName: true
        }
    })

    if (articles.length === 0) {
        console.log('⚠️ No articles found in last 24h. Cannot generate summary.')
        return
    }

    console.log(`✅ Found ${articles.length} articles. Creating digest...`)

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

    console.log('🚀 Sending request to DeepSeek API (using new prompt)...')

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
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        const content = data.choices[0]?.message?.content

        console.log('\n====== Generated Daily Summary Preview ======\n')
        console.log(content)
        console.log('\n===========================================\n')

    } catch (error) {
        console.error('❌ Generation failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
