'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ManualUpdatePage() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpdate = async () => {
    setIsUpdating(true)
    setMessage('正在抓取最新新闻...')

    try {
      const response = await fetch('/api/cron/fetch', {
        method: 'GET',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`✅ 抓取成功！总计 ${result.total} 篇，新增 ${result.new} 篇新闻`)
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        setMessage('❌ 抓取失败，请稍后再试')
      }
    } catch (error) {
      setMessage('❌ 更新异常：' + (error as Error).message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-bold mb-4 text-gray-800">🔄 手动更新新闻</h1>

        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
          <p className="text-sm text-orange-800 mb-2">
            <strong>💡 免费版说明</strong>
          </p>
          <p className="text-xs text-orange-700">
            Vercel免费版限制定时任务频率，您可以手动点击下面的按钮来更新最新新闻。
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">{message}</p>
          </div>
        )}

        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className={`w-full font-medium py-3 px-4 rounded-md transition-colors ${
            isUpdating
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {isUpdating ? '⏳ 抓取中...' : '🚀 立即更新新闻'}
        </button>

        <div className="mt-6 text-sm text-gray-500 space-y-1">
          <p>• 每次最多抓取35篇最新新闻</p>
          <p>• 自动去重和智能分类</p>
          <p>• 建议每天更新2-3次</p>
          <p>• 抓取时间约30-60秒</p>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link href="/" className="text-orange-500 hover:underline text-sm">
            ← 返回新闻主页
          </Link>
        </div>
      </div>
    </div>
  )
}
