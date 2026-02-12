import { NextResponse } from 'next/server'

// 每天早上8点调用此API来生成每日总结
export async function GET(request: Request) {
    try {
        // 验证请求（可以添加密钥验证）
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'your-secret-key'}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const currentHour = now.getHours()

        // 只在早上8点执行
        if (currentHour !== 8) {
            return NextResponse.json({
                message: '非执行时间',
                currentHour,
                expectedHour: 8,
            })
        }

        // 调用 daily-summary API 生成总结
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/daily-summary`, {
            method: 'GET',
            cache: 'no-store',
        })

        if (!response.ok) {
            throw new Error(`Failed to generate summary: ${response.statusText}`)
        }

        const data = await response.json()

        return NextResponse.json({
            success: true,
            message: '每日总结生成成功',
            summary: data.summary,
            highlights: data.highlights,
            totalArticles: data.totalArticles,
            generatedAt: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Error in generate-daily-summary cron:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : '生成失败',
            },
            { status: 500 }
        )
    }
}
