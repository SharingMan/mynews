'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { Home, Flame, Cpu, TrendingUp, Globe, Newspaper, Bookmark } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: '首页', category: '' },
  { href: '/map', icon: Globe, label: '地图', category: null },
  { href: '/favorites', icon: Bookmark, label: '收藏', category: null },
  { href: '/?category=ai', icon: Cpu, label: 'AI', category: 'ai' },
  { href: '/?category=tech', icon: Flame, label: '科技', category: 'tech' },
  { href: '/?category=finance', icon: TrendingUp, label: '财经', category: 'finance' },
  { href: '/timeline', icon: Newspaper, label: '时间轴', category: null },
]

export function MobileNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || ''

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => {
        const isActive = item.category !== null 
          ? item.category === currentCategory && pathname === '/'
          : pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="mobile-nav-icon" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
