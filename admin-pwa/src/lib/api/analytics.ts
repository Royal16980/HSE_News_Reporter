import { getSupabaseClient } from '../supabase'

const supabase = getSupabaseClient()

export interface AnalyticsOverview {
  totalArticles: number
  publishedToday: number
  pendingReview: number
  scheduledArticles: number
  totalViews: number
  avgQualityScore: number
  categoryBreakdown: Array<{ category: string; count: number }>
  recentTrend: 'up' | 'down' | 'stable'
  changePercent: number
}

export interface ViewsData {
  date: string
  views: number
  uniqueVisitors: number
}

export interface CategoryPerformance {
  category: string
  articles: number
  views: number
  avgEngagement: number
}

/**
 * Fetch analytics overview
 */
export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const twoWeeksAgo = new Date(now)
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  // Fetch all stats in parallel
  const [totalRes, todayRes, pendingRes, scheduledRes, categoriesRes, lastWeekRes, prevWeekRes] =
    await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }),
      supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('published_at', todayStart.toISOString()),
      supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending_review'),
      supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'scheduled'),
      supabase.from('articles').select('category'),
      supabase
        .from('articles')
        .select('id')
        .eq('status', 'published')
        .gte('published_at', weekAgo.toISOString()),
      supabase
        .from('articles')
        .select('id')
        .eq('status', 'published')
        .gte('published_at', twoWeeksAgo.toISOString())
        .lt('published_at', weekAgo.toISOString()),
    ])

  // Calculate category breakdown
  const categoryMap = new Map<string, number>()
  categoriesRes.data?.forEach((article) => {
    const cat = article.category || 'Uncategorized'
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
  })

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  // Calculate trend
  const lastWeekCount = lastWeekRes.data?.length || 0
  const prevWeekCount = prevWeekRes.data?.length || 0
  const changePercent =
    prevWeekCount > 0 ? ((lastWeekCount - prevWeekCount) / prevWeekCount) * 100 : 0
  const recentTrend =
    changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable'

  return {
    totalArticles: totalRes.count || 0,
    publishedToday: todayRes.count || 0,
    pendingReview: pendingRes.count || 0,
    scheduledArticles: scheduledRes.count || 0,
    totalViews: 0, // Would come from analytics table if implemented
    avgQualityScore: 0, // Would calculate from articles with quality_score
    categoryBreakdown,
    recentTrend,
    changePercent: Math.round(changePercent),
  }
}

/**
 * Fetch views data for chart (last 30 days)
 */
export async function fetchViewsData(): Promise<ViewsData[]> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // This would come from an analytics_events table if you have one
  // For now, we'll generate mock data based on published articles
  const { data, error } = await supabase
    .from('articles')
    .select('published_at')
    .eq('status', 'published')
    .gte('published_at', thirtyDaysAgo.toISOString())
    .order('published_at', { ascending: true })

  if (error || !data) {
    return []
  }

  // Group by date
  const viewsByDate = new Map<string, number>()
  data.forEach((article) => {
    const date = new Date(article.published_at).toISOString().split('T')[0]
    viewsByDate.set(date, (viewsByDate.get(date) || 0) + 1)
  })

  // Fill in missing dates with 0
  const result: ViewsData[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    result.push({
      date: dateStr,
      views: (viewsByDate.get(dateStr) || 0) * 100, // Mock multiplier
      uniqueVisitors: (viewsByDate.get(dateStr) || 0) * 75,
    })
  }

  return result
}

/**
 * Fetch category performance data
 */
export async function fetchCategoryPerformance(): Promise<CategoryPerformance[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('category')
    .eq('status', 'published')

  if (error || !data) {
    return []
  }

  // Count by category
  const categoryMap = new Map<string, number>()
  data.forEach((article) => {
    const cat = article.category || 'Uncategorized'
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
  })

  // Convert to performance data
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      articles: count,
      views: count * 150, // Mock views
      avgEngagement: Math.random() * 100, // Mock engagement
    }))
    .sort((a, b) => b.articles - a.articles)
}

