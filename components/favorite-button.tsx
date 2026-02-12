'use client'

import { Bookmark } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'

interface FavoriteButtonProps {
  article: {
    id: string
    title: string
    originalUrl: string
    sourceName: string
    category: string
  }
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function FavoriteButton({ article, size = 'md', showText = false }: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useFavorites()
  const isActive = isFavorite(article.id)

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(article)
      }}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-[#ff6600]/10 text-[#ff6600]'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
      }`}
      title={isActive ? '取消收藏' : '添加收藏'}
    >
      <Bookmark 
        className={`${sizeClasses[size]} transition-all duration-200 ${
          isActive ? 'fill-current' : ''
        }`} 
      />
      {showText && (
        <span className="text-sm font-medium">
          {isActive ? '已收藏' : '收藏'}
        </span>
      )}
    </button>
  )
}
