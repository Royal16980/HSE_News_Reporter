import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/subscribe - Newsletter subscription endpoint
 * Adds email to newsletter_subscribers table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Insert into database
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, verified: false }] as any[])
      .select()
      .single()

    if (error) {
      // Check if email already exists
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 409 }
        )
      }
      throw error
    }

    // TODO: Send verification email here
    // For now, we'll just return success

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed! Please check your email to verify.',
        data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}

/**
 * Configure runtime to use Edge for better performance
 */
export const runtime = 'edge'
