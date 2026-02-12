'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useFavorites } from '@/hooks/use-favorites'
import { Triangle } from 'lucide-react'

// HN Header Component (Reused Inline for Consistency)
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
                    <span className="text-xs text-black">
                      收藏
                    </span>
                  </td>
                  <td className="text-right">
                    <Link href="/" className="text-black text-xs hover:underline mr-2" style={{ fontSize: '10pt' }}>
                      首页
                    </Link>
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

export default function FavoritesPage() {
  const { favorites, removeFavorite, clearFavorites } = useFavorites()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-4 text-center" style={{ color: '#828282' }}>
        加载中...
      </div>
    )
  }

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return ''
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6ef' }}>
      <center>
        <table className="w-full max-w-[85%]" style={{ backgroundColor: '#f6f6ef' }} cellPadding={0} cellSpacing={0}>
          <tbody>
            {/* Header Row */}
            <tr>
              <td style={{ backgroundColor: '#ff6600' }}>
                <HNHeader />
              </td>
            </tr>

            {/* Spacer */}
            <tr style={{ height: '10px' }} />

            {/* Content Row */}
            <tr>
              <td>
                <table className="w-full border-0" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    {favorites.length === 0 ? (
                      <tr>
                        <td className="p-4 text-center" style={{ color: '#828282' }}>
                          暂无收藏的文章
                        </td>
                      </tr>
                    ) : (
                      favorites.map((article, index) => (
                        <tr key={article.id} className="thing">
                          <td className="title align-top text-right pr-1" style={{ width: '30px' }}>
                            <span className="rank" style={{ color: '#828282' }}>
                              {index + 1}.
                            </span>
                          </td>
                          <td className="votelinks align-top w-[14px]">
                            <center>
                              <div className="votearrow" title="upvote"></div>
                            </center>
                          </td>
                          <td className="title align-top pl-1">
                            <a
                              href={article.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="titlelink text-black visited:text-gray-600 hover:underline"
                              style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt' }}
                            >
                              {article.title}
                            </a>
                            <span className="sitebit comhead text-xs ml-1" style={{ color: '#828282' }}>
                              (<span className="sitestr">{getDomain(article.originalUrl)}</span>)
                            </span>
                            <div className="subtext text-xs mt-0.5 pb-1" style={{ color: '#828282' }}>
                              <span className="score"> {Math.floor(Math.random() * 100) + 1} points </span>
                              by <a href="#" className="hnuser">globalnews</a>{' '}
                              <span className="age">
                                {new Date(article.addedAt).toLocaleDateString()}
                              </span>{' '}
                              |{' '}
                              <button
                                onClick={() => removeFavorite(article.id)}
                                className="hover:underline"
                              >
                                取消收藏
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Clear All Button Row */}
            {favorites.length > 0 && (
              <tr>
                <td className="pt-4 px-2">
                  <button
                    onClick={() => {
                      if (window.confirm('确定要清空所有收藏吗？')) {
                        clearFavorites()
                      }
                    }}
                    className="px-3 py-1 bg-[#ff6600] text-white text-xs rounded hover:bg-[#e65c00]"
                  >
                    清空收藏
                  </button>
                </td>
              </tr>
            )}

            {/* Footer Spacer */}
            <tr style={{ height: '20px' }}></tr>
            <tr>
              <td style={{ borderTop: '2px solid #ff6600' }}></td>
            </tr>
          </tbody>
        </table>
      </center>
    </div>
  )
}
