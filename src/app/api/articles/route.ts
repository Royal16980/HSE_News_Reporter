import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PAGINATION } from '@/lib/constants'

/**
 * GET /api/articles - List articles with pagination and filtering
 * Query params: page, limit, category, tag, search
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(
      searchParams.get('limit') || String(PAGINATION.DEFAULT_PAGE_SIZE)
    )
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('status', 'published')

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`
      )
    }

    // Execute query with pagination
    const { data, error, count } = await query
      .order('published_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return NextResponse.json({
      articles: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (count || 0) > to + 1,
      },
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export const runtime = 'edge'
