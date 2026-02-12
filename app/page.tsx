'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { ArticleCard, Article } from '@/components/ArticleCard'
import { Newspaper, Loader2, RefreshCcw, ArrowUp } from 'lucide-react'
import Link from 'next/link'

// 骨架屏组件
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl h-48 sm:h-32 w-full border border-gray-100" />
      ))}
    </div>
  )
}

function NewsList() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const searchParams = useSearchParams()
  const category = searchParams.get('category') || ''

  const loadNews = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true)

    try {
      let url = ''
      if (category === 'live') {
        url = '/api/external-news?language=en&category=top'
      } else {
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

        // External API (Live News) doesn't support pagination the same way for now
        if (category === 'live') {
          setHasMore(false)
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
      // Show/hide scroll to top button
      if (window.scrollY > 1000) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }

      // Infinite scroll
      if (category === 'live') return
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        if (!isLoading && hasMore) {
          setPage(prev => {
            const nextPage = prev + 1
            loadNews(nextPage, true)
            return nextPage
          })
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoading, hasMore, loadNews, category])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading && articles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="space-y-4">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Newspaper size={64} className="text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold">暂无相关新闻</p>
            <button
              onClick={() => loadNews(1, false)}
              className="mt-4 text-[#ff6600] font-bold hover:underline flex items-center gap-2"
            >
              <RefreshCcw size={16} /> 刷新重试
            </button>
          </div>
        ) : (
          articles.map((article, index) => (
            <ArticleCard
              key={`${article.id}-${index}`}
              article={article}
              index={index}
              showImage={category === 'live'}
            />
          ))
        )}

        {isLoading && articles.length > 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-[#ff6600]" size={32} />
          </div>
        )}

        {!hasMore && articles.length > 0 && category !== 'live' && (
          <div className="text-center py-12">
            <div className="inline-block px-6 py-2 bg-gray-50 rounded-full text-xs font-bold text-gray-400 border border-gray-100">
              🎉 你已经看完了全部新闻
            </div>
          </div>
        )}
      </div>

      {/* Back to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-white shadow-2xl rounded-2xl border border-gray-100 text-gray-900 hover:bg-gray-50 hover:text-[#ff6600] transition-all hover:-translate-y-1 z-50 animate-in fade-in slide-in-from-bottom"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || ''

  return (
    <>
      <Header currentCategory={category} />

      {/* Optional Hero for Home */}
      {!category && (
        <section className="bg-gray-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10 scale-110"></div>
          <div className="max-w-7xl mx-auto px-4 py-12 sm:py-20 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight leading-tight">
                掌握全球动态 <br />
                <span className="text-[#ff6600]">只在一指之间</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 font-medium mb-10 leading-relaxed">
                为您聚合世界各地的优质新闻，实时翻译，去繁就简。跨越语言障碍，洞察全球真相。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/daily" className="px-8 py-4 bg-[#ff6600] hover:bg-[#ff6600cc] text-white font-bold rounded-2xl transition-all hover:scale-[1.02] shadow-xl shadow-orange-900/40">
                  查看今日日报
                </Link>
                <Link href="/favorites" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md transition-all border border-white/10">
                  我的收藏
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="bg-gray-50/50 min-h-screen">
        <Suspense fallback={<div className="max-w-4xl mx-auto p-8"><LoadingSkeleton /></div>}>
          <NewsList />
        </Suspense>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center gap-6 mb-8 text-sm font-bold text-gray-400">
            <Link href="/api/cron/fetch" className="hover:text-[#ff6600] transition-colors">手动刷新</Link>
            <Link href="/daily" className="hover:text-[#ff6600] transition-colors">每日总结</Link>
            <Link href="/api/rss" className="hover:text-[#ff6600] transition-colors">RSS FEED</Link>
          </div>
          <p className="text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em]">
            © 2026 GLOBAL NEWS EXPERIMENTAL PROJECT - POWERED BY AI
          </p>
        </div>
      </footer>
    </>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#ff6600]" /></div>}>
        <HomeContent />
      </Suspense>
    </div>
  )
}
