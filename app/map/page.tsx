'use client'

import { useState, useEffect } from 'react'
import { Globe } from '@/components/globe'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { categoryLabels } from '@/lib/news-sources'
import Link from 'next/link'
import { X } from 'lucide-react'

interface NewsMarker {
  id: string
  title: string
  lat: number
  lng: number
  category: string
  count: number
}

interface Article {
  id: string
  title: string
  translatedTitle: string | null
  summary: string | null
  category: string
  sourceName: string
  publishedAt: string
}

// 模拟全球新闻热点数据
const defaultMarkers: NewsMarker[] = [
  { id: 'us', title: '美国', lat: 37.0902, lng: -95.7129, category: 'international', count: 15 },
  { id: 'cn', title: '中国', lat: 35.8617, lng: 104.1954, category: 'domestic', count: 20 },
  { id: 'uk', title: '英国', lat: 55.3781, lng: -3.4360, category: 'international', count: 8 },
  { id: 'jp', title: '日本', lat: 36.2048, lng: 138.2529, category: 'international', count: 12 },
  { id: 'de', title: '德国', lat: 51.1657, lng: 10.4515, category: 'international', count: 6 },
  { id: 'fr', title: '法国', lat: 46.2276, lng: 2.2137, category: 'international', count: 7 },
  { id: 'in', title: '印度', lat: 20.5937, lng: 78.9629, category: 'international', count: 10 },
  { id: 'br', title: '巴西', lat: -14.2350, lng: -51.9253, category: 'international', count: 5 },
  { id: 'au', title: '澳大利亚', lat: -25.2744, lng: 133.7751, category: 'international', count: 4 },
  { id: 'ru', title: '俄罗斯', lat: 61.5240, lng: 105.3188, category: 'international', count: 9 },
  { id: 'kr', title: '韩国', lat: 35.9078, lng: 127.7669, category: 'international', count: 8 },
  { id: 'sg', title: '新加坡', lat: 1.3521, lng: 103.8198, category: 'finance', count: 6 },
]

export default function MapPage() {
  const [markers, setMarkers] = useState<NewsMarker[]>(defaultMarkers)
  const [selectedRegion, setSelectedRegion] = useState<NewsMarker | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)

  // 获取真实的新闻数据并聚合到地区
  useEffect(() => {
    fetch('/api/articles?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          // 根据新闻来源分类到不同地区
          const regionMap = new Map<string, NewsMarker>()

          data.articles.forEach((article: any) => {
            const region = getRegionFromSource(article.sourceName)
            if (region) {
              if (regionMap.has(region.id)) {
                const existing = regionMap.get(region.id)!
                existing.count += 1
              } else {
                regionMap.set(region.id, { ...region, count: 1 })
              }
            }
          })

          if (regionMap.size > 0) {
            setMarkers(Array.from(regionMap.values()))
          }
        }
      })
      .catch(console.error)
  }, [])

  // 根据来源判断地区
  function getRegionFromSource(sourceName: string): NewsMarker | null {
    const sourceMap: Record<string, NewsMarker> = {
      'BBC': { id: 'uk', title: '英国', lat: 55.3781, lng: -3.4360, category: 'international', count: 0 },
      'Reuters': { id: 'uk', title: '英国', lat: 51.5074, lng: -0.1278, category: 'international', count: 0 },
      'CNN': { id: 'us', title: '美国', lat: 38.9072, lng: -77.0369, category: 'international', count: 0 },
      'The New York Times': { id: 'us', title: '美国', lat: 40.7128, lng: -74.0060, category: 'international', count: 0 },
      'TechCrunch': { id: 'us', title: '美国', lat: 37.7749, lng: -122.4194, category: 'tech', count: 0 },
      'The Verge': { id: 'us', title: '美国', lat: 40.7308, lng: -73.9973, category: 'tech', count: 0 },
      'NHK': { id: 'jp', title: '日本', lat: 35.6762, lng: 139.6503, category: 'international', count: 0 },
      '朝日新闻': { id: 'jp', title: '日本', lat: 35.6762, lng: 139.6503, category: 'international', count: 0 },
    }

    for (const [key, region] of Object.entries(sourceMap)) {
      if (sourceName.includes(key)) return region
    }

    return null
  }

  // 点击标记时获取该地区新闻
  const handleMarkerClick = async (marker: NewsMarker) => {
    setSelectedRegion(marker)
    setLoading(true)

    try {
      // 根据地区获取新闻
      const response = await fetch(`/api/articles?limit=10&region=${marker.id}`)
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Failed to fetch region articles:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D 地球 */}
      <Globe markers={markers} onMarkerClick={handleMarkerClick} />

      {/* 标题 */}
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">全球新闻热点</h1>
        <p className="text-sm text-gray-300 mt-1">点击标记查看地区新闻</p>
      </div>

      {/* 图例 */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-white text-sm font-medium mb-2">新闻分类</h3>
        <div className="space-y-1">
          {Object.entries(categoryLabels).slice(0, 5).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: label.color.replace('bg-', '') }}
              />
              <span className="text-xs text-gray-300">{label.zh}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 侧边栏 - 地区新闻列表 */}
      {selectedRegion && (
        <div className="absolute right-0 top-0 h-full w-96 bg-black/80 backdrop-blur-md z-20 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{selectedRegion.title}</h2>
              <button
                onClick={() => setSelectedRegion(null)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="mb-4">
              <Badge
                className={`${categoryLabels[selectedRegion.category]?.color || 'bg-gray-500'} text-white`}
              >
                {categoryLabels[selectedRegion.category]?.zh || selectedRegion.category}
              </Badge>
              <span className="ml-2 text-sm text-gray-400">
                {selectedRegion.count} 条新闻
              </span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto" />
                <p className="text-gray-400 mt-2">加载中...</p>
              </div>
            ) : articles.length > 0 ? (
              <div className="space-y-3">
                {articles.map((article) => (
                  <Link key={article.id} href={`/article/${article.id}`}>
                    <Card className="p-3 bg-white/10 border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                      <h3 className="text-sm font-medium text-white line-clamp-2">
                        {article.translatedTitle || article.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{article.sourceName}</span>
                        <span>·</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">暂无该地区新闻</p>
            )}
          </div>
        </div>
      )}

      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 z-10 text-xs text-gray-500">
        鼠标拖拽旋转 · 滚轮缩放 · 点击标记查看详情
      </div>
    </div>
  )
}
