'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Triangle, Download, RefreshCw, Share2, Calendar } from 'lucide-react'
import { toPng } from 'html-to-image'
import { Button } from '@/components/ui/button'

interface Article {
  id: string
  title: string
  originalTitle: string
  category: string
  sourceName: string
  viewCount: number
  publishedAt: string
  isTranslated: boolean
}

interface DailyGroup {
  category: string
  categoryName: string
  articles: Article[]
}

interface DailySummary {
  summary: string
  highlights: string[]
  totalArticles: number
  date: string
}

const categoryNames: Record<string, string> = {
  tech: '科技前沿',
  finance: '财经要闻',
  international: '国际视野',
  sports: '体育赛事',
  politics: '政治动态',
  entertainment: '娱乐资讯',
  health: '健康生活',
  education: '教育文化',
  environment: '环境保护',
  domestic: '国内新闻',
}

const categoryColors: Record<string, string> = {
  tech: '#3b82f6',
  finance: '#10b981',
  international: '#8b5cf6',
  sports: '#f59e0b',
  politics: '#ef4444',
  entertainment: '#ec4899',
  health: '#14b8a6',
  education: '#6366f1',
  environment: '#22c55e',
  domestic: '#06b6d4',
}

// 生成固定的期数（基于日期）
function getIssueNumber(): number {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const diffTime = now.getTime() - startOfYear.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

export default function DailyPage() {
  const [dailyData, setDailyData] = useState<DailyGroup[]>([])
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const [issueNumber, setIssueNumber] = useState(1)
  const dailyRef = useRef<HTMLDivElement>(null)

  // 客户端挂载后才设置日期
  useEffect(() => {
    setMounted(true)
    const today = new Date()
    setCurrentDate(today.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }))
    setIssueNumber(getIssueNumber())
  }, [])

  const loadDailyNews = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/articles?daily=true&limit=50')
      if (response.ok) {
        const data = await response.json()

        // 按分类分组
        const grouped: Record<string, Article[]> = {}
        data.articles.forEach((article: Article) => {
          if (!grouped[article.category]) {
            grouped[article.category] = []
          }
          if (grouped[article.category].length < 5) {
            grouped[article.category].push(article)
          }
        })

        // 转换为数组并排序
        const result: DailyGroup[] = Object.entries(grouped)
          .map(([category, articles]) => ({
            category,
            categoryName: categoryNames[category] || category,
            articles,
          }))
          .filter(g => g.articles.length > 0)
          .sort((a, b) => b.articles.length - a.articles.length)
          .slice(0, 6)

        setDailyData(result)
      }
    } catch (error) {
      console.error('Error loading daily news:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadDailySummary = useCallback(async () => {
    try {
      const response = await fetch('/api/daily-summary')
      if (response.ok) {
        const data = await response.json()
        setDailySummary(data)
      }
    } catch (error) {
      console.error('Error loading daily summary:', error)
    }
  }, [])

  useEffect(() => {
    loadDailyNews()
    loadDailySummary()
  }, [loadDailyNews, loadDailySummary])

  const handleDownload = useCallback(async () => {
    if (dailyRef.current === null) return

    try {
      const dataUrl = await toPng(dailyRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      })

      const link = document.createElement('a')
      link.download = `GlobalNews日报-${new Date().toLocaleDateString('zh-CN')}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to generate image:', err)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">正在生成日报...</p>
        </div>
      </div>
    )
  }

  const totalArticles = dailyData.reduce((acc, g) => acc + g.articles.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8 px-4">
      {/* 操作按钮 */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Triangle className="w-4 h-4" />
            返回首页
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button onClick={loadDailyNews} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            刷新
          </Button>
          <Button onClick={handleDownload} className="gap-2 bg-orange-500 hover:bg-orange-600">
            <Download className="w-4 h-4" />
            下载图片
          </Button>
        </div>
      </div>

      {/* 日报内容 - 可生成图片 */}
      <div
        ref={dailyRef}
        className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden"
        style={{ borderRadius: '16px' }}
      >
        {/* 日报头部 */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Triangle className="w-6 h-6 text-orange-500 fill-current" />
                </div>
                <h1 className="text-3xl font-bold">GlobalNews</h1>
              </div>
              <p className="text-orange-100 text-lg">每日精选 · 全球视野</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{mounted ? currentDate : '加载中...'}</p>
              <p className="text-orange-100">第 {mounted ? issueNumber : '-'} 期</p>
            </div>
          </div>
        </div>

        {/* 日报内容 */}
        <div className="p-8">
          {/* 统计信息 */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-bold text-gray-800">{totalArticles}</p>
                <p className="text-gray-500 text-sm">精选新闻</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{dailyData.length}</p>
                <p className="text-gray-500 text-sm">分类覆盖</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">37</p>
                <p className="text-gray-500 text-sm">新闻来源</p>
              </div>
            </div>
            <div className="text-right text-gray-400 text-sm">
              <p>数据来源于全球主流媒体</p>
              <p>每5分钟自动更新</p>
            </div>
          </div>

          {/* AI 每日总结 */}
          {dailySummary && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AI</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">今日要闻速览</h3>
                    <p className="text-xs text-gray-500">由 DeepSeek AI 智能生成</p>
                  </div>
                </div>

                {/* 总结 */}
                <div className="mb-4 p-4 bg-white/60 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{dailySummary.summary}</p>
                </div>

                {/* 亮点 */}
                {dailySummary.highlights && dailySummary.highlights.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600 mb-2">📌 今日亮点</p>
                    {dailySummary.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-white/60 rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-gray-700 leading-relaxed">{highlight}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 新闻列表 */}
          <div className="space-y-8">
            {dailyData.map((group) => (
              <div key={group.category} className="relative">
                {/* 分类标题 */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-2 h-8 rounded-full"
                    style={{ backgroundColor: categoryColors[group.category] }}
                  />
                  <h2 className="text-xl font-bold text-gray-800">{group.categoryName}</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-sm text-gray-400">{group.articles.length} 条</span>
                </div>

                {/* 该分类的新闻 */}
                <div className="space-y-3 pl-5">
                  {group.articles.map((article, articleIndex) => (
                    <div
                      key={article.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
                        style={{ backgroundColor: categoryColors[group.category] }}
                      >
                        {articleIndex + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-800 font-medium leading-relaxed text-base">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                          <span>{article.sourceName}</span>
                          <span>·</span>
                          <span>{article.viewCount} 阅读</span>
                          {article.isTranslated && (
                            <>
                              <span>·</span>
                              <span className="text-green-500">已翻译</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 日报底部 */}
          <div className="mt-10 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>扫码订阅每日早报</span>
              </div>
              <div className="text-right">
                <p className="text-gray-800 font-bold text-lg">GlobalNews</p>
                <p className="text-gray-400 text-xs">全球实时新闻聚合平台</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
              <p className="text-center text-gray-600 text-sm">
                💡 本日报由 AI 自动聚合生成，覆盖全球 {dailyData.length} 大领域，精选 {totalArticles} 条重要新闻
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="max-w-4xl mx-auto mt-6 text-center">
        <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
          点击&quot;下载图片&quot;按钮将日报保存为高清 PNG 图片
        </p>
      </div>
    </div>
  )
}
