'use client'

import Link from 'next/link'
import { Triangle, Trash2 } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'

const categoryNames: Record<string, string> = {
  tech: '科技',
  ai: 'AI',
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
                    <span className="text-xs text-black">
                      我的收藏
                    </span>
                  </td>
                  <td className="text-right">
                    <Link href="/timeline" className="text-black text-xs hover:underline mr-2" style={{ fontSize: '10pt' }}>
                      时间轴
                    </Link>
                    <Link href="/daily" className="text-black text-xs hover:underline" style={{ fontSize: '10pt' }}>
                      日报
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
  const { favorites, isLoaded, removeFavorite, clearFavorites, favoritesCount } = useFavorites()

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 60) return `${diffMins}分钟前`
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHrs < 24) return `${diffHrs}小时前`
    return `${Math.floor(diffHrs / 24)}天前`
  }

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return ''
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f6f6ef' }}>
        <div className="p-4 text-center" style={{ color: '#828282' }}>加载中...</div>
      </div>
    )
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

                {favorites.length === 0 ? (
                  <div className="text-center py-16" style={{ color: '#828282' }}>
                    <div className="text-xl font-bold mb-2">暂无收藏</div>
                    <div className="text-sm mb-4">浏览新闻时点击收藏按钮，将感兴趣的文章保存到这里</div>
                    <Link
                      href="/"
                      className="text-black hover:underline"
                      style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt' }}
                    >
                      去浏览新闻
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '1px solid #ff6600' }}>
                      <span style={{ color: '#828282', fontSize: '10pt' }}>
                        共收藏 <strong>{favoritesCount}</strong> 篇文章
                      </span>
                      <button
                        onClick={clearFavorites}
                        className="text-xs hover:underline flex items-center gap-1"
                        style={{ color: '#828282' }}
                      >
                        <Trash2 className="w-3 h-3" />
                        清空收藏
                      </button>
                    </div>

                    {/* Favorites List */}
                    <table className="w-full" cellPadding={0} cellSpacing={0}>
                      <tbody>
                        {favorites.map((article, index) => (
                          <tr key={article.id} className="group">
                            <td className="align-top text-right pr-1 py-1" style={{ color: '#828282', fontSize: '10pt', width: '30px' }}>
                              {index + 1}.
                            </td>
                            <td className="align-top pl-1 py-1">
                              <div className="leading-tight">
                                <a
                                  href={article.originalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-black hover:underline"
                                  style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt' }}
                                >
                                  {article.title}
                                </a>
                                <span className="text-xs ml-1" style={{ color: '#828282' }}>
                                  ({getDomain(article.originalUrl)}) {formatTime(article.addedAt)} | {categoryNames[article.category] || article.category}
                                </span>
                                <button
                                  onClick={() => removeFavorite(article.id)}
                                  className="ml-2 text-xs hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ color: '#828282' }}
                                >
                                  [取消收藏]
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                <div className="py-4 text-center" style={{ borderTop: '2px solid #ff6600', marginTop: '20px' }}>
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
