import { NextRequest, NextResponse } from 'next/server'

// 简单的内存缓存: 使用 Map 存储不同 key (language-category) 的缓存数据
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10分钟缓存

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || 'top' // 默认为 top
        const language = searchParams.get('language') || 'en' // 默认为英文

        // 生成缓存键
        const cacheKey = `${language}-${category}`

        // 检查缓存是否有效
        const cachedItem = cache.get(cacheKey)
        if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
            console.log(`Serving from cache for key: ${cacheKey}`)
            return NextResponse.json(cachedItem.data)
        }

        const apiKey = process.env.NEWSDATA_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
        }

        // 构建 NewsData.io 请求 URL
        // 注意：NewsData.io 的 category 参数是用来过滤类别的
        const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=${language}&category=${category}`

        console.log(`Fetching from NewsData.io: ${url}`)
        const response = await fetch(url)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('NewsData.io API error:', response.status, errorText)
            return NextResponse.json({ error: `NewsData.io API error: ${response.status}` }, { status: response.status })
        }

        const data = await response.json()

        if (data.status !== 'success') {
            return NextResponse.json({ error: 'NewsData.io API returned error status', details: data }, { status: 500 })
        }

        // 格式化数据以匹配前端组件
        const formattedArticles = (data.results || []).map((article: any, index: number) => {
            // 安全获取 description 或 content
            let summary = '';
            if (article.description) {
                summary = article.description;
            } else if (article.content) {
                summary = article.content;
            }

            if (summary && summary.length > 150) {
                summary = summary.substring(0, 150) + '...';
            }

            return {
                id: article.article_id || `newsdata-${index}-${Date.now()}`,
                title: article.title,
                originalTitle: article.title,
                summary: summary,
                category: article.category ? article.category[0] : 'general',
                sourceName: article.source_id || 'NewsData',
                originalUrl: article.link,
                imageUrl: article.image_url,
                publishedAt: article.pubDate,
                viewCount: 0, // NewsData.io 不提供阅读量，默认为0
            };
        })

        const result = {
            articles: formattedArticles,
            totalResults: data.totalResults,
            nextPage: data.nextPage
        }

        // 更新缓存
        cache.set(cacheKey, { data: result, timestamp: Date.now() })
        console.log(`Updated cache for key: ${cacheKey}`)

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error in external-news API:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
