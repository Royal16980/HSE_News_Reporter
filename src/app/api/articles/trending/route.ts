import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/articles/trending - Get trending articles
 * Based on views and recent publication date
 */
export async function GET() {
  try {
    // Get articles from the last 7 days with highest view counts
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .gte('published_at', sevenDaysAgo.toISOString())
      .order('views_count', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ articles: data })
  } catch (error) {
    console.error('Error fetching trending articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending articles' },
      { status: 500 }
    )
  }
}

export const runtime = 'edge'
export const revalidate = 600 // Cache for 10 minutes
