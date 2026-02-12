'use client'

import React from 'react'
import Link from 'next/link'
import { ExternalLink, Clock, User, Share2, Star } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'

export interface Article {
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

function formatTime(dateStr: string) {
    if (!dateStr) return ''
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

export function ArticleCard({ article, index, showImage = false }: { article: Article; index: number; showImage?: boolean }) {
    const { isFavorite, toggleFavorite } = useFavorites()
    const favorited = isFavorite(article.id)

    return (
        <article className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:border-[#ff660020] hover:-translate-y-0.5">
            <div className="flex gap-5">
                {/* Index indicator */}
                <div className="hidden sm:flex flex-shrink-0 flex-col items-center">
                    <span className="text-2xl font-black text-gray-50 focus-within:text-orange-100 tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="w-px h-full bg-gray-50 group-hover:bg-orange-50 mt-2 transition-colors"></div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {article.imageUrl && showImage && (
                            <div className="relative flex-shrink-0 w-full sm:w-48 h-32 sm:h-32 overflow-hidden rounded-xl bg-gray-100 border border-gray-50 transition-all group-hover:shadow-md">
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).parentElement!.style.display = 'none'
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#ff660010] text-[#ff6600] border border-[#ff660015]">
                                        {categoryNames[article.category] || article.category}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                        <Clock size={12} /> {formatTime(article.publishedAt)}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium ml-auto sm:ml-0">
                                        <User size={12} /> {article.sourceName}
                                    </span>
                                </div>

                                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug group-hover:text-[#ff6600] transition-colors line-clamp-2">
                                    <Link href={`/article/${article.id}`} className="focus:outline-none">
                                        {article.title}
                                    </Link>
                                </h3>

                                {article.summary && (
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
                                        {article.summary}
                                    </p>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                    <span className="flex items-center gap-1.5 hover:text-gray-600 transition-colors">
                                        {getDomain(article.originalUrl)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            toggleFavorite(article)
                                        }}
                                        className={`p-2 rounded-full transition-all ${favorited
                                                ? 'bg-orange-50 text-[#ff6600] scale-110'
                                                : 'text-gray-300 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Star size={18} fill={favorited ? 'currentColor' : 'none'} />
                                    </button>
                                    <button className="p-2 text-gray-300 hover:bg-gray-50 hover:text-gray-900 rounded-full transition-all">
                                        <Share2 size={18} />
                                    </button>
                                    <a
                                        href={article.originalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-300 hover:bg-orange-50 hover:text-[#ff6600] rounded-full transition-all"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}
