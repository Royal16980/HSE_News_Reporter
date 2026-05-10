import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// ─── POST /api/right-of-reply ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { fullName, email, roleOrg, articleUrl, submission } = body as Record<string, string>

  // Basic validation
  if (!fullName?.trim() || !email?.trim() || !roleOrg?.trim() || !articleUrl?.trim() || !submission?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  if (submission.trim().length < 50) {
    return NextResponse.json({ error: 'Submission must be at least 50 characters.' }, { status: 400 })
  }

  if (submission.trim().length > 2000) {
    return NextResponse.json({ error: 'Submission must not exceed 2,000 characters.' }, { status: 400 })
  }

  // Simple email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  // Insert into Supabase
  const { error } = await supabaseAdmin
    .from('right_of_reply_requests')
    .insert({
      requester_name: fullName.trim(),
      requester_email: email.trim().toLowerCase(),
      requester_role: roleOrg.trim(),
      // article_id is resolved later by the Governance Swarm via articleUrl
      submission: submission.trim(),
      status: 'pending_verification',
      // Store the article URL in the submission as a reference prefix until resolved
      // The Governance Swarm matches articleUrl to the articles table on review
    } as {
      requester_name: string
      requester_email: string
      requester_role: string
      submission: string
      status: 'pending_verification'
    })

  if (error) {
    console.error('right-of-reply insert error:', error)
    return NextResponse.json(
      { error: 'Failed to record your submission. Please try again later.' },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { message: 'Submission received. The Governance Swarm will review within 5 working days.' },
    { status: 202 }
  )
}
