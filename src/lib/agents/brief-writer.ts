/**
 * BRIEF-WRITER — Prosecution Article Drafter
 * Takes a prosecution record (with party join) and writes a full editorial article.
 * Voice: BLACKSITE_AMBER — direct, factual, no PR language. UK newspaper editorial style.
 * Output: inserted into articles table as status='draft', ai_generated=true.
 */

import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const MODEL = 'claude-sonnet-4-6'

// Sonnet 4.6 approximate pricing: Input ~$3/MTok, Output ~$15/MTok → pence
const PENCE_PER_INPUT_TOKEN = 300 / 1_000_000
const PENCE_PER_OUTPUT_TOKEN = 1500 / 1_000_000

export interface BriefWriterInput {
  prosecutionId: string
}

export interface BriefWriterResult {
  articleId: string | null
  title: string
  success: boolean
  costPence: number
}

interface ProsecutionWithParty {
  id: string
  court: string | null
  hearing_date: string | null
  sentence_date: string | null
  sentence_type: string | null
  fine_amount: number | null
  regulations_breached: string[]
  summary: string | null
  sector: string | null
  region: string | null
  parties: {
    name: string
    type: string
    sector: string | null
  } | null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

function formatCurrency(pence: number | null): string {
  if (pence === null) return 'an undisclosed amount'
  return `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 0 })}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'an unspecified date'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

interface ArticleOutput {
  title: string
  slug: string
  excerpt: string
  content: string
  tags: string[]
  sector: string
}

async function draftArticle(prosecution: ProsecutionWithParty): Promise<{
  article: ArticleOutput
  inputTokens: number
  outputTokens: number
}> {
  const defendantName = prosecution.parties?.name ?? 'Unknown Defendant'
  const court = prosecution.court ?? 'an unnamed court'
  const fineFormatted = formatCurrency(prosecution.fine_amount ? prosecution.fine_amount * 100 : null)
  const sentenceDate = formatDate(prosecution.sentence_date)
  const sector = prosecution.sector ?? prosecution.parties?.sector ?? 'general industry'
  const regulations = prosecution.regulations_breached.join(', ') || 'relevant health and safety regulations'
  const region = prosecution.region ?? 'the UK'
  const summary = prosecution.summary ?? 'No summary available.'

  const systemPrompt = `You are a senior reporter for SafetyNews Pro, a specialist UK Health & Safety enforcement news platform.
Editorial voice: BLACKSITE_AMBER. Direct. Factual. No PR language. No passive euphemisms. No corporate sympathy.
Write in UK English. Use 'HSE' not 'the HSE'. Write as a seasoned legal correspondent would for The Guardian's law desk or Private Eye.
Never invent facts not given. If information is absent, acknowledge it plainly. Always name the defendant in the headline.
Output valid JSON only — no prose outside the JSON object.`

  const userPrompt = `Write a full editorial article about this HSE prosecution:

PROSECUTION FACTS:
- Defendant: ${defendantName}
- Court: ${court}
- Sentence date: ${sentenceDate}
- Sentence type: ${prosecution.sentence_type ?? 'fine'}
- Fine amount: ${fineFormatted}
- Regulations breached: ${regulations}
- Region: ${region}
- Sector: ${sector}
- Case summary: ${summary}

Requirements:
1. Title (headline): punchy, factual, names the defendant, references the fine or outcome
2. Slug: URL-safe version of the title (lowercase, hyphens only)
3. Excerpt: exactly 2 sentences. Factual. Sets the scene.
4. Content: full article, 600-900 words, written in Markdown.
   Structure: opening paragraph (the verdict/fine) → background (what happened, what went wrong) →
   regulatory context (which regs were breached and why they exist) →
   HSE enforcement commentary → closing (implications for the sector).
   Use the BLACKSITE_AMBER voice throughout: terse sentences, strong verbs, no corporate waffle.
5. Tags: 4-6 relevant tags (lowercase, e.g. "construction-safety", "riddor", "fines")
6. Sector: single sector string

Output JSON:
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "content": "...",
  "tags": ["...", "..."],
  "sector": "..."
}`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    throw new Error('Brief Writer did not return valid JSON')
  }

  const parsed: ArticleOutput = JSON.parse(jsonMatch[0])

  return {
    article: {
      title: parsed.title ?? `${defendantName} fined for H&S breach`,
      slug: parsed.slug ?? slugify(parsed.title ?? defendantName),
      excerpt: parsed.excerpt ?? summary,
      content: parsed.content ?? '',
      tags: parsed.tags ?? [sector.toLowerCase().replace(/\s+/g, '-')],
      sector: parsed.sector ?? sector,
    },
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  }
}

export async function runBriefWriter(input: BriefWriterInput): Promise<BriefWriterResult> {
  const startMs = Date.now()

  // Fetch prosecution with party join
  const { data: prosecution, error: fetchErr } = await supabaseAdmin
    .from('prosecutions')
    .select(
      `
      id,
      court,
      hearing_date,
      sentence_date,
      sentence_type,
      fine_amount,
      regulations_breached,
      summary,
      sector,
      region,
      parties (
        name,
        type,
        sector
      )
    `,
    )
    .eq('id', input.prosecutionId)
    .single()

  if (fetchErr || !prosecution) {
    console.error('[brief-writer] Failed to fetch prosecution:', fetchErr?.message)
    return { articleId: null, title: '', success: false, costPence: 0 }
  }

  // Log agent_run
  const { data: runRow } = await supabaseAdmin
    .from('agent_runs')
    .insert({
      agent_name: 'brief-writer',
      swarm: 'editorial',
      trigger_type: 'agent',
      status: 'running',
      input_tokens: 0,
      output_tokens: 0,
      cost_pence: 0,
      model: MODEL,
      output_summary: `Drafting article for prosecution ${input.prosecutionId}`,
    })
    .select('id')
    .single()

  const runId: string | null = runRow?.id ?? null

  try {
    const { article, inputTokens, outputTokens } = await draftArticle(
      prosecution as unknown as ProsecutionWithParty,
    )

    const durationMs = Date.now() - startMs
    const costPence = Math.ceil(
      inputTokens * PENCE_PER_INPUT_TOKEN + outputTokens * PENCE_PER_OUTPUT_TOKEN,
    )

    // Insert article
    const { data: insertedArticle, error: insertErr } = await supabaseAdmin
      .from('articles')
      .insert({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        category: 'prosecutions',
        tags: article.tags,
        author: 'NOVA-PRIME desk',
        byline: 'NOVA-PRIME desk · Reviewed by Governance Swarm',
        status: 'draft',
        ai_generated: true,
        investigation: false,
        sector: article.sector,
        priority: 'medium',
        regulation_refs: prosecution.regulations_breached ?? [],
        defendant_refs: [input.prosecutionId],
        development_status: 'final',
        reading_time: estimateReadingTime(article.content),
        views_count: 0,
        views_last_60min: 0,
        views_60_120min: 0,
        velocity_score: 0,
      })
      .select('id')
      .single()

    if (insertErr || !insertedArticle) {
      throw new Error(`Article insert failed: ${insertErr?.message ?? 'no data returned'}`)
    }

    // Update prosecution with article_id
    await supabaseAdmin
      .from('prosecutions')
      .update({ article_id: insertedArticle.id })
      .eq('id', input.prosecutionId)

    // Update agent_run
    if (runId) {
      await supabaseAdmin
        .from('agent_runs')
        .update({
          status: 'success',
          duration_ms: durationMs,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_pence: costPence,
          output_summary: `Drafted: ${article.title}`,
        })
        .eq('id', runId)
    }

    console.log(`[brief-writer] Done: "${article.title}" → article ${insertedArticle.id} (${durationMs}ms)`)

    return {
      articleId: insertedArticle.id,
      title: article.title,
      success: true,
      costPence,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const durationMs = Date.now() - startMs

    if (runId) {
      await supabaseAdmin
        .from('agent_runs')
        .update({
          status: 'failed',
          duration_ms: durationMs,
          error_message: message,
        })
        .eq('id', runId)
    }

    console.error('[brief-writer] Error:', message)
    return { articleId: null, title: '', success: false, costPence: 0 }
  }
}
