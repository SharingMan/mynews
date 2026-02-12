'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { toPng } from 'html-to-image'
import { Triangle } from 'lucide-react'

// HN Header Component (Reused Inline for Consistency)
function HNHeader() {
  return (
    <table className="w-full border-0 p-0" style={{ backgroundColor: '#ff6600' }} cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr>
          <td style={{ padding: '2px' }}>
            <table className="w-full border-0 p-0" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={{ width: '18px', paddingRight: '4px' }}>
                    <Link href="/" className="flex items-center justify-center">
                      <div className="w-5 h-5 border border-white flex items-center justify-center bg-white">
                        <Triangle className="w-3 h-3 text-[#ff6600] fill-current" />
                      </div>
                    </Link>
                  </td>
                  <td className="leading-none">
                    <span className="font-bold mr-1">
                      <Link href="/" className="text-black hover:underline" style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt' }}>
                        全球新闻
                      </Link>
                    </span>
                    <span className="text-xs text-black">
                      日报
                    </span>
                  </td>
                  <td className="text-right">
                    <Link href="/" className="text-black text-xs hover:underline mr-2" style={{ fontSize: '10pt' }}>
                      首页
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

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

export default function DailyPage() {
  const [dailyData, setDailyData] = useState<DailyGroup[]>([])
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState('')
  const dailyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const today = new Date()
    setCurrentDate(today.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }))
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
        pixelRatio: 2,
        backgroundColor: '#f6f6ef',
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
      <div className="p-4 text-center" style={{ color: '#828282' }}>
        正在生成日报...
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6ef' }}>
      <center>
        <table className="w-full max-w-[85%]" style={{ backgroundColor: '#f6f6ef' }} cellPadding={0} cellSpacing={0}>
          <tbody>
            {/* Navigation Header */}
            <tr>
              <td>
                <HNHeader />
              </td>
            </tr>

            {/* Actions */}
            <tr>
              <td className="p-2 text-right">
                <button
                  onClick={handleDownload}
                  className="text-xs hover:underline mr-4"
                  style={{ color: '#000' }}
                >
                  [下载长图]
                </button>
                <button
                  onClick={loadData}
                  className="text-xs hover:underline"
                  style={{ color: '#828282' }}
                >
                  刷新数据
                </button>
              </td>
            </tr>

            {/* Daily Report Content */}
            <tr>
              <td>
                <div ref={dailyRef} style={{ backgroundColor: '#f6f6ef', padding: '10px' }}>
                  {/* Report Header */}
                  <div style={{ borderBottom: '2px solid #ff6600', paddingBottom: '10px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '18pt', fontWeight: 'bold', fontFamily: 'Verdana, Geneva, sans-serif' }}>
                      GlobalNews Daily
                    </div>
                    <div style={{ color: '#828282', fontSize: '10pt' }}>
                      {currentDate} · 聚合全球 {dailySummary?.totalArticles || 0} 条新闻
                    </div>
                  </div>

                  {/* AI Summary */}
                  {dailySummary && (
                    <div style={{ marginBottom: '25px', backgroundColor: '#fff', padding: '15px', border: '1px solid #e5e5e5' }}>
                      <div style={{ color: '#ff6600', fontWeight: 'bold', marginBottom: '8px', fontSize: '10pt' }}>
                        AI 每日洞察
                      </div>
                      <div style={{ fontSize: '10pt', lineHeight: '1.6', color: '#000' }}>
                        {dailySummary.summary}
                      </div>
                    </div>
                  )}

                  {/* News Sections */}
                  {dailyData.map((group) => (
                    <div key={group.category} style={{ marginBottom: '20px' }}>
                      <div style={{
                        backgroundColor: '#ff6600',
                        color: 'white',
                        padding: '3px 8px',
                        fontSize: '10pt',
                        display: 'inline-block',
                        marginBottom: '8px',
                        fontWeight: 'bold'
                      }}>
                        {group.categoryName}
                      </div>

                      <table className="w-full" cellPadding={0} cellSpacing={0}>
                        <tbody>
                          {group.articles.map((article, idx) => (
                            <tr key={article.id}>
                              <td className="align-top pr-2 py-1" style={{ color: '#828282', fontSize: '10pt', width: '20px' }}>
                                {idx + 1}.
                              </td>
                              <td className="align-top py-1">
                                <div style={{ fontSize: '10pt', lineHeight: '1.4' }}>
                                  <span style={{ color: '#000' }}>{article.title}</span>
                                  <span style={{ color: '#828282', fontSize: '8pt', marginLeft: '5px' }}>
                                    ({article.sourceName})
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}

                  {/* Report Footer */}
                  <div style={{
                    marginTop: '30px',
                    borderTop: '1px solid #ff6600',
                    paddingTop: '10px',
                    textAlign: 'center',
                    fontSize: '9pt',
                    color: '#828282'
                  }}>
                    GlobalNews Intelligent Aggregator · Generated on {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </center>
    </div>
  )
}
