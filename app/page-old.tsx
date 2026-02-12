'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Triangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Article {
  id: string
  title: string
  originalTitle: string
  category: string
  sourceName: string
  originalUrl: string
  publishedAt: string
  viewCount: number
}

// HN Style Header - 中文版
function HNHeader({ onSearch }: { onSearch: (q: string) => void }) {
  const [searchOpen, setSearchOpen] = useState(false)
  
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
                      <Link href="/timeline" className="hn-navlink mr-1">时间轴</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=tech" className="hn-navlink mx-1">科技</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=finance" className="hn-navlink mx-1">财经</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=china" className="hn-navlink mx-1">中国</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=overseas" className="hn-navlink mx-1">海外</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=sports" className="hn-navlink mx-1">体育</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=politics" className="hn-navlink mx-1">政治</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=entertainment" className="hn-navlink mx-1">娱乐</Link>
                      <span className="text-black">|</span>
                      <Link href="/daily" className="hn-navlink mx-1">日报</Link>
                    </span>
                  </td>
                  <td className="text-right">
                    {searchOpen ? (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault()
                          const form = e.target as HTMLFormElement
                          const input = form.querySelector('input') as HTMLInputElement
                          onSearch(input.value)
                        }}
                        className="inline-flex items-center"
                      >
                        <Input 
                          type="text" 
                          placeholder="搜索..." 
                          className="h-6 text-xs w-32 bg-white border-0"
                          autoFocus
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-1 text-black hover:bg-transparent"
                          onClick={() => setSearchOpen(false)}
                        >
                          ✕
                        </Button>
                      </form>
                    ) : (
                      <button 
                        onClick={() => setSearchOpen(true)}
                        className="text-black text-xs hover:underline"
                        style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}
                      >
                        搜索
                      </button>
                    )}
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

// HN Style Story Item - 中文版
function HNStory({ 
  article, 
  index,
  showCategory = true 
}: { 
  article: Article
  index: number
  showCategory?: boolean
}) {
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '')
      return domain
    } catch {
      return article.sourceName
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHrs < 24) return `${diffHrs}小时前`
    return `${Math.floor(diffHrs / 24)}天前`
  }

  const domain = getDomain(article.originalUrl)
  const categoryNames: Record<string, string> = {
    tech: '科技',
    finance: '财经',
    overseas: '海外',
    sports: '体育',
    politics: '政治',
    entertainment: '娱乐',
    health: '健康',
    education: '教育',
    environment: '环境',
    china: '中国',
  }
  
  const categoryColors: Record<string, string> = {
    tech: '#3b82f6',
    finance: '#10b981',
    overseas: '#2563eb',
    sports: '#f59e0b',
    politics: '#ef4444',
    entertainment: '#ec4899',
    health: '#14b8a6',
    education: '#6366f1',
    environment: '#22c55e',
    china: '#dc2626',
  }

  return (
    <tr className="group">
      <td className="align-top text-right pr-1" style={{ color: '#828282', fontSize: '10pt' }}>
        <span className="text-[#828282]">{index}.</span>
      </td>
      <td className="align-top pl-1 pr-2">
        <div className="hn-votearrow cursor-pointer hover:opacity-80" />
      </td>
      <td className="align-top">
        <div className="leading-tight">
          {/* Title line */}
          <div className="mb-0.5">
            <Link 
              href={`/article/${article.id}`}
              className="text-black hover:underline"
              style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt' }}
            >
              {article.title}
            </Link>
            <span className="text-xs ml-1" style={{ color: '#828282' }}>
              (<a 
                href={article.originalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#828282' }}
              >
                {domain}
              </a>)
            </span>
            {showCategory && (
              <span 
                className="text-[9px] ml-2 px-1 py-0.5 text-white rounded-sm"
                style={{ backgroundColor: categoryColors[article.category] || '#828282' }}
              >
                {categoryNames[article.category] || article.category}
              </span>
            )}
          </div>
          
          {/* Subtext line */}
          <div className="text-xs" style={{ color: '#828282', fontFamily: 'Verdana, Geneva, sans-serif' }}>
            {article.viewCount} 次阅读 · {article.sourceName} · {formatTime(article.publishedAt)} · 
            <Link href={`/article/${article.id}`} className="hover:underline ml-1" style={{ color: '#828282' }}>
              讨论
            </Link>
          </div>
        </div>
      </td>
    </tr>
  )
}

// HN Style Footer - 中文版
function HNFooter() {
  return (
    <div className="py-4 text-center" style={{ borderTop: '2px solid #ff6600' }}>
      <div className="text-xs mb-2" style={{ color: '#828282' }}>
        <Link href="/" className="hover:underline" style={{ color: '#828282' }}>使用指南</Link>
        <span className="mx-1">|</span>
        <Link href="/daily" className="hover:underline" style={{ color: '#828282' }}>每日日报</Link>
        <span className="mx-1">|</span>
        <Link href="/" className="hover:underline" style={{ color: '#828282' }}>新闻源</Link>
        <span className="mx-1">|</span>
        <Link href="/" className="hover:underline" style={{ color: '#828282' }}>API</Link>
        <span className="mx-1">|</span>
        <Link href="/" className="hover:underline" style={{ color: '#828282' }}>关于我们</Link>
        <span className="mx-1">|</span>
        <Link href="/" className="hover:underline" style={{ color: '#828282' }}>联系方式</Link>
      </div>
      <div className="text-xs" style={{ color: '#828282' }}>
        搜索: <input type="text" className="border border-[#828282] px-1 text-xs" style={{ backgroundColor: '#f6f6ef' }} />
      </div>
    </div>
  )
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

    // 从URL获取分类 - 简化版本
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const category = urlParams.get('category')
    const newCategory = category || ''

    // 只在分类真正改变时更新状态
    if (newCategory !== activeCategory) {
      setActiveCategory(newCategory)
    }
  }, [activeCategory])

  // 加载新闻列表
  const loadArticles = useCallback(async () => {
    console.log("Loading articles for category:", activeCategory);
    setIsLoading(true)
    
    try {
      const params = new URLSearchParams()
      if (activeCategory) {
        params.set('category', activeCategory)
      }
      if (searchQuery) {
        params.set('search', searchQuery)
      }
      params.set('page', page.toString())
      params.set('limit', '30')
      
      const response = await fetch(`/api/articles?${params}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
      }
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setIsLoading(false)
    }
  }, [activeCategory, searchQuery, page])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6ef' }}>
      <center>
        <table className="w-full max-w-[85%]" style={{ backgroundColor: '#f6f6ef' }} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td>
                {/* Header */}
                <HNHeader onSearch={setSearchQuery} />
                
                {/* Spacer */}
                <div style={{ height: '10px' }} />
                
                {/* News List */}
                <table className="w-full" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center" style={{ color: '#828282' }}>
                          加载中...
                        </td>
                      </tr>
                    ) : articles.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center" style={{ color: '#828282' }}>
                          暂无新闻
                        </td>
                      </tr>
                    ) : (
                      <>
                        {articles.map((article, index) => (
                          <HNStory 
                            key={article.id} 
                            article={article} 
                            index={(page - 1) * 30 + index + 1}
                            showCategory={!activeCategory}
                          />
                        ))}
                        
                        {/* More link */}
                        <tr>
                          <td colSpan={3} className="py-4 pl-10">
                            <button 
                              className="text-black hover:underline"
                              style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt' }}
                              onClick={() => setPage(p => p + 1)}
                            >
                              加载更多
                            </button>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
                
                {/* Footer */}
                <HNFooter />
              </td>
            </tr>
          </tbody>
        </table>
      </center>
    </div>
  )
}
