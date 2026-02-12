export interface Article {
  id: string
  title: string
  summary: string | null
  content: string | null
  originalUrl: string
  imageUrl: string | null
  category: string
  sourceId: string
  sourceName: string
  originalLanguage: string
  translatedTitle: string | null
  translatedSummary: string | null
  publishedAt: Date
  fetchedAt: Date
  viewCount: number
  isFeatured: boolean
  isDailySelected: boolean
}

export interface NewsSource {
  id: string
  name: string
  url: string
  type: 'rss' | 'api'
  category: string
  language: string
  isActive: boolean
  lastFetched: Date | null
  fetchCount: number
  errorCount: number
}

export interface DailyNews {
  id: string
  date: Date
  title: string
  summary: string | null
  techCount: number
  financeCount: number
  politicsCount: number
  sportsCount: number
  entertainmentCount: number
  healthCount: number
  educationCount: number
  environmentCount: number
  internationalCount: number
  domesticCount: number
  totalCount: number
  isPublished: boolean
  publishedAt: Date | null
}

export interface Subscriber {
  id: string
  email: string
  name: string | null
  subscribedCategories: string | null
  preferredLanguage: string
  isActive: boolean
  subscribedAt: Date
  lastSentAt: Date | null
}
