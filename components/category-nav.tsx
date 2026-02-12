'use client'

import { useState } from 'react'
import { categoryLabels } from '@/lib/news-sources'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface CategoryNavProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  const categories = [
    { id: 'all', label: '全部', color: 'bg-slate-500' },
    ...Object.entries(categoryLabels).map(([id, config]) => ({
      id,
      label: config.zh,
      color: config.color,
    })),
  ]
  
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 py-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors',
              activeCategory === category.id
                ? `${category.color} text-white`
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
