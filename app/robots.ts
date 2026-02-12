import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/scripts/'],
    },
    sitemap: 'https://mynews-production-52a2.up.railway.app/sitemap.xml',
  }
}
