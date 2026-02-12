'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { categoryLabels, categoryIcons } from '@/lib/news-sources'
import { formatDistanceToNow } from '@/lib/utils'
import { Newspaper, ImageOff } from 'lucide-react'

interface NewsCardProps {
  article: {
    id: string
    title: string
    summary: string | null
    imageUrl: string | null
    category: string
    sourceName: string
    publishedAt: Date | string
  }
  variant?: 'default' | 'compact' | 'featured'
}

// 图片加载失败时的占位符 - 使用分类图标
function CategoryPlaceholder({ 
  category, 
  className,
  variant = 'default'
}: { 
  category: string
  className?: string
  variant?: 'default' | 'featured'
}) {
  const categoryColor = categoryLabels[category]?.color || 'bg-gray-500'
  const IconComponent = categoryIcons[category] || Newspaper
  
  if (variant === 'featured') {
    return (
      <div className={`${categoryColor} flex flex-col items-center justify-center text-white ${className}`}>
        <IconComponent className="h-12 w-12 mb-2 opacity-80" />
        <span className="text-sm font-medium opacity-90">
          {categoryLabels[category]?.zh || category}
        </span>
      </div>
    )
  }
  
  return (
    <div className={`${categoryColor} flex items-center justify-center text-white ${className}`}>
      <IconComponent className="h-8 w-8 opacity-80" />
    </div>
  )
}

// 生成渐变色背景（基于标题首字母）
function getGradientByTitle(title: string): string {
  const gradients = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-red-400 to-red-600',
    'from-orange-400 to-orange-600',
    'from-amber-400 to-amber-600',
    'from-green-400 to-green-600',
    'from-teal-400 to-teal-600',
    'from-cyan-400 to-cyan-600',
    'from-indigo-400 to-indigo-600',
  ]
  
  const charCode = title.charCodeAt(0) || 0
  return gradients[charCode % gradients.length]
}

// 获取标题首字母（支持中英文）
function getInitial(title: string): string {
  if (!title) return '?'
  const firstChar = title.trim()[0]
  // 如果是中文，返回前2个字符，否则返回首字母大写
  if (/[\u4e00-\u9fa5]/.test(firstChar)) {
    return title.slice(0, 2)
  }
  return firstChar.toUpperCase()
}

// 纯文字卡片（无图片模式）
function TextOnlyCard({ 
  article, 
  categoryLabel, 
  categoryColor,
  publishedDate 
}: { 
  article: NewsCardProps['article']
  categoryLabel: string
  categoryColor: string
  publishedDate: Date
}) {
  const IconComponent = categoryIcons[article.category] || Newspaper
  
  return (
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        {/* 左侧图标区域 */}
        <div className={`${categoryColor} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <IconComponent className="h-7 w-7 text-white" />
        </div>
        
        {/* 右侧内容区域 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className={`${categoryColor} text-white text-xs`}>
              {categoryLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {article.sourceName}
            </span>
          </div>
          
          <h3 className="font-semibold text-base line-clamp-2 mb-1.5 leading-snug">
            {article.title}
          </h3>
          
          {article.summary && (
            <p className="text-muted-foreground text-sm line-clamp-1 mb-2">
              {article.summary}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              {formatDistanceToNow(publishedDate)}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  )
}

export function NewsCard({ article, variant = 'default' }: NewsCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const categoryLabel = categoryLabels[article.category]?.zh || article.category
  const categoryColor = categoryLabels[article.category]?.color || 'bg-gray-500'
  
  const publishedDate = typeof article.publishedAt === 'string' 
    ? new Date(article.publishedAt) 
    : article.publishedAt

  // 无图片模式
  const hasNoImage = !article.imageUrl || imageError
  
  if (variant === 'compact') {
    const IconComponent = categoryIcons[article.category] || Newspaper
    
    return (
      <Link href={`/article/${article.id}`}>
        <Card className="hover:bg-muted/50 transition-all cursor-pointer h-full border-l-4 hover:shadow-md"
              style={{ borderLeftColor: 'transparent' }}>
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              {/* 小图标或缩略图 */}
              {hasNoImage ? (
                <div className={`${categoryColor} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
              ) : (
                <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.imageUrl!}
                    alt={article.title}
                    className={`object-cover w-full h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant="secondary" className={`${categoryColor} text-white text-[10px] px-1 py-0`}>
                    {categoryLabel}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {article.sourceName}
                  </span>
                </div>
                <h3 className="font-medium line-clamp-2 text-sm leading-snug">
                  {article.title}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(publishedDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }
  
  if (variant === 'featured') {
    const gradient = getGradientByTitle(article.title)
    const IconComponent = categoryIcons[article.category] || Newspaper
    
    return (
      <Link href={`/article/${article.id}`}>
        <Card className="hover:shadow-xl transition-all cursor-pointer overflow-hidden h-full group border-0 shadow-lg">
          {/* 大图区域 - 无图片时使用渐变色 */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {hasNoImage ? (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center text-white`}>
                <IconComponent className="h-16 w-16 mb-3 opacity-80" />
                <span className="text-2xl font-bold opacity-90">
                  {getInitial(article.title)}
                </span>
                <span className="text-sm mt-2 opacity-70">
                  {categoryLabel}
                </span>
              </div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.imageUrl!}
                  alt={article.title}
                  className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {/* 图片加载前的骨架 */}
                {!imageLoaded && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} animate-pulse`} />
                )}
              </>
            )}
            
            {/* 分类标签 */}
            <div className="absolute top-3 left-3">
              <Badge className={`${categoryColor} text-white font-medium`}>
                {categoryLabel}
              </Badge>
            </div>
            
            {/* 图片不可用提示 */}
            {!hasNoImage && imageError && (
              <div className="absolute bottom-2 right-2">
                <div className="bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
                  <ImageOff className="h-3 w-3" />
                  无图
                </div>
              </div>
            )}
          </div>
          
          {/* 内容区域 */}
          <CardContent className="p-4">
            <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-tight">
              {article.title}
            </h3>
            {article.summary && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {article.summary}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">{article.sourceName}</span>
              <span>{formatDistanceToNow(publishedDate)}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }
  
  // 默认视图 - 无图片优化版
  if (hasNoImage) {
    return (
      <Link href={`/article/${article.id}`}>
        <Card className="hover:shadow-md hover:bg-accent/30 transition-all cursor-pointer h-full border-l-4 group"
              style={{ borderLeftColor: 'var(--color-border)' }}>
          <TextOnlyCard 
            article={article}
            categoryLabel={categoryLabel}
            categoryColor={categoryColor}
            publishedDate={publishedDate}
          />
        </Card>
      </Link>
    )
  }
  
  // 默认视图 - 有图片
  return (
    <Link href={`/article/${article.id}`}>
      <Card className="hover:shadow-md transition-all cursor-pointer h-full overflow-hidden group">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted hidden sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.imageUrl!}
                alt={article.title}
                className={`object-cover w-full h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {/* 加载骨架 */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${categoryColor} text-white text-xs`}>
                  {categoryLabel}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {article.sourceName}
                </span>
              </div>
              
              <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              
              {article.summary && (
                <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                  {article.summary}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                {formatDistanceToNow(publishedDate)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
