import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * POST /api/revalidate
 * On-demand revalidation endpoint for ISR
 * Called by n8n workflows after article updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, path, tag } = body

    // Verify revalidation secret
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    if (!path && !tag) {
      return NextResponse.json(
        { error: 'Either path or tag is required' },
        { status: 400 }
      )
    }

    // Revalidate by path or tag
    if (path) {
      revalidatePath(path)
      console.log(`[Revalidate] Path revalidated: ${path}`)
    }

    if (tag) {
      revalidateTag(tag)
      console.log(`[Revalidate] Tag revalidated: ${tag}`)
    }

    return NextResponse.json({
      revalidated: true,
      path: path || null,
      tag: tag || null,
      now: Date.now(),
    })
  } catch (error) {
    console.error('[Revalidate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

/**
 * Use Edge Runtime for faster response times
 */
export const runtime = 'edge'
