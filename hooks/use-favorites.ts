'use client'

import { useState, useEffect, useCallback } from 'react'

export interface FavoriteArticle {
  id: string
  title: string
  originalUrl: string
  sourceName: string
  category: string
  addedAt: string
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteArticle[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 从 localStorage 加载收藏
  useEffect(() => {
    try {
      const saved = localStorage.getItem('globalnews-favorites')
      if (saved) {
        setFavorites(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
    setIsLoaded(true)
  }, [])

  // 保存到 localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('globalnews-favorites', JSON.stringify(favorites))
      } catch (error) {
        console.error('Error saving favorites:', error)
      }
    }
  }, [favorites, isLoaded])

  const addFavorite = useCallback((article: Omit<FavoriteArticle, 'addedAt'>) => {
    setFavorites(prev => {
      // 检查是否已存在
      if (prev.some(f => f.id === article.id)) {
        return prev
      }
      return [...prev, { ...article, addedAt: new Date().toISOString() }]
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }, [])

  const toggleFavorite = useCallback((article: Omit<FavoriteArticle, 'addedAt'>) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === article.id)
      if (exists) {
        return prev.filter(f => f.id !== article.id)
      }
      return [...prev, { ...article, addedAt: new Date().toISOString() }]
    })
  }, [])

  const isFavorite = useCallback((id: string) => {
    return favorites.some(f => f.id === id)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  }
}
