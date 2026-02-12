'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  sourceName: string
  category: string
  publishedAt: string
  originalUrl: string
}

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/articles?search=${encodeURIComponent(searchQuery)}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.articles || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // ESC 关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24">
      {/* 遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 搜索框 */}
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-[#161b22] rounded-xl shadow-2xl overflow-hidden">
        {/* 搜索输入 */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索新闻标题、内容..."
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none text-lg"
            autoFocus
          />
          {isLoading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!hasSearched ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>输入关键词开始搜索</p>
              <p className="text-sm mt-1 text-gray-400">支持搜索标题、摘要内容</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>未找到相关内容</p>
              <p className="text-sm mt-1 text-gray-400">尝试其他关键词</p>
            </div>
          ) : (
            <div className="py-2">
              <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                找到 {results.length} 条结果
              </div>
              {results.map((article) => (
                <a
                  key={article.id}
                  href={article.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                  onClick={onClose}
                >
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                      {article.category}
                    </span>
                    <span>{article.sourceName}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* 快捷键提示 */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 flex items-center justify-between">
          <span>按 ESC 关闭</span>
          <span>Enter 打开选中结果</span>
        </div>
      </div>
    </div>
  )
}
