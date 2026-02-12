'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Triangle } from 'lucide-react'

interface Article {
  id: string
  title: string
  originalTitle: string
  summary?: string
  category: string
  sourceName: string
  originalUrl: string
  imageUrl?: string
  publishedAt: string
  viewCount: number
}

// 分类配置
const categories = [
  { id: '', name: '全部', color: '#ff6600' },
  { id: 'live', name: '实时热点', color: '#ff0000' }, // New Live News Category
  { id: 'ai', name: 'AI', color: '#8b5cf6' },
  { id: 'tech', name: '科技', color: '#3b82f6' },
  { id: 'finance', name: '财经', color: '#10b981' },
  { id: 'china', name: '中国', color: '#dc2626' },
  { id: 'overseas', name: '国际', color: '#2563eb' },
  { id: 'sports', name: '体育', color: '#f59e0b' },
  { id: 'politics', name: '政治', color: '#ef4444' },
  { id: 'entertainment', name: '娱乐', color: '#ec4899' },
]

// HN Style Header Component
function HNHeader({ currentCategory }: { currentCategory: string }) {
  const currentCat = categories.find(c => c.id === currentCategory)

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
                      {currentCat ? currentCat.name : '全部新闻'}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link href="/map" className="text-black text-xs hover:underline mr-2" style={{ fontSize: '10pt' }}>
                      地图
                    </Link>
                    <Link href="/timeline" className="text-black text-xs hover:underline mr-2" style={{ fontSize: '10pt' }}>
                      时间轴
                    </Link>
                    <Link href="/daily" className="text-black text-xs hover:underline mr-2" style={{ fontSize: '10pt' }}>
                      日报
                    </Link>
                    <Link href="/favorites" className="text-black text-xs hover:underline" style={{ fontSize: '10pt' }}>
                      收藏
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td style={{ padding: '2px', backgroundColor: '#ff6600' }}>
            <div className="flex items-center gap-1 px-1 overflow-x-auto whitespace-nowrap">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.id ? `/?category=${cat.id}` : '/'}
                  className="text-black text-xs hover:underline px-1"
                  style={{
                    fontSize: '10pt',
                    fontWeight: currentCategory === cat.id ? 'bold' : 'normal'
                  }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

// 骨架屏组件
function LoadingSkeleton() {
  return (
    <div style={{ color: '#828282', padding: '20px', textAlign: 'center' }}>
      加载中...
    </div>
  )
}

// 新闻列表组件
function NewsList() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || ''

  const loadNews = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true)

    try {
      let url = ''
      if (category === 'live') {
        // Use the new external-news API for "Live News"
        url = '/api/external-news?language=en&category=top'
      } else {
        // Use the existing API for other categories
        const apiParams = new URLSearchParams()
        if (category) apiParams.set('category', category)
        apiParams.set('limit', '30')
        apiParams.set('page', pageNum.toString())
        url = `/api/articles?${apiParams}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const newArticles = data.articles || []

        if (append) {
          setArticles(prev => [...prev, ...newArticles])
        } else {
          setArticles(newArticles)
        }

        // External API (Live News) might doesn't support pagination the same way
        if (category === 'live') {
          setHasMore(false); // For now, disable "load more" for live news as it's a single fetch
        } else {
          setHasMore(newArticles.length === 30)
        }
      }
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setIsLoading(false)
    }
  }, [category])

  useEffect(() => {
    setPage(1)
    loadNews(1, false)
  }, [category, loadNews])

  useEffect(() => {
    const handleScroll = () => {
      // Disable infinite scroll for "live" category for now
      if (category === 'live') return

      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        if (!isLoading && hasMore) {
          setPage(prev => prev + 1)
          loadNews(page + 1, true)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoading, hasMore, page, loadNews, category])

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return ''
    }
  }

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 60) return `${diffMins}分钟前`
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHrs < 24) return `${diffHrs}小时前`
    return `${Math.floor(diffHrs / 24)}天前`
  }

  const categoryNames: Record<string, string> = {
    live: '实时热点',
    tech: '科技',
    ai: 'AI',
    finance: '财经',
    overseas: '海外',
    china: '中国',
    sports: '体育',
    politics: '政治',
    entertainment: '娱乐',
  }

  if (isLoading && articles.length === 0) {
    return <LoadingSkeleton />
  }

  return (
    <table className="w-full" cellPadding={0} cellSpacing={0}>
      <tbody>
        {articles.length === 0 ? (
          <tr>
            <td className="p-4 text-center" style={{ color: '#828282' }}>
              暂无新闻
            </td>
          </tr>
        ) : (
          articles.map((article, index) => (
            <tr key={article.id} className="group">
              <td className="align-top text-right pr-1 py-4" style={{ color: '#828282', fontSize: '10pt', width: '30px' }}>
                {index + 1}.
              </td>
              <td className="align-top pl-1 py-4 border-b border-[#eee] last:border-0 group-hover:bg-[#fcfcfa] transition-colors duration-200">
                <div className={`flex gap-5 ${category === 'live' ? 'items-start' : 'items-baseline'}`}>
                  {/* 左侧缩略图：仅在实时热点分类且有图时展示 */}
                  {article.imageUrl && category === 'live' && (
                    <div className="flex-shrink-0 w-28 h-20 sm:w-36 sm:h-24 overflow-hidden rounded bg-gray-200 border border-gray-100 mt-1 shadow-sm">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="leading-tight">
                      <Link
                        href={category === 'live' ? article.originalUrl : `/article/${article.id}`}
                        target={category === 'live' ? "_blank" : "_self"}
                        className="text-black hover:underline font-medium block sm:inline"
                        style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10.5pt', lineHeight: '1.4' }}
                      >
                        {article.title}
                      </Link>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-orange-50" style={{ color: '#ff6600', border: '1px solid #ff660040' }}>
                          {categoryNames[article.category] || article.category}
                        </span>
                        <span className="text-xs" style={{ color: '#828282' }}>
                          ({getDomain(article.originalUrl)})
                        </span>
                        <span className="text-xs" style={{ color: '#828282' }}>
                          • {formatTime(article.publishedAt)}
                        </span>
                      </div>

                      {/* 展示详细摘要 */}
                      {article.summary && category === 'live' && (
                        <div className="mt-2 text-xs text-[#444] leading-relaxed line-clamp-2 sm:line-clamp-3"
                          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          {article.summary}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))
        )}
        {isLoading && articles.length > 0 && (
          <tr>
            <td colSpan={2} className="p-2 text-center" style={{ color: '#828282', fontSize: '10pt' }}>
              加载更多...
            </td>
          </tr>
        )}
        {(!hasMore && articles.length > 0 && category !== 'live') && (
          <tr>
            <td colSpan={2} className="p-2 text-center" style={{ color: '#828282', fontSize: '10pt' }}>
              已加载全部内容
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

// 主内容组件 (使用 useSearchParams)
function HomeContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || ''

  return (
    <>
      <HNHeader currentCategory={category} />

      <div style={{ height: '10px' }} />

      <Suspense fallback={<LoadingSkeleton />}>
        <NewsList />
      </Suspense>

      <div className="py-4 text-center" style={{ borderTop: '2px solid #ff6600', marginTop: '20px' }}>
        <Link href="/api/cron/fetch" className="hover:underline text-xs mr-4" style={{ color: '#828282' }}>
          刷新数据
        </Link>
        <Link href="/daily" className="hover:underline text-xs" style={{ color: '#828282' }}>
          每日日报
        </Link>
      </div>
    </>
  )
}

// 主页面
export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6ef' }}>
      <center>
        <table className="w-full max-w-[85%]" style={{ backgroundColor: '#f6f6ef' }} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td>
                <Suspense fallback={<LoadingSkeleton />}>
                  <HomeContent />
                </Suspense>
              </td>
            </tr>
          </tbody>
        </table>
      </center>
    </div>
  )
}
