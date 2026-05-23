import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS for publishing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/publish
 * Inserts a new article into the articles table.
 *
 * Expected body (JSON):
 * {
 *   title: string          — required
 *   slug: string           — required, must be unique
 *   summary: string        — required (maps to excerpt)
 *   body: string           — required (maps to content, markdown)
 *   category: string       — required, must match a categories.slug value
 *   image_url?: string     — optional featured image URL
 *   published_at?: string  — ISO timestamp, defaults to now()
 *   status?: string        — 'published' | 'draft', defaults to 'published'
 *   author?: string        — defaults to 'HSE News Team'
 *   tags?: string[]        — optional array of tag strings
 *   reading_time?: number  — optional, auto-calculated from body if omitted
 * }
 *
 * Authentication: Bearer token must match WEBHOOK_SECRET env var.
 */
export async function POST(request: NextRequest) {
  try {
    // Validate auth header
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()
    const expectedSecret = process.env.WEBHOOK_SECRET || ''

    if (expectedSecret && token !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const {
      title,
      slug,
      summary,
      body: content,
      category,
      image_url,
      published_at,
      status = 'published',
      author = 'HSE News Team',
      tags = [],
      reading_time,
    } = body

    // Validate required fields
    if (!title || !slug || !summary || !content || !category) {
      return NextResponse.json(
        {
          error: 'Missing required fields: title, slug, summary, body, category',
        },
        { status: 400 }
      )
    }

    // Auto-calculate reading time if not provided (avg 200 wpm)
    const wordCount = content.split(/\s+/).length
    const calculatedReadingTime = reading_time ?? Math.max(1, Math.round(wordCount / 200))

    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert({
        title,
        slug,
        excerpt: summary,
        content,
        category,
        featured_image_url: image_url || null,
        published_at: published_at || new Date().toISOString(),
        status,
        author,
        tags: Array.isArray(tags) ? tags : [],
        reading_time: calculatedReadingTime,
      })
      .select('id, slug, title, status, published_at')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `Slug "${slug}" already exists` },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        article: data,
        url: `/news/${slug}`,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Publish endpoint error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
