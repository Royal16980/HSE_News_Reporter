/**
 * NOVA-PRIME — Editor-in-Chief Brain (hello-world cycle)
 * Phase 0/1: Minimal 15-minute orchestrator cycle.
 * Reads world state, makes one editorial decision, logs to editorial_decisions, exits.
 *
 * Full NOVA-PRIME (Opus 4.7 stateful Ruflo orchestrator) is built in Phase 1.
 * This hello-world validates:
 *   - Supabase write to editorial_decisions
 *   - Anthropic API connectivity
 *   - Cost logging
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

interface WorldState {
  pendingArticles: number
  publishedToday: number
  agentErrors: number
  lastEditorialDecision: string | null
}

async function readWorldState(): Promise<WorldState> {
  const today = new Date().toISOString().slice(0, 10)

  const [pending, published, errors, lastDecision] = await Promise.all([
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending_review', 'approved']),
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', today),
    supabase
      .from('agent_runs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('run_at', new Date(Date.now() - 60 * 60_000).toISOString()),
    supabase
      .from('editorial_decisions')
      .select('rationale')
      .order('cycle_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  return {
    pendingArticles: pending.count ?? 0,
    publishedToday: published.count ?? 0,
    agentErrors: errors.count ?? 0,
    lastEditorialDecision: lastDecision.data?.rationale ?? null,
  }
}

async function makeEditorialDecision(state: WorldState): Promise<{
  decisionType: string
  rationale: string
  directives: Record<string, unknown>
  inputTokens: number
  outputTokens: number
}> {
  const systemPrompt = `You are NOVA-PRIME, the autonomous editor-in-chief of SafetyNews Pro — a UK Health & Safety news platform.
Your role: read world state, decide the single most important editorial priority for the next 15 minutes, emit a directive.
You are terse, precise, enforcement-officer-credible. No marketing language. UK English.
Output JSON only.`

  const userPrompt = `World state as of ${new Date().toISOString()}:
- Pending articles awaiting review: ${state.pendingArticles}
- Articles published today: ${state.publishedToday}
- Agent errors in last hour: ${state.agentErrors}
- Last editorial decision: ${state.lastEditorialDecision ?? 'none'}

Respond with JSON:
{
  "decision_type": "agenda_priority | swarm_directive | quality_check | escalation",
  "rationale": "one sentence — why this decision, what it changes",
  "priority_action": "what the next swarm cycle should focus on",
  "directives": { "swarm": "research|editorial|governance|ops", "instruction": "..." }
}`

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 256,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : '{}'
  let parsed: { decision_type?: string; rationale?: string; directives?: Record<string, unknown> } = {}

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
  } catch {
    parsed = {
      decision_type: 'agenda_priority',
      rationale: 'Hello-world cycle — NOVA-PRIME initialised and operational.',
      directives: { swarm: 'research', instruction: 'Begin content aggregation.' },
    }
  }

  return {
    decisionType: parsed.decision_type ?? 'agenda_priority',
    rationale: parsed.rationale ?? 'No rationale provided.',
    directives: parsed.directives ?? {},
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  }
}

async function logDecision(params: {
  decisionType: string
  rationale: string
  directives: Record<string, unknown>
  costPence: number
  model: string
}): Promise<void> {
  const { error } = await supabase.from('editorial_decisions').insert({
    decision_type: params.decisionType,
    rationale: params.rationale,
    directives: params.directives,
    cost_pence: params.costPence,
    model: params.model,
  })

  if (error) {
    console.error('[NOVA-PRIME] Failed to log editorial decision:', error.message)
    throw error
  }
}

async function logAgentRun(params: {
  status: 'success' | 'failed'
  durationMs: number
  inputTokens: number
  outputTokens: number
  costPence: number
  outputSummary: string
  errorMessage?: string
}): Promise<void> {
  await supabase.from('agent_runs').insert({
    agent_name: 'nova-prime',
    swarm: 'orchestrator',
    trigger_type: 'cron',
    status: params.status,
    duration_ms: params.durationMs,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
    cost_pence: params.costPence,
    model: 'claude-opus-4-7',
    output_summary: params.outputSummary,
    error_message: params.errorMessage,
  })
}

/**
 * Main entry point — called by the cron route every 15 minutes.
 */
export async function runNovaPrimeCycle(): Promise<{
  success: boolean
  decisionType?: string
  rationale?: string
  costPence?: number
  durationMs?: number
  error?: string
}> {
  const startMs = Date.now()

  // Token costs for claude-opus-4-7 (approximate as of May 2026)
  // Input: $15/MTok, Output: $75/MTok — convert to pence
  const PENCE_PER_INPUT_TOKEN = 15_00 / 1_000_000   // £0.0015 per 100 tokens
  const PENCE_PER_OUTPUT_TOKEN = 75_00 / 1_000_000  // £0.0075 per 100 tokens

  try {
    const state = await readWorldState()
    const decision = await makeEditorialDecision(state)
    const durationMs = Date.now() - startMs

    const costPence = Math.ceil(
      decision.inputTokens * PENCE_PER_INPUT_TOKEN +
      decision.outputTokens * PENCE_PER_OUTPUT_TOKEN,
    )

    await logDecision({
      decisionType: decision.decisionType,
      rationale: decision.rationale,
      directives: decision.directives,
      costPence,
      model: 'claude-opus-4-7',
    })

    await logAgentRun({
      status: 'success',
      durationMs,
      inputTokens: decision.inputTokens,
      outputTokens: decision.outputTokens,
      costPence,
      outputSummary: decision.rationale,
    })

    console.log(`[NOVA-PRIME] Cycle complete in ${durationMs}ms — ${decision.rationale}`)

    return {
      success: true,
      decisionType: decision.decisionType,
      rationale: decision.rationale,
      costPence,
      durationMs,
    }
  } catch (err) {
    const durationMs = Date.now() - startMs
    const message = err instanceof Error ? err.message : String(err)

    await logAgentRun({
      status: 'failed',
      durationMs,
      inputTokens: 0,
      outputTokens: 0,
      costPence: 0,
      outputSummary: '',
      errorMessage: message,
    }).catch(() => {})

    console.error('[NOVA-PRIME] Cycle failed:', message)
    return { success: false, error: message, durationMs }
  }
}
