// SEO 工具函数

export function generateArticleJsonLd(article: {
  title: string
  summary?: string
  originalUrl: string
  sourceName: string
  publishedAt: string
  imageUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary || article.title,
    url: article.originalUrl,
    author: {
      '@type': 'Organization',
      name: article.sourceName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'GlobalNews',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mynews-production-52a2.up.railway.app/logo.png',
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    image: article.imageUrl || 'https://mynews-production-52a2.up.railway.app/og-image.png',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.originalUrl,
    },
  }
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GlobalNews',
    url: 'https://mynews-production-52a2.up.railway.app',
    description: '全球实时新闻聚合平台',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://mynews-production-52a2.up.railway.app/?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GlobalNews',
    url: 'https://mynews-production-52a2.up.railway.app',
    logo: 'https://mynews-production-52a2.up.railway.app/logo.png',
    sameAs: [
      'https://twitter.com/globalnews',
      'https://github.com/SharingMan/mynews',
    ],
  }
}

// 生成 meta 描述（限制长度）
export function generateMetaDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

// 生成关键词
export function generateKeywords(category: string): string[] {
  const baseKeywords = ['新闻', '实时', '聚合']
  const categoryKeywords: Record<string, string[]> = {
    ai: ['AI', '人工智能', '机器学习', '深度学习'],
    tech: ['科技', '互联网', '软件', '硬件'],
    finance: ['财经', '金融', '股票', '经济'],
    china: ['中国', '国内', '时事'],
    overseas: ['国际', '全球', '世界'],
    sports: ['体育', '运动', '赛事'],
    politics: ['政治', '时政'],
    entertainment: ['娱乐', '影视', '明星'],
  }
  
  return [...baseKeywords, ...(categoryKeywords[category] || [])]
}
