'use client'

import React from 'react'
import Link from 'next/link'
import { Trash2, Star, ArrowLeft, Bookmark } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'
import { Header } from '@/components/Header'

const categoryNames: Record<string, string> = {
  tech: '科技',
  ai: 'AI',
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

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 60) return `${diffMins}分钟前`
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHrs < 24) return `${diffHrs}小时前`
  return `${Math.floor(diffHrs / 24)}天前`
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export default function FavoritesPage() {
  const { favorites, isLoaded, removeFavorite, clearFavorites, favoritesCount } = useFavorites()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 font-bold">加载收藏中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#ff6600] p-3 rounded-2xl shadow-lg shadow-orange-200">
              <Bookmark className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">我的收藏</h1>
              <p className="text-sm text-gray-500 font-medium">共保存了 {favoritesCount} 篇精彩文章</p>
            </div>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 size={16} /> 清空全部
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="text-gray-200 w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">这里空空如也</h2>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto">
              您还没有收藏过任何文章。在首页浏览新闻时，点击星星按钮即可将其保存到这里。
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#ff6600] text-white font-bold rounded-2xl hover:bg-[#ff6600ee] transition-all hover:scale-105 shadow-xl shadow-orange-100"
            >
              <ArrowLeft size={18} /> 去首页看看
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {favorites.map((article) => (
              <div
                key={article.id}
                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#ff660020] transition-all flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#ff6600] px-1.5 py-0.5 rounded bg-orange-50">
                      {categoryNames[article.category] || article.category}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      收藏于 {formatTime(article.addedAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-[#ff6600] transition-colors">
                    <a href={article.originalUrl} target="_blank" rel="noopener noreferrer">
                      {article.title}
                    </a>
                  </h3>
                  <p className="mt-1 text-xs text-gray-400 font-medium">
                    {article.sourceName} • {getDomain(article.originalUrl)}
                  </p>
                </div>
                <button
                  onClick={() => removeFavorite(article.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="取消收藏"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="text-gray-400 text-sm font-bold hover:text-[#ff6600] transition-colors flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> 返回全球新闻首页
          </Link>
        </div>
      </main>
    </div>
  )
}
