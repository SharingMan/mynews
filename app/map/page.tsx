'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, X, ExternalLink, Globe, Loader2 } from 'lucide-react'
import { countryCoords, getCountryFromSource } from '@/lib/country-coords'

// Dynamically import map component (no SSR for client-side map)
const WorldNewsMap = dynamic(() => import('@/components/WorldNewsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full text-white/50 animate-pulse">
      <Loader2 className="w-8 h-8 animate-spin mb-2" />
      <span className="text-xs uppercase tracking-widest">Constructing World...</span>
    </div>
  )
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

interface NewsMarker {
  id: string // Region Name (e.g. "Beijing")
  name: string
  lat: number
  lon: number
  newsCount: number
  articles: Article[]
}

export default function MapPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)

  // Fetch articles on mount
  useEffect(() => {
    fetch('/api/articles?limit=150') // Increased limit for better distribution
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          setArticles(data.articles)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch articles:", err)
        setLoading(false)
      })
  }, [])

  // Aggregate articles into city/region markers
  const markers = useMemo(() => {
    if (articles.length === 0) return []

    const markerMap = new Map<string, NewsMarker>()

    articles.forEach(article => {
      // Get city/region from source name (e.g. "Beijing", "Shenzhen", "New York")
      const regionName = getCountryFromSource(article.sourceName)

      if (regionName && countryCoords[regionName]) {
        if (!markerMap.has(regionName)) {
          const coords = countryCoords[regionName]
          markerMap.set(regionName, {
            id: regionName,
            name: regionName,
            lat: coords.lat,
            lon: coords.lon,
            newsCount: 0,
            articles: []
          })
        }

        const marker = markerMap.get(regionName)!
        marker.newsCount++
        marker.articles.push(article)
      }
    })

    return Array.from(markerMap.values())
  }, [articles])

  const selectedMarker = useMemo(() =>
    selectedMarkerId ? markers.find(m => m.id === selectedMarkerId) : null,
    [selectedMarkerId, markers]
  )

  return (
    <div className="relative w-full h-screen bg-[#000510] overflow-hidden font-sans text-white">
      {/* Map Container */}
      <div className="absolute inset-0 z-0">
        <WorldNewsMap
          markers={markers}
          selectedMarkerId={selectedMarkerId || undefined}
          onMarkerClick={(marker) => setSelectedMarkerId(marker.id)}
        />
      </div>

      {/* Top Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-start gap-4">
          <Link
            href="/"
            className="inline-flex items-center text-white/70 hover:text-[#ff6600] transition-colors backdrop-blur-md bg-black/40 px-4 py-2 rounded-full border border-white/10 group text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Feed
          </Link>

          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-2xl flex items-center gap-2">
              GLOBAL<span className="text-[#ff6600]">NEWS</span>
            </h1>
            <div className="flex items-center gap-2 text-white/50 text-xs font-mono uppercase tracking-widest pl-1">
              <span className="w-2 h-2 rounded-full bg-[#ff6600] animate-pulse"></span>
              Live Geospacial View
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overlay (Bottom Left) */}
      <div className="absolute bottom-8 left-8 z-10 hidden md:block pointer-events-none">
        <div className="flex gap-8 backdrop-blur-md bg-black/40 p-6 rounded-2xl border border-white/10">
          <div className="text-center">
            <div className="text-3xl font-black text-white tabular-nums">{markers.length}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Active Hubs</div>
          </div>
          <div className="w-px bg-white/10"></div>
          <div className="text-center">
            <div className="text-3xl font-black text-[#ff6600] tabular-nums">{articles.length}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Total Stories</div>
          </div>
        </div>
      </div>

      {/* Sidebar (Right) */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 z-50 transition-transform duration-500 ease-out transform shadow-2xl ${selectedMarker ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedMarker && (
          <div className="flex flex-col h-full relative">
            {/* Sidebar Header */}
            <div className="p-8 border-b border-white/10 flex justify-between items-start bg-black/20">
              <div>
                <div className="flex items-center gap-2 text-[#ff6600] mb-2 uppercase tracking-wider text-xs font-bold">
                  <Globe className="w-4 h-4" />
                  News Hub
                </div>
                <h2 className="text-4xl font-black text-white mb-2">{selectedMarker.name}</h2>
                <div className="text-white/40 text-sm font-mono tracking-wide">
                  {selectedMarker.newsCount} STORIES BREAKING NOW
                </div>
              </div>
              <button
                onClick={() => setSelectedMarkerId(null)}
                className="p-3 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Articles List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {selectedMarker.articles.map(article => (
                <div key={article.id} className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#ff6600]/30 p-5 rounded-xl transition-all duration-300">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <span className="text-[10px] font-bold bg-[#ff6600]/10 text-[#ff6600] px-2 py-1 rounded tracking-wide uppercase">
                      {article.sourceName}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono whitespace-nowrap">
                      {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-white font-bold leading-snug mb-3 group-hover:text-[#ff6600] transition-colors text-lg">
                    {article.title}
                  </h3>

                  {article.summary && (
                    <p className="text-sm text-white/50 line-clamp-3 mb-4 font-light leading-relaxed">
                      {article.summary}
                    </p>
                  )}

                  <a
                    href={article.url || article.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-white/40 group-hover:text-white transition-colors uppercase tracking-widest font-bold mt-1 hover:underline decoration-[#ff6600] decoration-2 underline-offset-4"
                  >
                    Read Full Story <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              ))}
            </div>

            {/* Background Gradient for list */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none"></div>
          </div>
        )}
      </div>
    </div>
  )
}
