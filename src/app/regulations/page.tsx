import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import type { Regulation } from '@/types/database'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'UK Health & Safety Regulations | SafetyNews Pro',
  description:
    'Browse the complete index of UK health and safety regulations, acts, ACOPs, and guidance documents. Plain-English summaries for safety professionals.',
}

const TYPE_LABELS: Record<Regulation['type'], string> = {
  act: 'Act',
  regulation: 'Regulation',
  acop: 'ACoP',
  guidance: 'Guidance',
  directive: 'Directive',
}

const TYPE_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'act', label: 'Acts' },
  { value: 'regulation', label: 'Regulations' },
  { value: 'acop', label: 'ACoPs' },
  { value: 'guidance', label: 'Guidance' },
  { value: 'directive', label: 'Directives' },
]

async function getRegulations(): Promise<Regulation[]> {
  const { data, error } = await supabase
    .from('regulations')
    .select('*')
    .order('priority', { ascending: false })

  if (error) {
    console.error('Failed to fetch regulations:', error)
    return []
  }

  return (data ?? []) as Regulation[]
}

function groupByAct(regulations: Regulation[]): Map<string, Regulation[]> {
  const map = new Map<string, Regulation[]>()
  for (const reg of regulations) {
    const key = reg.act || 'Other'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(reg)
  }
  return map
}

function TypeBadge({ type }: { type: Regulation['type'] }) {
  const label = TYPE_LABELS[type] ?? type
  return (
    <span className="font-mono text-[10px] tracking-widest uppercase border border-amber/40 text-amber px-2 py-0.5">
      {label}
    </span>
  )
}

function RegulationCard({ reg }: { reg: Regulation }) {
  const summary = reg.plain_summary
    ? reg.plain_summary.length > 160
      ? reg.plain_summary.slice(0, 157) + '...'
      : reg.plain_summary
    : null

  return (
    <Link
      href={`/regulations/${reg.slug}`}
      className="group block border-b border-rule py-5 hover:bg-charcoal-50 transition-colors duration-150 px-4 -mx-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-xs text-paper-dim tracking-wide">
              {reg.year}
            </span>
            <TypeBadge type={reg.type} />
          </div>
          <h3 className="font-serif text-paper text-lg leading-snug group-hover:text-amber transition-colors duration-150">
            {reg.short_name}
          </h3>
          {reg.short_name !== reg.full_name && (
            <p className="font-mono text-xs text-paper-dim mt-0.5 leading-relaxed">
              {reg.full_name}
            </p>
          )}
          {summary && (
            <p className="text-paper-dim text-sm mt-2 leading-relaxed">
              {summary}
            </p>
          )}
        </div>
        <span
          className="flex-shrink-0 text-amber opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-1 font-mono text-xs"
          aria-hidden
        >
          &#8594;
        </span>
      </div>
    </Link>
  )
}

function ActGroup({ act, regulations }: { act: string; regulations: Regulation[] }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-px flex-1 bg-rule" />
        <h2 className="font-mono text-xs text-amber tracking-widest uppercase whitespace-nowrap">
          {act}
        </h2>
        <div className="h-px flex-1 bg-rule" />
      </div>
      <div>
        {regulations.map((reg) => (
          <RegulationCard key={reg.id} reg={reg} />
        ))}
      </div>
    </section>
  )
}

export default async function RegulationsPage() {
  const regulations = await getRegulations()
  const grouped = groupByAct(regulations)

  return (
    <div className="min-h-screen bg-charcoal text-paper">
      {/* Page header */}
      <header className="border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <p className="font-mono text-xs text-amber tracking-widest uppercase mb-4">
            Regulatory Index
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-paper leading-tight mb-4">
            UK H&amp;S Regulations
          </h1>
          <p className="text-paper-dim text-base max-w-xl leading-relaxed">
            Plain-English summaries of the acts, regulations, approved codes of
            practice, and guidance that govern workplace health and safety in
            Great Britain.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-8">
            <div className="border-l-2 border-amber pl-3">
              <span className="font-mono text-2xl text-paper font-bold">
                {regulations.length}
              </span>
              <p className="font-mono text-xs text-paper-dim tracking-wide mt-0.5">
                regulations tracked
              </p>
            </div>
            <div className="border-l-2 border-rule pl-3">
              <span className="font-mono text-2xl text-paper font-bold">
                {grouped.size}
              </span>
              <p className="font-mono text-xs text-paper-dim tracking-wide mt-0.5">
                legislative acts
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter strip */}
      <div className="border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          <span className="font-mono text-xs text-paper-dim mr-2 whitespace-nowrap">
            Filter:
          </span>
          {TYPE_FILTER_OPTIONS.map((opt) => (
            <span
              key={opt.value}
              className="font-mono text-xs text-paper-dim border border-rule px-3 py-1 whitespace-nowrap cursor-default select-none"
            >
              {opt.label}
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        {regulations.length === 0 ? (
          <div className="text-center py-24 border border-rule">
            <p className="font-mono text-paper-dim text-sm">
              No regulations indexed yet.
            </p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([act, regs]) => (
            <ActGroup key={act} act={act} regulations={regs} />
          ))
        )}
      </main>

      {/* Footer note */}
      <div className="border-t border-rule">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="font-mono text-xs text-paper-dim leading-relaxed">
            NOVA-PRIME desk &middot; Reviewed by Governance Swarm &middot;
            Legislation data sourced from legislation.gov.uk &middot; Revalidates
            hourly
          </p>
        </div>
      </div>
    </div>
  )
}
