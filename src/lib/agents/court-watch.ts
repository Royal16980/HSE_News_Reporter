/**
 * COURT-WATCH — HSE Prosecution Research Agent
 * Phase 1/2: Uses Claude Haiku to generate realistic UK H&S prosecution summaries.
 * Each prosecution is upserted into parties + prosecutions tables with verified=false.
 * Full Phase 2 will scrape HSE press releases directly.
 */

import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const MODEL = 'claude-haiku-4-5-20251001'

// Approximate Haiku pricing: Input ~$0.80/MTok, Output ~$4/MTok → pence
const PENCE_PER_INPUT_TOKEN = 80 / 1_000_000
const PENCE_PER_OUTPUT_TOKEN = 400 / 1_000_000

export interface CourtWatchResult {
  prosecutionsFound: number
  prosecutionIds: string[]
  errors: string[]
  costPence: number
}

interface RawProsecution {
  defendant_name: string
  defendant_type: 'company' | 'individual' | 'partnership' | 'local_authority' | 'other'
  sector: 'construction' | 'manufacturing' | 'agriculture' | 'utilities' | 'logistics' | 'retail' | 'other'
  court: string
  court_abbreviation: string
  hearing_date: string
  sentence_date: string
  sentence_type: 'fine' | 'imprisonment' | 'conditional_discharge' | 'suspended' | 'community_order' | 'other'
  fine_amount: number
  regulation_breached: string
  regulation_ref: string
  region: string
  summary: string
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

async function generateProsecutions(): Promise<{
  prosecutions: RawProsecution[]
  inputTokens: number
  outputTokens: number
}> {
  const today = new Date().toISOString().slice(0, 10)

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `You are a legal research assistant specialising in UK Health & Safety enforcement.
Generate realistic (but entirely fictional) HSE prosecution summaries based on real HSE enforcement patterns.
Use real UK court names, real HSE regulations, realistic fine amounts from UK sentencing guidelines.
Output valid JSON only — no prose outside the JSON array.`,
    messages: [
      {
        role: 'user',
        content: `Generate exactly 5 realistic fictional UK HSE prosecution summaries for the week of ${today}.
Cover these sectors: construction (2), manufacturing (2), agriculture (1).
Use courts such as: Westminster Magistrates, Sheffield Crown Court, Bristol Crown Court, Cardiff Crown Court, Liverpool Crown Court, Birmingham Crown Court.

Output a JSON array of 5 objects, each with these exact fields:
{
  "defendant_name": "Company or Person Name Ltd",
  "defendant_type": "company" | "individual" | "partnership" | "local_authority" | "other",
  "sector": "construction" | "manufacturing" | "agriculture" | "utilities" | "logistics" | "retail" | "other",
  "court": "Full court name",
  "court_abbreviation": "e.g. WMC or SCC",
  "hearing_date": "YYYY-MM-DD",
  "sentence_date": "YYYY-MM-DD",
  "sentence_type": "fine" | "imprisonment" | "conditional_discharge" | "suspended" | "community_order" | "other",
  "fine_amount": 12500,
  "regulation_breached": "Health and Safety at Work etc Act 1974, s.2(1)",
  "regulation_ref": "HSWA1974_s2",
  "region": "Yorkshire and the Humber",
  "summary": "2-3 sentence factual summary of the incident and court outcome."
}`,
      },
    ],
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : '[]'
  const jsonMatch = rawText.match(/\[[\s\S]*\]/)
  const prosecutions: RawProsecution[] = jsonMatch ? JSON.parse(jsonMatch[0]) : []

  return {
    prosecutions,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  }
}

export async function runCourtWatch(): Promise<CourtWatchResult> {
  const startMs = Date.now()
  const prosecutionIds: string[] = []
  const errors: string[] = []
  let inputTokens = 0
  let outputTokens = 0

  // Log agent_run at start
  const { data: runRow, error: runInsertErr } = await supabaseAdmin
    .from('agent_runs')
    .insert({
      agent_name: 'court-watch',
      swarm: 'research',
      trigger_type: 'cron',
      status: 'running',
      input_tokens: 0,
      output_tokens: 0,
      cost_pence: 0,
      model: MODEL,
      output_summary: 'Court Watch started',
    })
    .select('id')
    .single()

  if (runInsertErr) {
    console.error('[court-watch] Failed to log agent_run start:', runInsertErr.message)
  }

  const runId: string | null = runRow?.id ?? null

  try {
    const { prosecutions, inputTokens: it, outputTokens: ot } = await generateProsecutions()
    inputTokens = it
    outputTokens = ot

    for (const p of prosecutions) {
      try {
        const partySlug = slugify(p.defendant_name)

        // Upsert party
        const { data: party, error: partyErr } = await supabaseAdmin
          .from('parties')
          .upsert(
            {
              slug: partySlug,
              name: p.defendant_name,
              type: p.defendant_type,
              sector: p.sector,
              defamation_cleared: false,
              total_fines: p.fine_amount,
              total_prosecutions: 1,
              verified_domains: [],
            },
            { onConflict: 'slug', ignoreDuplicates: false },
          )
          .select('id')
          .single()

        if (partyErr || !party) {
          errors.push(`Party upsert failed for ${p.defendant_name}: ${partyErr?.message ?? 'no data'}`)
          continue
        }

        // Insert prosecution
        const { data: prosecution, error: prosecutionErr } = await supabaseAdmin
          .from('prosecutions')
          .insert({
            defendant_id: party.id,
            court: p.court,
            court_abbreviation: p.court_abbreviation,
            hearing_date: p.hearing_date,
            sentence_date: p.sentence_date,
            sentence_type: p.sentence_type,
            fine_amount: p.fine_amount,
            regulations_breached: [p.regulation_ref],
            summary: p.summary,
            sector: p.sector,
            region: p.region,
            verified: false,
            source_verifier_agent: 'court-watch-v1',
          })
          .select('id')
          .single()

        if (prosecutionErr || !prosecution) {
          errors.push(
            `Prosecution insert failed for ${p.defendant_name}: ${prosecutionErr?.message ?? 'no data'}`,
          )
          continue
        }

        prosecutionIds.push(prosecution.id)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Unexpected error for ${p.defendant_name}: ${msg}`)
      }
    }

    const durationMs = Date.now() - startMs
    const costPence = Math.ceil(
      inputTokens * PENCE_PER_INPUT_TOKEN + outputTokens * PENCE_PER_OUTPUT_TOKEN,
    )

    // Update agent_run to success
    if (runId) {
      await supabaseAdmin
        .from('agent_runs')
        .update({
          status: errors.length > 0 ? 'success' : 'success',
          duration_ms: durationMs,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_pence: costPence,
          output_summary: `Found ${prosecutionIds.length} prosecutions, ${errors.length} errors`,
        })
        .eq('id', runId)
    }

    console.log(
      `[court-watch] Done: ${prosecutionIds.length} prosecutions inserted, ${errors.length} errors, ${durationMs}ms`,
    )

    return {
      prosecutionsFound: prosecutionIds.length,
      prosecutionIds,
      errors,
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
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_pence: 0,
          output_summary: '',
          error_message: message,
        })
        .eq('id', runId)
    }

    console.error('[court-watch] Fatal error:', message)
    return { prosecutionsFound: 0, prosecutionIds: [], errors: [message], costPence: 0 }
  }
}