/**
 * Fetch top performing articles
 */
export async function fetchTopArticles(limit: number = 10) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, category, published_at, views, engagement_score')
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top articles:', error)
    return []
  }

  return data
}

/**
 * Fetch publishing frequency over time
 */
export async function fetchPublishingFrequency(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('articles')
    .select('published_at, status')
    .eq('status', 'published')
    .gte('published_at', startDate.toISOString())
    .order('published_at', { ascending: true })

  if (error || !data) {
    return []
  }

  // Group by date
  const frequencyMap = new Map<string, number>()
  data.forEach((article) => {
    const date = new Date(article.published_at).toISOString().split('T')[0]
    frequencyMap.set(date, (frequencyMap.get(date) || 0) + 1)
  })

  return Array.from(frequencyMap.entries()).map(([date, count]) => ({
    date,
    published: count,
  }))
}

/**
 * Fetch workflow efficiency metrics
 */
export async function fetchWorkflowMetrics() {
  const now = new Date()
  const last7Days = new Date(now)
  last7Days.setDate(last7Days.getDate() - 7)

  const { data, error } = await supabase
    .from('articles')
    .select('created_at, approved_at, published_at, status')
    .gte('created_at', last7Days.toISOString())

  if (error || !data) {
    return {
      avgTimeToApproval: 0,
      avgTimeToPublish: 0,
      approvalRate: 0,
      publishRate: 0,
    }
  }

  // Calculate metrics
  let totalApprovalTime = 0
  let totalPublishTime = 0
  let approvedCount = 0
  let publishedCount = 0

  data.forEach((article) => {
    if (article.approved_at && article.created_at) {
      const approvalTime =
        new Date(article.approved_at).getTime() - new Date(article.created_at).getTime()
      totalApprovalTime += approvalTime
      approvedCount++
    }

    if (article.published_at && article.approved_at) {
      const publishTime =
        new Date(article.published_at).getTime() - new Date(article.approved_at).getTime()
      totalPublishTime += publishTime
      publishedCount++
    }
  })

  const avgApprovalHours = approvedCount > 0 ? totalApprovalTime / approvedCount / (1000 * 60 * 60) : 0
  const avgPublishHours = publishedCount > 0 ? totalPublishTime / publishedCount / (1000 * 60 * 60) : 0

  return {
    avgTimeToApproval: Math.round(avgApprovalHours * 10) / 10,
    avgTimeToPublish: Math.round(avgPublishHours * 10) / 10,
    approvalRate: Math.round((approvedCount / data.length) * 100),
    publishRate: Math.round((publishedCount / data.length) * 100),
  }
}

/**
 * Fetch quality score distribution
 */
export async function fetchQualityScores() {
  const { data, error } = await supabase
    .from('articles')
    .select('quality_score')
    .not('quality_score', 'is', null)

  if (error || !data) {
    return {
      excellent: 0, // 9-10
      good: 0, // 7-9
      fair: 0, // 5-7
      poor: 0, // <5
    }
  }

  const scores = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
  }

  data.forEach((article) => {
    const score = article.quality_score
    if (score >= 9) scores.excellent++
    else if (score >= 7) scores.good++
    else if (score >= 5) scores.fair++
    else scores.poor++
  })

  return scores
}

/**
 * Generate weekly report data
 */
export async function generateWeeklyReport() {
  const [overview, views, categories, workflow, topArticles] = await Promise.all([
    fetchAnalyticsOverview(),
    fetchViewsData(),
    fetchCategoryPerformance(),
    fetchWorkflowMetrics(),
    fetchTopArticles(5),
  ])

  return {
    overview,
    views: views.slice(-7), // Last 7 days
    categories,
    workflow,
    topArticles,
    generatedAt: new Date().toISOString(),
  }
}
