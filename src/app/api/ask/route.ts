import { type NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 30

const SYSTEM_PROMPT =
  'You are the SafetyNews Pro AI assistant, expert in UK Health & Safety law, HSE enforcement, ' +
  'RIDDOR, COSHH, CDM, PUWER, and all major H&S regulations. Answer questions accurately and cite ' +
  'specific regulations when relevant. Be concise and direct.'

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 400

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  let question: string
  let sectorContext: string | undefined

  try {
    const body = await req.json()
    question = body.question
    sectorContext = body.sectorContext
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const userMessage = sectorContext
    ? `[Sector context: ${sectorContext}]\n\n${question.trim()}`
    : question.trim()

  // Fire-and-forget QA session log — do not await
  const sessionId = crypto.randomUUID()
  let fullAnswer = ''

  // Start Anthropic streaming
  let stream: Anthropic.MessageStreamEvent[] | null = null
  try {
    const anthropicStream = await client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    // Collect full answer for logging
    anthropicStream.on('text', (text) => {
      fullAnswer += text
    })

    // Build a ReadableStream for the response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()

          // Log to qa_sessions (fire and forget)
          supabaseAdmin
            .from('qa_sessions')
            .insert({
              session_id: sessionId,
              question: question.trim(),
              answer: fullAnswer,
              sector_context: sectorContext ?? null,
              sources_cited: [],
            })
            .then(({ error }) => {
              if (error) console.error('[ask] qa_sessions log failed:', error.message)
            })
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-Id': sessionId,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ask] Anthropic error:', message)
    return NextResponse.json({ error: 'AI request failed', detail: message }, { status: 500 })
  }
}
