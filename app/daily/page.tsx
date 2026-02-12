'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { Download, RefreshCw, Share2, Calendar, Newspaper, ArrowLeft, Triangle, Sparkles, Quote } from 'lucide-react'
import { toPng } from 'html-to-image'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'

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
  ai: 'AI 纵览',
  finance: '财经要闻',
  overseas: '海外视野',
  sports: '体育赛事',
  politics: '政治动态',
  entertainment: '娱乐资讯',
  health: '健康生活',
  education: '教育文化',
  environment: '环境保护',
  china: '中国新闻',
}

const categoryColors: Record<string, string> = {
  tech: '#3b82f6',
  ai: '#8b5cf6',
  finance: '#10b981',
  overseas: '#8b5cf6',
  sports: '#f59e0b',
  politics: '#ef4444',
  entertainment: '#ec4899',
  health: '#14b8a6',
  education: '#6366f1',
  environment: '#22c55e',
  china: '#de3a3a',
}

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
  const [currentDate, setCurrentDate] = useState('')
  const [issueNumber, setIssueNumber] = useState(1)
  const dailyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const today = new Date()
    setCurrentDate(today.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }))
    setIssueNumber(getIssueNumber())
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [newsRes, summaryRes] = await Promise.all([
        fetch('/api/articles?daily=true&limit=50'),
        fetch('/api/daily-summary')
      ])

      if (newsRes.ok) {
        const data = await newsRes.json()
        const grouped: Record<string, Article[]> = {}
        data.articles.forEach((article: Article) => {
          if (!grouped[article.category]) grouped[article.category] = []
          if (grouped[article.category].length < 5) grouped[article.category].push(article)
        })

        const result: DailyGroup[] = Object.entries(grouped)
          .map(([category, articles]) => ({
            category,
            categoryName: categoryNames[category] || category,
            articles,
          }))
          .filter(g => g.articles.length > 0)
          .sort((a, b) => b.articles.length - a.articles.length)
          .slice(0, 8)

        setDailyData(result)
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setDailySummary(data)
      }
    } catch (error) {
      console.error('Error loading daily content:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDownload = useCallback(async () => {
    if (!dailyRef.current) return

    try {
      const dataUrl = await toPng(dailyRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      })

      const link = document.createElement('a')
      link.download = `GlobalNews-Daily-${new Date().toISOString().split('T')[0]}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to generate image:', err)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <RefreshCw className="w-10 h-10 animate-spin text-[#ff6600]" />
          <p className="text-gray-400 font-black animate-pulse uppercase tracking-widest text-xs">正在深度聚合今日资讯...</p>
        </div>
      </div>
    )
  }

  const totalArticlesCount = dailyData.reduce((acc, g) => acc + g.articles.length, 0)

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center bg-white border-b border-gray-100 gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-bold text-gray-500 hover:text-[#ff6600]">
              <ArrowLeft className="w-4 h-4 mr-1" /> 返回首页
            </Button>
          </Link>
          <div className="h-4 w-px bg-gray-200"></div>
          <span className="text-sm font-bold text-gray-400">DAILY DIGEST</span>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadData} variant="outline" size="sm" className="font-bold border-gray-200">
            <RefreshCw className="w-4 h-4 mr-2" /> 刷新数据
          </Button>
          <Button onClick={handleDownload} size="sm" className="bg-[#ff6600] border-0 hover:bg-[#ff6600ee] text-white font-bold shadow-lg shadow-orange-100 transition-all active:scale-95">
            <Download className="w-4 h-4 mr-2" /> 生成精美长图
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto shadow-2xl shadow-gray-200/50 rounded-[2rem] overflow-hidden bg-white border border-gray-100" ref={dailyRef}>
        {/* Header Section */}
        <section className="bg-gray-900 px-10 py-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Newspaper size={240} className="text-white" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-end gap-6 text-white">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#ff6600] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/20">
                <Sparkles size={12} className="fill-current" /> Daily Issue
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-2xl">
                  <Triangle className="w-10 h-10 text-[#ff6600] fill-current" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight leading-none">GlobalNews</h1>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1.5">全球实时新闻聚合 · 精华版</p>
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 text-right">
                <p className="text-3xl font-black tabular-nums leading-none mb-1">{currentDate.split('日')[0]}日</p>
                <p className="text-orange-500 font-bold text-sm tracking-widest">{currentDate.split('日')[1]?.trim() || ''}</p>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-end gap-2 text-gray-500 font-bold uppercase tracking-tighter text-[10px]">
                  <span>ISSUE NO.</span>
                  <span className="bg-[#ff6600] text-white px-1.5 rounded">{issueNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="p-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12 border-b border-gray-50 pb-12">
            <div className="space-y-1">
              <p className="text-4xl font-black text-gray-900 tabular-nums">{totalArticlesCount}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">精选新闻条目</p>
            </div>
            <div className="space-y-1 border-l border-gray-50 pl-6 sm:pl-8">
              <p className="text-4xl font-black text-gray-900 tabular-nums">{dailyData.length}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">深度分类覆盖</p>
            </div>
            <div className="space-y-1 border-l border-gray-50 pl-6 sm:pl-8 hidden sm:block">
              <p className="text-4xl font-black text-gray-900 tabular-nums">37</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">权威新闻来源</p>
            </div>
            <div className="space-y-1 border-l border-gray-50 pl-8 hidden sm:block">
              <p className="text-4xl font-black text-gray-900 tabular-nums">41</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">分钟更新频率</p>
            </div>
          </div>

          {/* AI Insights Section */}
          {dailySummary && (
            <section className="mb-16">
              <div className="bg-gray-50 rounded-[2.5rem] p-8 sm:p-10 relative group overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 p-8 text-gray-100 -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700">
                  <Sparkles size={200} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                      <Quote className="text-[#ff6600] w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI 每日洞察</h2>
                      <p className="text-[10px] text-[#ff6600] font-black uppercase tracking-widest">Powered by DeepSeek Intelligent Analysis</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 sm:p-8 mb-8 shadow-sm border border-gray-100/50">
                    <p className="text-lg text-gray-700 leading-relaxed font-medium">
                      {dailySummary.summary}
                    </p>
                  </div>

                  {dailySummary.highlights && dailySummary.highlights.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {dailySummary.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-orange-100 transition-all">
                          <span className="flex-shrink-0 w-8 h-8 bg-gray-900 text-[#ff6600] text-xs rounded-xl flex items-center justify-center font-black">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <p className="text-sm text-gray-600 leading-relaxed font-bold">
                            {highlight}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Categorized News List */}
          <div className="grid md:grid-cols-2 gap-12">
            {dailyData.map((group) => (
              <div key={group.category} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-10 rounded-full" style={{ backgroundColor: categoryColors[group.category] || '#ff6600' }} />
                  <div>
                    <h3 className="text-xl font-black text-gray-900 leading-none">{group.categoryName}</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5">{group.category.toUpperCase()} SECTION</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {group.articles.map((article, articleIndex) => (
                    <div key={article.id} className="group flex gap-4 p-4 rounded-xl border border-transparent hover:border-gray-50 hover:bg-gray-50/50 transition-all">
                      <span className="text-xs font-black text-gray-100 group-hover:text-gray-200 tabular-nums">
                        {(articleIndex + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[15px] font-bold text-gray-800 leading-snug group-hover:text-[#ff6600] transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          <span className="truncate">{article.sourceName}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <span>{article.viewCount} READS</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer of the Report */}
          <footer className="mt-20 pt-10 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-900 rounded-3xl p-4 flex items-center justify-center">
                  <Triangle className="text-[#ff6600] fill-current" />
                </div>
                <div>
                  <p className="text-gray-900 font-black text-xl tracking-tighter">GlobalNews</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Intelligent News Aggregator</p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 text-[11px] font-bold text-gray-500 mb-2">
                  <Calendar size={14} className="text-[#ff6600]" /> 实时扫描全球主流媒体
                </div>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">Designed for clarity and insight</p>
              </div>
            </div>
            <div className="mt-10 p-5 bg-[#ff660010] rounded-2xl border border-[#ff660008]">
              <p className="text-center text-[#ff6600] text-[11px] font-black uppercase tracking-widest leading-relaxed">
                本报由人工智能算法自动聚合生成 · 基于全球新闻源 · 每 5 分钟深度更新
              </p>
            </div>
          </footer>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 text-gray-500 font-bold transition-transform hover:scale-105">
          <Share2 className="w-4 h-4 text-[#ff6600]" />
          <span className="text-sm">点击 &quot;生成精美长图&quot; 即可分享给您的朋友</span>
        </div>
      </div>
    </div>
  )
}
