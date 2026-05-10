import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Prosecution, SectorStats } from '@/types/database'

export const revalidate = 300

// ─── Static params from CATEGORIES ───────────────────────────────────────────

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cat = CATEGORIES.find((c) => c.slug === slug)
  if (!cat) return { title: 'Sector Not Found' }
  return {
    title: `${cat.name} — Sector Lens`,
    description: `HSE prosecutions, enforcement actions and coverage for the ${cat.name} sector. Powered by NOVA-PRIME.`,
  }
}

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getSectorProsecutions(sector: string): Promise<Prosecution[]> {
  const { data, error } = await supabase
    .from('prosecutions')
    .select('*, party:parties(name,slug)')
    .eq('sector', sector)
    .eq('verified', true)
    .order('sentence_date', { ascending: false })
    .limit(10)

  if (error) {
    console.error('prosecutions fetch error:', error)
    return []
  }
  return (data as Prosecution[]) || []
}

async function getSectorArticles(sector: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('id,title,slug,excerpt,published_at,byline')
    .eq('sector', sector)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('articles fetch error:', error)
    return []
  }
  return data || []
}

async function getSectorStats(sector: string): Promise<SectorStats | null> {
  const { data, error } = await supabase
    .from('sector_stats')
    .select('*')
    .eq('sector', sector)
    .single()

  if (error) return null
  return data as SectorStats
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: SectorStats | null }) {
  const fineFormatted = stats?.total_fines
    ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(stats.total_fines)
    : '—'

  return (
    <div className="grid grid-cols-3 border border-rule divide-x divide-rule mb-10">
      <div className="px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-1">Total Prosecutions</p>
        <p className="font-mono text-2xl font-semibold text-paper">{stats?.prosecution_count ?? '—'}</p>
      </div>
      <div className="px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-1">Total Fines</p>
        <p className="font-mono text-2xl font-semibold text-paper">{fineFormatted}</p>
      </div>
      <div className="px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-1">Last 30 Days</p>
        <p className="font-mono text-2xl font-semibold text-paper">{stats?.prosecutions_last_30d ?? '—'}</p>
      </div>
    </div>
  )
}

function ProsecutionsTable({ prosecutions }: { prosecutions: Prosecution[] }) {
  if (prosecutions.length === 0) {
    return (
      <p className="font-mono text-sm text-paper-dim py-8 border border-rule px-6">
        No verified prosecutions on record for this sector.
      </p>
    )
  }

  return (
    <div className="border border-rule overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rule bg-charcoal-50">
            <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-amber">Defendant</th>
            <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-amber">Court</th>
            <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-amber">Sentence Date</th>
            <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest text-amber">Fine</th>
            <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-amber">Outcome</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {prosecutions.map((p) => {
            const fine = p.fine_amount
              ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(p.fine_amount)
              : '—'
            return (
              <tr key={p.id} className="hover:bg-charcoal-50 transition-colors">
                <td className="px-4 py-3 font-serif text-paper">
                  {p.party ? (
                    <Link href={`/parties/${p.party.slug}`} className="hover:text-amber transition-colors">
                      {p.party.name}
                    </Link>
                  ) : (
                    <span className="text-paper-dim">Unknown</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-paper-dim text-xs">{p.court_abbreviation || p.court || '—'}</td>
                <td className="px-4 py-3 font-mono text-paper-dim text-xs">
                  {p.sentence_date ? formatDate(p.sentence_date) : '—'}
                </td>
                <td className="px-4 py-3 font-mono text-right text-paper">{fine}</td>
                <td className="px-4 py-3">
                  {p.sentence_type ? (
                    <span className="font-mono text-[10px] uppercase tracking-wide text-amber-dim">
                      {p.sentence_type.replace('_', ' ')}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ArticleCards({ articles }: { articles: Awaited<ReturnType<typeof getSectorArticles>> }) {
  if (articles.length === 0) {
    return (
      <p className="font-mono text-sm text-paper-dim py-8 border border-rule px-6">
        No published articles for this sector yet.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => (
        <Link
          key={a.id}
          href={`/articles/${a.slug}`}
          className="group block border border-rule p-5 hover:border-amber/30 transition-colors bg-charcoal"
        >
          <p className="font-serif text-base font-semibold text-paper leading-snug mb-3 group-hover:text-amber transition-colors line-clamp-3">
            {a.title}
          </p>
          {a.excerpt && (
            <p className="font-sans text-xs text-paper-dim leading-relaxed mb-4 line-clamp-2">
              {a.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-paper-dim">
              {a.published_at ? formatDate(a.published_at) : ''}
            </span>
            {a.byline && (
              <span className="font-mono text-[10px] text-amber truncate max-w-[120px]">{a.byline}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = CATEGORIES.find((c) => c.slug === slug)
  if (!cat) notFound()

  const [prosecutions, articles, stats] = await Promise.all([
    getSectorProsecutions(slug),
    getSectorArticles(slug),
    getSectorStats(slug),
  ])

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Page header */}
      <div className="border-b border-rule">
        <div className="container mx-auto px-4 py-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-2">
            Sector lens · NOVA-PRIME desk
          </p>
          <h1 className="font-serif text-headline font-semibold text-paper mb-2">{cat.name}</h1>
          <p className="font-sans text-sm text-paper-dim max-w-xl">{cat.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-14">
        {/* Stats bar */}
        <section>
          <StatsBar stats={stats} />
        </section>

        {/* Prosecutions table */}
        <section>
          <div className="mb-5 border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-1">Enforcement record</p>
            <h2 className="font-serif text-subhead font-semibold text-paper">Recent Prosecutions</h2>
          </div>
          <ProsecutionsTable prosecutions={prosecutions} />
        </section>

        {/* Article cards */}
        <section>
          <div className="mb-5 border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-1">Coverage</p>
            <h2 className="font-serif text-subhead font-semibold text-paper">Latest Articles</h2>
          </div>
          <ArticleCards articles={articles} />
        </section>

        {/* Back nav */}
        <div className="border-t border-rule pt-6">
          <Link href="/" className="font-mono text-xs text-paper-dim hover:text-amber transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
