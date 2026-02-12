'use client'

import React from 'react'
import Link from 'next/link'
import { Triangle, Menu, Search, Clock, Award, Star, Map as MapIcon } from 'lucide-react'

export const categories = [
    { id: '', name: '全部', color: '#ff6600' },
    { id: 'live', name: '实时热点', color: '#ff4d4f' },
    { id: 'ai', name: 'AI', color: '#8b5cf6' },
    { id: 'tech', name: '科技', color: '#3b82f6' },
    { id: 'finance', name: '财经', color: '#10b981' },
    { id: 'china', name: '中国', color: '#dc2626' },
    { id: 'overseas', name: '国际', color: '#2563eb' },
    { id: 'sports', name: '体育', color: '#f59e0b' },
    { id: 'politics', name: '政治', color: '#ef4444' },
    { id: 'entertainment', name: '娱乐', color: '#ec4899' },
]

interface HeaderProps {
    currentCategory?: string
}

export function Header({ currentCategory = '' }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
            <div className="bg-[#ff6600] text-white py-1.5 px-4 hidden sm:block">
                <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] font-medium tracking-wider uppercase">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Clock size={12} /> 实时更新</span>
                        <span className="flex items-center gap-1"><Award size={12} /> 优质采编</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/about" className="hover:text-black transition-colors">关于我们</Link>
                        <Link href="/api/rss" className="hover:text-black transition-colors">RSS 订阅</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
                            <div className="bg-[#ff6600] p-1.5 rounded-lg shadow-lg group-hover:rotate-12 transition-transform duration-300">
                                <Triangle className="w-5 h-5 text-white fill-current" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-gray-900 leading-none">全球新闻</span>
                                <span className="text-[10px] text-[#ff6600] font-bold uppercase tracking-widest mt-0.5">Global News</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/map" className="flex items-center gap-1.5 text-gray-600 hover:text-[#ff6600] font-medium transition-colors py-2 group">
                            <MapIcon size={18} className="group-hover:animate-bounce" />
                            <span>全球地图</span>
                        </Link>
                        <Link href="/timeline" className="flex items-center gap-1.5 text-gray-600 hover:text-[#ff6600] font-medium transition-colors py-2 group">
                            <Clock size={18} />
                            <span>时间轴</span>
                        </Link>
                        <Link href="/daily" className="flex items-center gap-1.5 text-gray-600 hover:text-[#ff6600] font-medium transition-colors py-2 group">
                            <Award size={18} />
                            <span>每日日报</span>
                        </Link>
                        <Link href="/favorites" className="flex items-center gap-1.5 text-gray-600 hover:text-[#ff6600] font-medium transition-colors py-2 group">
                            <Star size={18} />
                            <span>我的收藏</span>
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
                            <Search size={20} />
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-gray-900 hover:bg-gray-50 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>

                {/* Categories Bar */}
                <div className="flex items-center gap-1 pb-4 overflow-x-auto no-scrollbar scroll-smooth">
                    {categories.map((cat) => {
                        const isActive = currentCategory === cat.id
                        return (
                            <Link
                                key={cat.id}
                                href={cat.id ? `/?category=${cat.id}` : '/'}
                                className={`
                  relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${isActive
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }
                `}
                            >
                                {cat.name}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-2xl animate-in slide-in-from-top duration-300">
                    <div className="p-6 space-y-4">
                        <Link href="/map" className="flex items-center gap-3 text-lg font-semibold text-gray-900 p-2 hover:bg-orange-50 rounded-lg transition-colors">
                            <MapIcon className="text-[#ff6600]" /> 全球地图
                        </Link>
                        <Link href="/timeline" className="flex items-center gap-3 text-lg font-semibold text-gray-900 p-2 hover:bg-orange-50 rounded-lg transition-colors">
                            <Clock className="text-[#ff6600]" /> 时间轴
                        </Link>
                        <Link href="/daily" className="flex items-center gap-3 text-lg font-semibold text-gray-900 p-2 hover:bg-orange-50 rounded-lg transition-colors">
                            <Award className="text-[#ff6600]" /> 每日日报
                        </Link>
                        <Link href="/favorites" className="flex items-center gap-3 text-lg font-semibold text-gray-900 p-2 hover:bg-orange-50 rounded-lg transition-colors">
                            <Star className="text-[#ff6600]" /> 我的收藏
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}
