'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, X, ExternalLink, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'
import { countryCoords, getCountryFromSource } from '@/lib/country-coords'

// 动态导入 Globe3D 组件，禁用 SSR
const Globe3D = dynamic(() => import('@/components/Globe3D'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen bg-[#000510] text-[#ff6600] font-mono">INITIALIZING GLOBE SYSTEMS...</div>
})

interface Article {
  id: string
  title: string
  sourceName: string
  publishedAt: string
  url?: string
  originalUrl?: string
  summary?: string
}

interface Marker {
  id: string // Country Name
  lat: number
  lon: number
  newsCount: number;
  name: string
  articles: Article[]
}

export default function MapPage() {
  const [markers, setMarkers] = useState<Marker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取新闻数据
    fetch('/api/articles?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          setArticles(data.articles)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  // 聚合数据
  useEffect(() => {
    if (articles.length === 0) return

    const countryMap = new Map<string, Marker>()

    articles.forEach(article => {
      const countryName = getCountryFromSource(article.sourceName)
      if (countryName && countryCoords[countryName]) {
        if (!countryMap.has(countryName)) {
          countryMap.set(countryName, {
            id: countryName,
            lat: countryCoords[countryName].lat,
            lon: countryCoords[countryName].lon,
            newsCount: 0,
            name: countryName,
            articles: []
          })
        }
        const marker = countryMap.get(countryName)!
        marker.newsCount++
        marker.articles.push(article)
      }
    })

    setMarkers(Array.from(countryMap.values()))
  }, [articles])

  return (
    <div className="relative w-full h-screen bg-[#000510] overflow-hidden font-sans">
      {/* 3D 地球容器 */}
      <div className="absolute inset-0 z-0">
        <Globe3D
          markers={markers}
          onMarkerClick={(marker) => setSelectedMarker(marker)}
        />
      </div>

      {/* 顶部导航 overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/" className="inline-flex items-center text-white/70 hover:text-[#ff6600] transition-colors mb-4 backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/10 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 返回首页
          </Link>
          <div className="space-y-1 mt-2">
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-2xl" style={{ fontFamily: 'Verdana, sans-serif' }}>
              GLOBAL<span className="text-[#ff6600]">NEWS</span>
            </h1>
            <p className="text-white/60 text-sm font-medium tracking-widest uppercase ml-1 flex items-center gap-2">
              <span className="animate-pulse w-2 h-2 rounded-full bg-[#ff6600]"></span>
              Real-time 3D Visualization
            </p>
          </div>
        </div>
      </div>

      {/* 底部数据面板 */}
      <div className="absolute bottom-10 left-10 z-10 pointer-events-none hidden sm:block">
        <div className="flex gap-8 backdrop-blur-md bg-black/30 p-6 rounded-2xl border border-white/10">
          <div className="text-center">
            <div className="text-3xl font-black text-white tabular-nums">{loading ? '-' : markers.length}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Active Regions</div>
          </div>
          <div className="w-px bg-white/10"></div>
          <div className="text-center">
            <div className="text-3xl font-black text-[#ff6600] animate-pulse">LIVE</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Stream Status</div>
          </div>
        </div>
      </div>

      {/* 新闻列表侧边栏 */}
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[450px] bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 z-50 transition-transform duration-500 ease-out transform ${selectedMarker ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedMarker && (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/20">
              <div>
                <div className="flex items-center gap-2 text-[#ff6600] mb-2 uppercase tracking-wider text-xs font-bold">
                  <Globe className="w-4 h-4" />
                  Region Focus
                </div>
                <h2 className="text-4xl font-black text-white">{selectedMarker.name}</h2>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-white/40 text-xs font-mono mb-4 uppercase tracking-widest">
                {selectedMarker.articles.length} Breaking Stories
              </div>

              {selectedMarker.articles.map(article => (
                <div key={article.id} className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#ff6600]/50 p-5 rounded-xl transition-all duration-300">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-[10px] font-bold bg-[#ff6600]/20 text-[#ff6600] px-2 py-1 rounded">
                      {article.sourceName}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-white font-bold leading-snug mb-2 group-hover:text-[#ff6600] transition-colors">
                    {article.title}
                  </h3>

                  {article.summary && (
                    <p className="text-sm text-white/50 line-clamp-2 mb-3">
                      {article.summary}
                    </p>
                  )}

                  <a
                    href={article.url || article.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-white/40 group-hover:text-white transition-colors uppercase tracking-widest font-bold mt-2"
                  >
                    Read Full Story <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
