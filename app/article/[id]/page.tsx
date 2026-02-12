'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Triangle, ExternalLink, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ArticlePageProps {
  params: Promise<{
    id: string
  }>
}

interface Article {
  id: string
  title: string
  translatedTitle: string | null
  summary: string | null
  translatedSummary: string | null
  originalUrl: string
  category: string
  sourceName: string
  viewCount: number
  originalLanguage: string
  translationStatus: string
  source: {
    language: string
  }
}

// HN Style Header
function HNHeader() {
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

export default function ArticlePage({ params }: ArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState('')
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      fetchArticle(p.id)
    })
  }, [params])

  const fetchArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`)
      if (!response.ok) throw new Error('文章不存在')
      const data = await response.json()
      setArticle(data)

      // 如果是外文且未翻译，自动触发翻译
      if (data.originalLanguage !== 'zh' && !data.translatedTitle && data.translationStatus !== 'completed') {
        handleTranslate(data.id, true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleTranslate = async (articleId: string, auto = false) => {
    if (translating) return

    setTranslating(true)
    try {
      const response = await fetch(`/api/articles/${articleId}/translate`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('翻译失败')

      const data = await response.json()

      // 更新文章数据
      setArticle(prev => prev ? {
        ...prev,
        translatedTitle: data.translatedTitle,
        translatedSummary: data.translatedSummary,
        translationStatus: data.translationStatus,
      } : null)
    } catch (err) {
      if (!auto) {
        setError(err instanceof Error ? err.message : '翻译失败')
      }
    } finally {
      setTranslating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f6f6ef' }}>
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (error || !article) {
    notFound()
  }

  const needsTranslation = article.originalLanguage !== 'zh' && !article.translatedTitle
  const displayTitle = article.translatedTitle || article.title
  const displaySummary = article.translatedSummary || article.summary
  const domain = article.originalUrl ? new URL(article.originalUrl).hostname.replace(/^www\./, '') : ''

  const categoryNames: Record<string, string> = {
    tech: '科技',
    finance: '财经',
    international: '国际',
    sports: '体育',
    politics: '政治',
    entertainment: '娱乐',
    health: '健康',
    education: '教育',
    environment: '环境',
    domestic: '国内',
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6ef' }}>
      <center>
        <table className="w-full max-w-[85%]" style={{ backgroundColor: '#f6f6ef' }} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td>
                <HNHeader />

                <div style={{ height: '10px' }} />

                {/* Article */}
                <table className="w-full" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    <tr>
                      <td className="align-top pr-2">
                        <div className="hn-votearrow cursor-pointer" />
                      </td>
                      <td className="align-top">
                        <div style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt' }}>
                          <span className="font-bold">{displayTitle}</span>
                          {domain && (
                            <span className="text-xs ml-1" style={{ color: '#828282' }}>
                              ({domain})
                            </span>
                          )}
                        </div>

                        <div className="text-xs mt-1" style={{ color: '#828282' }}>
                          {article.viewCount} 次阅读 · {article.sourceName} · {categoryNames[article.category] || article.category}
                          <a
                            href={article.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline ml-1"
                            style={{ color: '#828282' }}
                          >
                            阅读原文 <ExternalLink className="inline w-3 h-3" />
                          </a>
                        </div>

                        {/* 翻译按钮 */}
                        {needsTranslation && (
                          <div className="mt-3">
                            <Button
                              onClick={() => handleTranslate(article.id)}
                              disabled={translating}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <Languages className="w-3 h-3 mr-1" />
                              {translating ? '翻译中...' : '翻译成中文'}
                            </Button>
                          </div>
                        )}

                        {/* 显示原文按钮（如果已翻译） */}
                        {article.translatedTitle && article.originalLanguage !== 'zh' && (
                          <div className="mt-2 text-xs" style={{ color: '#828282' }}>
                            原文: {article.title}
                          </div>
                        )}

                        {/* Article content */}
                        {displaySummary && (
                          <div
                            className="mt-4 text-sm leading-relaxed"
                            style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}
                          >
                            {displaySummary}
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="py-4 mt-8 text-center" style={{ borderTop: '2px solid #ff6600' }}>
                  <Link href="/" className="hover:underline text-xs" style={{ color: '#828282' }}>
                    返回首页
                  </Link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </center>
    </div>
  )
}
