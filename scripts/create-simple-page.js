#!/usr/bin/env node

// 创建一个简化的、能正常工作的页面版本

const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[INFO] ${message}`);
}

try {
  log('🔄 正在重新创建简化的页面...');

  const simplePage = `'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Triangle } from 'lucide-react'

interface Article {
  id: string
  title: string
  originalTitle: string
  category: string
  sourceName: string
  originalUrl: string
  publishedAt: string
  viewCount: number
}

// HN Style Header - 中文版
function HNHeader({ onSearch }: { onSearch: (q: string) => void }) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <table className="w-full border-0 p-0" style={{ backgroundColor: '#ff6600' }} cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr>
          <td style={{ padding: '2px' }}>
            <table className="w-full border-0 p-0" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={{ width: '18px', paddingRight: '4px' }}>
                    <Link href="/" className="flex items-center justify-center">
                      <div className="w-5 h-5 border border-white flex items-center justify-center bg-white">
                        <Triangle className="w-3 h-3 text-[#ff6600] fill-current" />
                      </div>
                    </Link>
                  </td>
                  <td className="leading-none">
                    <span className="font-bold mr-1">
                      <Link href="/" className="text-black hover:underline" style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt' }}>
                        全球新闻
                      </Link>
                    </span>
                    <span className="text-xs">
                      <Link href="/timeline" className="hn-navlink mr-1">时间轴</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=tech" className="hn-navlink mx-1">科技</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=finance" className="hn-navlink mx-1">财经</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=china" className="hn-navlink mx-1">中国</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=overseas" className="hn-navlink mx-1">海外</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=sports" className="hn-navlink mx-1">体育</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=politics" className="hn-navlink mx-1">政治</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=entertainment" className="hn-navlink mx-1">娱乐</Link>
                      <span className="text-black">|</span>
                      <Link href="/daily" className="hn-navlink mx-1">日报</Link>
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="text-black text-xs hover:underline" style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}>
                      搜索
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

// HN Style Story Item - 中文版
function HNStory({ article, index }: { article: Article, index: number }) {
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '')
      return domain
    } catch {
      return article.sourceName
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 60) return \`\${diffMins}分钟前\`
    if (diffHrs < 24) return \`\${diffHrs}小时前\`
    return \`\${Math.floor(diffHrs / 24)}天前\`
  }

  const domain = getDomain(article.originalUrl)

  const categoryNames: Record<string, string> = {
    tech: '科技',
    finance: '财经',
    overseas: '海外',
    sports: '体育',
    politics: '政治',
    entertainment: '娱乐',
    health: '健康',
    education: '教育',
    environment: '环境',
    china: '中国',
  }

  const categoryColors: Record<string, string> = {
    tech: '#3b82f6',
    finance: '#10b981',
    overseas: '#2563eb',
    sports: '#f59e0b',
    politics: '#ef4444',
    entertainment: '#ec4899',
    health: '#14b8a6',
    education: '#6366f1',
    environment: '#22c55e',
    china: '#dc2626',
  }

  return (
    <tr className="group">
      <td className="align-top text-right pr-1" style={{ color: '#828282', fontSize: '10pt' }}>
        <span className="text-[#828282]">{index}.</span>
      </td>
      <td className="align-top pl-1 pr-2">
        <div className="hn-votearrow cursor-pointer hover:opacity-80" />
      </td>
      <td className="align-top">
        <div className="leading-tight">
          <div className="mb-0.5">
            <Link
              href={article.originalUrl}
              className="text-black hover:underline"
              style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt' }}
              target="_blank"
            >
              {article.title}
            </Link>
            <span className="text-xs ml-1" style={{ color: '#828282' }}>
              ({domain})
            </span>
            <span
              className="text-[9px] ml-2 px-1 py-0.5 text-white rounded-sm"
              style={{ backgroundColor: categoryColors[article.category] || '#828282' }}
            >
              {categoryNames[article.category] || article.category}
            </span>
          </div>

          <div className="text-xs" style={{ color: '#828282', fontFamily: 'Verdana, Geneva, sans-serif' }}>
            {article.viewCount} 次阅读 · {article.sourceName} · {formatTime(article.publishedAt)}
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentCategory, setCurrentCategory] = useState('')

  // 获取URL参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get('category') || ''
    setCurrentCategory(category)
  }, [])

  // 加载新闻
  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (currentCategory) {
          params.set('category', currentCategory)
        }
        params.set('limit', '30')

        const response = await fetch(\`/api/articles?\${params}\`)
        if (response.ok) {
          const data = await response.json()
          setArticles(data.articles || [])
        }
      } catch (error) {
        console.error('Error loading articles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNews()
  }, [currentCategory])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6ef' }}>
      <center>
        <table className="w-full max-w-[85%]" style={{ backgroundColor: '#f6f6ef' }} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td>
                <HNHeader onSearch={() => {}} />
                <div style={{ height: '10px' }} />

                <table className="w-full" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center" style={{ color: '#828282' }}>
                          正在加载...
                        </td>
                      </tr>
                    ) : articles.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center" style={{ color: '#828282' }}>
                          暂无新闻
                        </td>
                      </tr>
                    ) : (
                      <>
                        {articles.map((article, index) => (
                          <HNStory key={article.id} article={article} index={index + 1} />
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </center>
    </div>
  )
}
`;

  const pagePath = path.join(__dirname, '..', 'app', 'page.tsx');

  // 备份原文件
  const backupPath = pagePath + '.backup.' + Date.now();
  fs.copyFileSync(pagePath, backupPath);

  // 写入新文件
  fs.writeFileSync(pagePath, simplePage);

  log('✅ 简化页面创建完成！');
  log(\`📦 原文件已备份到: \${path.basename(backupPath)}\`);
  log('🎯 新页面特点:');
  log('   - 简化的状态管理');
  log('   - 清晰的数据流');
  log('   - 移除了复杂的URL监听逻辑');
  log('   - 保持了HN风格的UI');

  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
`;

  fs.writeFileSync(pagePath, content);

  log('✅ 脚本创建完成！');

} catch (error) {
  console.error('❌ 失败:', error.message);
}
