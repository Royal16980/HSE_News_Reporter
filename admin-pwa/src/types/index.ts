export type ArticleStatus = 'pending_review' | 'approved' | 'rejected' | 'scheduled' | 'snoozed'

export type Article = {
  id: string
  title: string
  excerpt: string
  category: string
  imageUrl?: string
  priority: number
  qualityScore: number
  status: ArticleStatus
  scheduledFor?: string
  createdAt: string
  source?: string
}

export type UserProfile = {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
}
