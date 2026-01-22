import { getSupabaseClient } from '../supabase'
import type { Article } from '@/types'

export type ScheduledArticle = Article & {
  scheduled_publish_time?: string | null
  status?: string
}

const supabase = getSupabaseClient()

/**
 * Fetch scheduled articles for a date range
 */
export async function fetchScheduledArticles(startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .gte('scheduled_publish_time', startDate.toISOString())
    .lte('scheduled_publish_time', endDate.toISOString())
    .order('scheduled_publish_time', { ascending: true })

  if (error) {
    console.error('Error fetching scheduled articles:', error)
    throw error
  }

  return data as Article[]
}

/**
 * Fetch articles scheduled for a specific day
 */
export async function fetchArticlesForDay(date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return fetchScheduledArticles(startOfDay, endOfDay)
}

/**
 * Fetch articles scheduled for this week
 */
export async function fetchWeekSchedule() {
  const now = new Date()
  const startOfWeek = new Date(now)
  const mondayOffset = (now.getDay() + 6) % 7
  startOfWeek.setDate(now.getDate() - mondayOffset) // Monday
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  return fetchScheduledArticles(startOfWeek, endOfWeek)
}

/**
 * Schedule an article for publishing
 */
export async function scheduleArticle(articleId: string, publishTime: Date) {
  const { data, error } = await supabase
    .from('articles')
    .update({
      scheduled_publish_time: publishTime.toISOString(),
      status: 'scheduled',
    })
    .eq('id', articleId)
    .select()
    .single()

  if (error) {
    console.error('Error scheduling article:', error)
    throw error
  }

  return data as Article
}

/**
 * Reschedule an article to a new time
 */
export async function rescheduleArticle(articleId: string, newPublishTime: Date) {
  return scheduleArticle(articleId, newPublishTime)
}

/**
 * Unschedule an article
 */
export async function unscheduleArticle(articleId: string) {
  const { data, error } = await supabase
    .from('articles')
    .update({
      scheduled_publish_time: null,
      status: 'approved',
    })
    .eq('id', articleId)
    .select()
    .single()

  if (error) {
    console.error('Error unscheduling article:', error)
    throw error
  }

  return data as Article
}

/**
 * Get optimal publish time suggestion based on category and priority
 */
export async function suggestPublishTime(category: string, priority: 'HIGH' | 'MEDIUM' | 'LOW') {
  // Call the database function we created in setup
  const { data, error } = await supabase.rpc('calculate_next_publish_time', {
    p_priority: priority,
    p_category: category,
  })

  if (error) {
    console.error('Error calculating publish time:', error)
    // Fallback to simple calculation
    return calculateFallbackPublishTime(category, priority)
  }

  return new Date(data)
}

/**
 * Fallback publish time calculation (if DB function not available)
 */
function calculateFallbackPublishTime(category: string, priority: 'HIGH' | 'MEDIUM' | 'LOW'): Date {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Set time based on priority
  if (priority === 'HIGH') {
    tomorrow.setHours(9, 0, 0, 0) // 9 AM
  } else if (category === 'Regulations & Compliance') {
    tomorrow.setHours(9, 0, 0, 0) // 9 AM
  } else if (category === 'Industry News') {
    tomorrow.setHours(13, 0, 0, 0) // 1 PM
  } else {
    tomorrow.setHours(11, 0, 0, 0) // 11 AM
  }

  // Add some randomness (±30 minutes)
  const randomMinutes = Math.floor(Math.random() * 60) - 30
  tomorrow.setMinutes(tomorrow.getMinutes() + randomMinutes)

  return tomorrow
}

/**
 * Check for scheduling conflicts (too many articles at similar time)
 */
export async function checkSchedulingConflicts(publishTime: Date, windowMinutes: number = 60) {
  const startWindow = new Date(publishTime)
  startWindow.setMinutes(startWindow.getMinutes() - windowMinutes / 2)

  const endWindow = new Date(publishTime)
  endWindow.setMinutes(endWindow.getMinutes() + windowMinutes / 2)

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, scheduled_publish_time')
    .gte('scheduled_publish_time', startWindow.toISOString())
    .lte('scheduled_publish_time', endWindow.toISOString())
    .eq('status', 'scheduled')

  if (error) {
    console.error('Error checking scheduling conflicts:', error)
    throw error
  }

  return {
    hasConflicts: data.length > 0,
    conflictingArticles: data,
    count: data.length,
  }
}

/**
 * Batch schedule multiple articles
 */
export async function batchScheduleArticles(
  schedules: Array<{ articleId: string; publishTime: Date }>
) {
  const updates = schedules.map(({ articleId, publishTime }) => ({
    id: articleId,
    scheduled_publish_time: publishTime.toISOString(),
    status: 'scheduled',
  }))

  const { data, error } = await supabase
    .from('articles')
    .upsert(updates, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('Error batch scheduling articles:', error)
    throw error
  }

  return data as Article[]
}

/**
 * Get schedule statistics
 */
export async function getScheduleStats() {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  const { data: todayArticles, error: todayError } = await supabase
    .from('articles')
    .select('id')
    .gte('scheduled_publish_time', today.toISOString())
    .lte('scheduled_publish_time', endOfDay.toISOString())
    .eq('status', 'scheduled')

  const { data: allScheduled, error: allError } = await supabase
    .from('articles')
    .select('id')
    .eq('status', 'scheduled')

  if (todayError || allError) {
    console.error('Error fetching schedule stats')
    return { scheduledToday: 0, totalScheduled: 0 }
  }

  return {
    scheduledToday: todayArticles?.length || 0,
    totalScheduled: allScheduled?.length || 0,
  }
}

/**
 * Auto-schedule approved articles
 */
export async function autoScheduleApprovedArticles() {
  // Fetch approved articles without schedule
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'approved')
    .is('scheduled_publish_time', null)
    .limit(10)

  if (error || !articles || articles.length === 0) {
    return []
  }

  // Schedule each article
  const schedules = []
  for (const article of articles) {
    const publishTime = await suggestPublishTime(
      article.category,
      article.priority || 'MEDIUM'
    )
    schedules.push({ articleId: article.id, publishTime })
  }

  return batchScheduleArticles(schedules)
}
