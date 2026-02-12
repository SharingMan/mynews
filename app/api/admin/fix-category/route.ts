import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // 1. Fix Indepth Sources
        const indepthSources = ['sspai', 'ifanr', 'huxiu', 'latepost', 'ruanyifeng', '36kr']
        const indepthResult = await prisma.article.updateMany({
            where: {
                sourceId: { in: indepthSources },
                category: { not: 'indepth' } // Only update if not already correct
            },
            data: {
                category: 'indepth'
            }
        })

        // 2. Fix Twitter Sources
        const twitterSources = ['elon-musk', 'donald-trump']
        const twitterResult = await prisma.article.updateMany({
            where: {
                sourceId: { in: twitterSources },
                category: { not: 'twitter' }
            },
            data: {
                category: 'twitter'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Categories fixed successfully',
            indepthUpdated: indepthResult.count,
            twitterUpdated: twitterResult.count
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
