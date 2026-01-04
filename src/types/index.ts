/**
 * Common types used across the application
 */

export interface ArticleCardProps {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string[]
  author: string
  publishedAt: string
  featuredImageUrl: string | null
  readingTime: number
  viewsCount?: number
  isFeatured?: boolean
}

export interface CategoryData {
  id: string
  name: string
  slug: string
  color: string
  icon: string
  description?: string
}

export interface TrendingTopic {
  tag: string
  count: number
  trend: 'up' | 'down' | 'stable'
}

export interface NewsletterFormData {
  email: string
}

export interface SearchResult {
  articles: ArticleCardProps[]
  totalCount: number
  hasMore: boolean
}

export interface PaginationParams {
  page: number
  limit: number
  category?: string
  tag?: string
  search?: string
}

export interface TableOfContentsItem {
  id: string
  title: string
  level: number
}

export interface ShareData {
  title: string
  url: string
  text?: string
}
