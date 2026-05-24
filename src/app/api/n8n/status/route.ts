import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/n8n/status
 * Returns statistics for n8n automation monitoring
 * Called by n8n workflows or monitoring dashboards
 */
export async function GET(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get articles pending review
    const { data: pendingArticles, error: pendingError } = await supabase
      .from('articles')
      .select('id, priority, created_at')
      .eq('status', 'pending_review')

    if (pendingError) throw pendingError

    // Get articles published in last 24 hours
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: recentArticles, error: recentError } = await supabase
      .from('articles')
      .select('id, published_at')
      .eq('status', 'published')
      .gte('published_at', oneDayAgo.toISOString())

    if (recentError) throw recentError

    // Get error count from last 24 hours
    const { data: errors, error: errorsError } = await supabase
      .from('error_logs')
      .select('id, workflow_name')
      .gte('created_at', oneDayAgo.toISOString())

    // Count by priority
    const articles = (pendingArticles ?? []) as Array<{ priority?: string; [key: string]: unknown }>
    const highPriority = articles.filter((a) => a.priority === 'HIGH').length
    const mediumPriority = articles.filter((a) => a.priority === 'MEDIUM').length
    const lowPriority = articles.filter((a) => a.priority === 'LOW').length

    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      statistics: {
        pending_review: {
          total: pendingArticles?.length || 0,
          high_priority: highPriority,
          medium_priority: mediumPriority,
          low_priority: lowPriority,
        },
        published_last_24h: recentArticles?.length || 0,
        errors_last_24h: errors?.length || 0,
      },
      health: {
        database: 'connected',
        workflows: errors && errors.length > 10 ? 'degraded' : 'healthy',
      },
    })
  } catch (error) {
    console.error('[n8n Status] Error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to fetch statistics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export const runtime = 'edge'
export const revalidate = 60 // Cache for 1 minute
