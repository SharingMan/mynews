import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }
    
    // 检查是否已订阅
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    })
    
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: '该邮箱已订阅' },
          { status: 400 }
        )
      } else {
        // 重新激活订阅
        await prisma.subscriber.update({
          where: { email },
          data: { isActive: true },
        })
        return NextResponse.json({ success: true, message: '订阅已重新激活' })
      }
    }
    
    // 创建新订阅
    await prisma.subscriber.create({
      data: {
        email,
        name: name || null,
        subscribedCategories: JSON.stringify(['tech', 'finance', 'international', 'domestic']),
      },
    })
    
    return NextResponse.json({ success: true, message: '订阅成功' })
    
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: '订阅失败，请稍后重试' },
      { status: 500 }
    )
  }
}
