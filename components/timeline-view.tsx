'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, ImageOff, Newspaper } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { categoryLabels, categoryIcons } from '@/lib/news-sources'
import { formatDistanceToNow } from '@/lib/utils'

interface Article {
  id: string
  title: string
  summary: string | null
  imageUrl: string | null
  category: string
  sourceName: string
  publishedAt: string
}

interface TimelineGroup {
  hour: string
  label: string
  articles: Article[]
}

// 生成渐变色
function getGradientByCategory(category: string): string {
  const gradients: Record<string, string> = {
    tech: 'from-blue-400 to-indigo-500',
    finance: 'from-green-400 to-emerald-500',
    politics: 'from-red-400 to-rose-500',
    sports: 'from-orange-400 to-amber-500',
    entertainment: 'from-pink-400 to-rose-500',
    health: 'from-teal-400 to-cyan-500',
    education: 'from-indigo-400 to-purple-500',
    environment: 'from-emerald-400 to-green-500',
    international: 'from-purple-400 to-violet-500',
    domestic: 'from-cyan-400 to-blue-500',
  }
  return gradients[category] || 'from-gray-400 to-slate-500'
}

export function TimelineView() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await fetch('/api/articles?limit=50')
        if (response.ok) {
          const data = await response.json()
          setArticles(data.articles)
        }
      } catch (error) {
        console.error('Error loading timeline:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadArticles()
  }, [])

  // 按小时分组
  const grouped = articles.reduce<TimelineGroup[]>((acc, article) => {
    const date = new Date(article.publishedAt)
    const hour = date.getHours()
    const hourKey = `${hour.toString().padStart(2, '0')}:00`
    
    const existingGroup = acc.find(g => g.hour === hourKey)
    if (existingGroup) {
      existingGroup.articles.push(article)
    } else {
      acc.push({
        hour: hourKey,
        label: getHourLabel(hour),
        articles: [article]
      })
    }
    return acc
  }, [])

  // 按时间倒序排序
  grouped.sort((a, b) => b.hour.localeCompare(a.hour))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            24小时时间轴
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          24小时时间轴
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="relative pl-6 pr-4 py-4">
            {/* 时间轴线 */}
            <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
            
            {grouped.map((group) => (
              <div key={group.hour} className="mb-6 last:mb-0">
                {/* 时间节点 */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{group.hour}</span>
                    <span className="text-sm text-muted-foreground">{group.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {group.articles.length}条
                    </Badge>
                  </div>
                </div>
                
                {/* 新闻列表 */}
                <div className="ml-8 space-y-3">
                  {group.articles.slice(0, 3).map((article) => {
                    const categoryLabel = categoryLabels[article.category]?.zh || article.category
                    const categoryColor = categoryLabels[article.category]?.color || 'bg-gray-500'
                    const gradient = getGradientByCategory(article.category)
                    const IconComponent = categoryIcons[article.category] || Newspaper
                    const hasImage = !!article.imageUrl
                    
                    return (
                      <Link key={article.id} href={`/article/${article.id}`}>
                        <div className="group p-3 rounded-xl border bg-card hover:bg-accent/50 transition-all cursor-pointer hover:shadow-md">
                          <div className="flex gap-3">
                            {/* 图片或图标区域 */}
                            <div className="flex-shrink-0">
                              {hasImage ? (
                                <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={article.imageUrl!}
                                    alt={article.title}
                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                    onError={(e) => {
                                      // 图片加载失败时显示分类图标
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                      const parent = target.parentElement
                                      if (parent) {
                                        parent.className = `${categoryColor} w-20 h-14 rounded-lg flex items-center justify-center`
                                        const icon = document.createElement('div')
                                        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"></svg>'
                                        parent.appendChild(icon)
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className={`w-20 h-14 rounded-lg bg-gradient-to-br ${gradient} flex flex-col items-center justify-center text-white shadow-md`}>
                                  <IconComponent className="h-6 w-6 mb-0.5" />
                                  <span className="text-[10px] font-medium opacity-90">{categoryLabel}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* 内容区域 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`${categoryColor} text-white text-[10px] px-1.5 py-0`}>
                                  {categoryLabel}
                                </Badge>
                                <span className="text-xs text-muted-foreground truncate">
                                  {article.sourceName}
                                </span>
                                {!hasImage && (
                                  <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
                                    <ImageOff className="h-3 w-3" />
                                    无图
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                {article.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(article.publishedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                  
                  {group.articles.length > 3 && (
                    <div className="text-center py-1">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        还有 {group.articles.length - 3} 条新闻
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function getHourLabel(hour: number): string {
  if (hour >= 6 && hour < 12) return '上午 ☀️'
  if (hour >= 12 && hour < 14) return '中午 🌤️'
  if (hour >= 14 && hour < 18) return '下午 ⛅'
  if (hour >= 18 && hour < 22) return '晚上 🌙'
  return '深夜 🌃'
}
