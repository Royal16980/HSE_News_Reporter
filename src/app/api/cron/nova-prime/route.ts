import { type NextRequest, NextResponse } from 'next/server'
import { runNovaPrimeCycle } from '@/lib/agents/nova-prime'
import { runCourtWatch } from '@/lib/agents/court-watch'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Vercel Cron sends the Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Run primary NOVA-PRIME cycle
  const result = await runNovaPrimeCycle()

  // Determine if this is a Court Watch cycle (every 4th editorial decision)
  let courtWatchResult: Awaited<ReturnType<typeof runCourtWatch>> | null = null
  let courtWatchError: string | null = null

  try {
    const { count } = await supabaseAdmin
      .from('editorial_decisions')
      .select('id', { count: 'exact', head: true })

    const totalDecisions = count ?? 0

    if (totalDecisions > 0 && totalDecisions % 4 === 0) {
      console.log(`[nova-prime] Editorial decision #${totalDecisions} — triggering Court Watch`)
      courtWatchResult = await runCourtWatch()
    }
  } catch (err) {
    courtWatchError = err instanceof Error ? err.message : String(err)
    console.error('[nova-prime] Court Watch trigger check failed:', courtWatchError)
  }

  return NextResponse.json(
    {
      ...result,
      courtWatch: courtWatchResult
        ? {
            prosecutionsFound: courtWatchResult.prosecutionsFound,
            prosecutionIds: courtWatchResult.prosecutionIds,
            errors: courtWatchResult.errors,
            costPence: courtWatchResult.costPence,
          }
        : courtWatchError
          ? { error: courtWatchError }
          : null,
    },
    { status: result.success ? 200 : 500 },
  )
}
