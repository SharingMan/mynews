import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mynews-production-52a2.up.railway.app'

  // 基础页面
  const routes = [
    '',
    '/timeline',
    '/daily',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // 分类页面
  const categories = [
    'ai', 'tech', 'finance', 'china', 'overseas',
    'sports', 'politics', 'entertainment', 'law'
  ]

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/?category=${category}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }))

  return [...routes, ...categoryRoutes]
}
