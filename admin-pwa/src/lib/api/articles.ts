import { getSupabaseClient } from '../supabase'
import type { Article, ArticleStatus } from '@/types'

const supabase = getSupabaseClient()

/**
 * Fetch articles from queue for review
 */
export async function fetchPendingArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'pending_review')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(20)

  if (error) {
    console.error('Error fetching pending articles:', error)
    throw error
  }

  return data as Article[]
}

/**
 * Fetch articles from articles_queue (newly aggregated)
 */
export async function fetchQueuedArticles() {
  const { data, error } = await supabase
    .from('articles_queue')
    .select('*')
    .eq('status', 'pending_ai_processing')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching queued articles:', error)
    throw error
  }

  return data
}

/**
 * Approve an article
 */
export async function approveArticle(articleId: string, userId: string) {
  const { data, error } = await supabase
    .from('articles')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: userId,
    })
    .eq('id', articleId)
    .select()
    .single()

  if (error) {
    console.error('Error approving article:', error)
    throw error
  }

  return data as Article
}

/**
 * Reject an article
 */
export async function rejectArticle(articleId: string, reason?: string) {
  const { data, error } = await supabase
    .from('articles')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', articleId)
    .select()
    .single()

  if (error) {
    console.error('Error rejecting article:', error)
    throw error
  }

  return data as Article
}

/**
 * Snooze an article (mark for later review)
 */
export async function snoozeArticle(articleId: string, snoozeUntil?: Date) {
  const { data, error } = await supabase
    .from('articles')
    .update({
      status: 'snoozed',
      snoozed_until: snoozeUntil || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', articleId)
    .select()
    .single()

  if (error) {
    console.error('Error snoozing article:', error)
    throw error
  }

  return data as Article
}

/**
 * Update article content
 */
export async function updateArticle(articleId: string, updates: Partial<Article>) {
  const { data, error} = await supabase
    .from('articles')
    .update(updates)
    .eq('id', articleId)
    .select()
    .single()

  if (error) {
    console.error('Error updating article:', error)
    throw error
  }

  return data as Article
}

/**
 * Fetch single article by ID
 */
export async function fetchArticle(articleId: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single()

  if (error) {
    console.error('Error fetching article:', error)
    throw error
  }

  return data as Article
}

/**
 * Delete an article permanently
 */
export async function deleteArticle(articleId: string) {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', articleId)

  if (error) {
    console.error('Error deleting article:', error)
    throw error
  }

  return true
}

/**
 * Batch update articles status
 */
export async function batchUpdateArticles(articleIds: string[], updates: Partial<Article>) {
  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .in('id', articleIds)
    .select()

  if (error) {
    console.error('Error batch updating articles:', error)
    throw error
  }

  return data as Article[]
}

/**
 * Search articles by title or content
 */
export async function searchArticles(query: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .limit(20)

  if (error) {
    console.error('Error searching articles:', error)
    throw error
  }

  return data as Article[]
}

/**
 * Get article statistics
 */
export async function getArticleStats() {
  const { data, error } = await supabase
    .from('articles')
    .select('status')

  if (error) {
    console.error('Error fetching article stats:', error)
    throw error
  }

  const stats = {
    total: data.length,
    pending: data.filter((a) => a.status === 'pending_review').length,
    approved: data.filter((a) => a.status === 'approved').length,
    published: data.filter((a) => a.status === 'published').length,
    rejected: data.filter((a) => a.status === 'rejected').length,
    snoozed: data.filter((a) => a.status === 'snoozed').length,
  }

  return stats
}

/**
 * Subscribe to real-time article changes
 */
export function subscribeToArticles(callback: (article: Article) => void) {
  const subscription = supabase
    .channel('articles-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'articles' },
      (payload) => {
        callback(payload.new as Article)
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'articles' },
      (payload) => {
        callback(payload.new as Article)
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
