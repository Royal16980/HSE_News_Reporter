import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

/**
 * POST /api/webhook/article-published
 * Webhook endpoint triggered when an article is published
 * Called by n8n auto-publisher workflow or manual publish action
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret for security
    const headersList = headers()
    const secret = headersList.get('x-webhook-secret')

    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { article_id, slug, title, excerpt, featured_image_url } = body

    console.log(`[Webhook] Article published: ${title} (${slug})`)

    // Trigger social media distribution via n8n workflow
    if (process.env.N8N_SOCIAL_WEBHOOK_URL) {
      try {
        const response = await fetch(process.env.N8N_SOCIAL_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': process.env.WEBHOOK_SECRET || '',
          },
          body: JSON.stringify({
            article_id,
            slug,
            title,
            excerpt,
            featured_image_url,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${slug}`,
          }),
        })

        if (!response.ok) {
          console.error('[Webhook] Failed to trigger social distribution:', response.statusText)
        } else {
          console.log('[Webhook] Social distribution triggered successfully')
        }
      } catch (error) {
        console.error('[Webhook] Error triggering social distribution:', error)
        // Don't fail the webhook if social distribution fails
      }
    }

    // Revalidate article page and homepage
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.REVALIDATE_SECRET,
          path: `/articles/${slug}`,
        }),
      })

      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.REVALIDATE_SECRET,
          path: '/',
        }),
      })

      console.log('[Webhook] Cache revalidated successfully')
    } catch (error) {
      console.error('[Webhook] Error revalidating cache:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'Article published successfully',
      article_id,
      slug,
    })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

/**
 * Use Edge Runtime for faster response times
 */
export const runtime = 'edge'
