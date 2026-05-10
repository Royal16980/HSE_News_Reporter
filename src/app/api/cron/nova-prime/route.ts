import { type NextRequest, NextResponse } from 'next/server'
import { runNovaPrimeCycle } from '@/lib/agents/nova-prime'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Vercel Cron sends the Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runNovaPrimeCycle()

  return NextResponse.json(result, { status: result.success ? 200 : 500 })
}
