'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Triangle } from 'lucide-react'

interface Article {
  id: string
  title: string
  category: string
  sourceName: string
  originalUrl: string
  publishedAt: string
  viewCount: number
}

interface TimelineGroup {
  hour: string
  label: string
  articles: Article[]
}

// HN Style Header
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
                    <span className="text-xs">
                      <span className="text-black">24小时时间轴</span>
                    </span>
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

export default function TimelinePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadArticles = useCallback(async () => {
    try {
      const response = await fetch('/api/articles?limit=300')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
      }
    } catch (error) {
      console.error('Error loading timeline:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  // 按时间倒序分组
  const grouped = articles.reduce<TimelineGroup[]>((acc, article) => {
    const date = new Date(article.publishedAt)
    // 获取每个小时的时间戳用于排序和唯一标识
    date.setMinutes(0, 0, 0)
    const timestamp = date.getTime()

    // 格式化显示时间
    const now = new Date()
    const isToday = date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    const hourStr = date.getHours().toString().padStart(2, '0') + ':00'
    const displayTime = isToday ? hourStr : `昨天 ${hourStr}` // 简单处理跨天，更严谨可以用日期

    // 扩展 TimelineGroup 接口以包含 timestamp (虽然 interface 没定义，但在 JS reduce 中暂时存着用于排序，或者我们改 interface)
    // 更好的方式是直接用 hour 字段存显示文本，或者加个 sortKey

    let group = acc.find(g => g.hour === displayTime) // 这里我们用 displayTime 作为 key 简单合并
    // Wait, 如果是前天呢？最好还是用 timestamp 或者 full date string 作为 key。
    // 让我们用 full key
    const groupKey = date.toISOString()

    group = acc.find(g => (g as any)._ts === timestamp)

    if (group) {
      group.articles.push(article)
    } else {
      acc.push({
        hour: displayTime,
        label: getHourLabel(date.getHours()),
        articles: [article],
        // @ts-ignore
        _ts: timestamp
      })
    }
    return acc
  }, [])

  // 按时间倒序排序
  grouped.sort((a, b) => (b as any)._ts - (a as any)._ts)

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return ''
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 60) return `${diffMins}分钟前`
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHrs < 24) return `${diffHrs}小时前`
    return `${Math.floor(diffHrs / 24)}天前`
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6ef' }}>
      <center>
        <table className="w-full max-w-[85%]" style={{ backgroundColor: '#f6f6ef' }} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td>
                <HNHeader />

                <div style={{ height: '10px' }} />

                <table className="w-full" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="p-4 text-center" style={{ color: '#828282' }}>
                          加载中...
                        </td>
                      </tr>
                    ) : (
                      grouped.map((group) => (
                        <tr key={group.hour}>
                          <td className="py-2">
                            <div className="mb-2 font-bold text-sm" style={{ color: '#ff6600' }}>
                              {group.hour} {group.label} ({group.articles.length}条)
                            </div>
                            <table className="w-full" cellPadding={0} cellSpacing={0}>
                              <tbody>
                                {group.articles.map((article, idx) => (
                                  <tr key={article.id} className="group">
                                    <td className="align-top text-right pr-1" style={{ color: '#828282', fontSize: '10pt', width: '20px' }}>
                                      {idx + 1}.
                                    </td>
                                    <td className="align-top pl-1">
                                      <div className="leading-tight">
                                        <Link
                                          href={`/article/${article.id}`}
                                          className="text-black hover:underline"
                                          style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt' }}
                                        >
                                          {article.title}
                                        </Link>
                                        <span className="text-xs ml-1" style={{ color: '#828282' }}>
                                          ({getDomain(article.originalUrl)}) {formatTime(article.publishedAt)} | {categoryNames[article.category] || article.category}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="py-4 text-center" style={{ borderTop: '2px solid #ff6600' }}>
                  <Link href="/" className="hover:underline text-xs" style={{ color: '#828282' }}>
                    返回首页
                  </Link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </center>
    </div>
  )
}

function getHourLabel(hour: number): string {
  if (hour >= 6 && hour < 12) return '上午'
  if (hour >= 12 && hour < 14) return '中午'
  if (hour >= 14 && hour < 18) return '下午'
  if (hour >= 18 && hour < 22) return '晚上'
  return '深夜'
}
