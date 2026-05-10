import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import type { Regulation, Prosecution } from '@/types/database'

export const revalidate = 3600

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const { data, error } = await supabase
    .from('regulations')
    .select('slug')

  if (error || !data) return []
  return data.map((r: { slug: string }) => ({ slug: r.slug }))
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { data } = await supabase
    .from('regulations')
    .select('short_name, full_name, plain_summary')
    .eq('slug', params.slug)
    .single()

  if (!data) return { title: 'Regulation | SafetyNews Pro' }

  const reg = data as Pick<Regulation, 'short_name' | 'full_name' | 'plain_summary'>

  return {
    title: `${reg.short_name} — ${reg.full_name} | SafetyNews Pro`,
    description: reg.plain_summary ?? undefined,
  }
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getRegulation(slug: string): Promise<Regulation | null> {
  const { data, error } = await supabase
    .from('regulations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Regulation
}

async function getRelatedProsecutions(regulationId: string): Promise<Prosecution[]> {
  const { data, error } = await supabase
    .from('prosecutions')
    .select('*, party:parties(name)')
    .contains('regulations_breached', [regulationId])
    .eq('verified', true)
    .limit(5)

  if (error || !data) return []
  return data as Prosecution[]
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<Regulation['type'], string> = {
  act: 'Primary Act',
  regulation: 'Statutory Instrument',
  acop: 'Approved Code of Practice',
  guidance: 'Guidance Document',
  directive: 'EU Directive (retained)',
}

function TypeBadge({ type }: { type: Regulation['type'] }) {
  const label = TYPE_LABELS[type] ?? type
  return (
    <span className="font-mono text-[10px] tracking-widest uppercase border border-amber/40 text-amber px-2 py-0.5">
      {label}
    </span>
  )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-rule last:border-0">
      <span className="font-mono text-xs text-paper-dim w-24 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="font-mono text-xs text-paper">{value}</span>
    </div>
  )
}

function ProsecutionRow({ prosecution }: { prosecution: Prosecution }) {
  const partyName =
    prosecution.party && 'name' in prosecution.party
      ? prosecution.party.name
      : 'Unknown party'

  const fineFormatted =
    prosecution.fine_amount != null
      ? `£${prosecution.fine_amount.toLocaleString('en-GB')}`
      : null

  const date = prosecution.sentence_date
    ? new Date(prosecution.sentence_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div className="border-b border-rule py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-paper text-sm font-medium leading-snug">
            {prosecution.headline}
          </p>
          <p className="font-mono text-xs text-paper-dim mt-1">{partyName}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          {fineFormatted && (
            <p className="font-mono text-sm text-amber font-bold">{fineFormatted}</p>
          )}
          {date && (
            <p className="font-mono text-xs text-paper-dim mt-0.5">{date}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function RegulationDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const regulation = await getRegulation(params.slug)

  if (!regulation) notFound()

  const relatedProsecutions = await getRelatedProsecutions(regulation.id)

  // JSON-LD: Legislation schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Legislation',
    name: regulation.full_name,
    alternateName: regulation.short_name,
    legislationType: TYPE_LABELS[regulation.type] ?? regulation.type,
    temporalCoverage: String(regulation.year),
    description: regulation.plain_summary ?? undefined,
    url: regulation.canonical_url ?? undefined,
    legislationIdentifier: regulation.slug,
    inLanguage: 'en-GB',
    jurisdiction: {
      '@type': 'AdministrativeArea',
      name: 'Great Britain',
    },
  }

  return (
    <div className="min-h-screen bg-charcoal text-paper">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link
            href="/"
            className="font-mono text-xs text-paper-dim hover:text-amber transition-colors"
          >
            Home
          </Link>
          <span className="font-mono text-xs text-rule">/</span>
          <Link
            href="/regulations"
            className="font-mono text-xs text-paper-dim hover:text-amber transition-colors"
          >
            Regulations
          </Link>
          <span className="font-mono text-xs text-rule">/</span>
          <span className="font-mono text-xs text-paper truncate">
            {regulation.short_name}
          </span>
        </div>
      </nav>

      {/* Hero header */}
      <header className="border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <TypeBadge type={regulation.type} />
            <span className="font-mono text-xs text-paper-dim">
              {regulation.year}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-paper leading-tight mb-2">
            {regulation.full_name}
          </h1>
          {regulation.short_name !== regulation.full_name && (
            <p className="font-mono text-sm text-amber mt-1">
              {regulation.short_name}
            </p>
          )}

          {/* Byline */}
          <p className="font-mono text-xs text-paper-dim mt-6">
            NOVA-PRIME desk &middot; Reviewed by Governance Swarm
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Plain summary block */}
        {regulation.plain_summary && (
          <section>
            <h2 className="font-mono text-xs text-paper-dim tracking-widest uppercase mb-4">
              Plain-English Summary
            </h2>
            <div className="border-l-2 border-amber pl-5 py-1">
              <p className="text-paper leading-relaxed text-base">
                {regulation.plain_summary}
              </p>
            </div>
          </section>
        )}

        {/* Metadata table */}
        <section>
          <h2 className="font-mono text-xs text-paper-dim tracking-widest uppercase mb-4">
            Key Details
          </h2>
          <div className="border border-rule">
            <div className="px-4">
              <MetaRow label="Full name" value={regulation.full_name} />
              <MetaRow label="Short name" value={regulation.short_name} />
              <MetaRow label="Act / parent" value={regulation.act} />
              {regulation.section && (
                <MetaRow label="Section" value={regulation.section} />
              )}
              <MetaRow label="Year" value={String(regulation.year)} />
              <MetaRow label="Type" value={TYPE_LABELS[regulation.type] ?? regulation.type} />
            </div>
          </div>
        </section>

        {/* Legislation.gov.uk link */}
        {regulation.canonical_url && (
          <section>
            <h2 className="font-mono text-xs text-paper-dim tracking-widest uppercase mb-4">
              Official Source
            </h2>
            <a
              href={regulation.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-rule px-4 py-3 text-paper-dim hover:border-amber hover:text-amber transition-colors duration-150"
            >
              <span className="font-mono text-xs">legislation.gov.uk</span>
              <span className="font-mono text-xs" aria-hidden>
                &#8599;
              </span>
            </a>
          </section>
        )}

        {/* Related prosecutions */}
        {relatedProsecutions.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-mono text-xs text-paper-dim tracking-widest uppercase">
                Related Prosecutions
              </h2>
              <span className="font-mono text-xs border border-rule text-paper-dim px-2 py-0.5">
                {relatedProsecutions.length}
              </span>
            </div>
            <div className="border border-rule">
              <div className="px-4">
                {relatedProsecutions.map((p) => (
                  <ProsecutionRow key={p.id} prosecution={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {relatedProsecutions.length === 0 && (
          <section>
            <h2 className="font-mono text-xs text-paper-dim tracking-widest uppercase mb-4">
              Related Prosecutions
            </h2>
            <div className="border border-rule px-4 py-8 text-center">
              <p className="font-mono text-xs text-paper-dim">
                No verified prosecutions linked to this regulation yet.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer note */}
      <div className="border-t border-rule mt-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="font-mono text-xs text-paper-dim leading-relaxed">
            NOVA-PRIME desk &middot; Reviewed by Governance Swarm &middot;
            Sourced from legislation.gov.uk &middot; Revalidates hourly
          </p>
        </div>
      </div>
    </div>
  )
}
