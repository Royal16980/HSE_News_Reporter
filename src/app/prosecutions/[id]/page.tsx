import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import type { Prosecution, Party, Article } from '@/types/database'

export const revalidate = 300

// ─── Types ────────────────────────────────────────────────────────────────────

type ProsecutionDetail = Prosecution & {
  party: (Party & {
    name: string
    slug: string
    sector: string | null
    headquarters: string | null
    total_fines: number
    total_prosecutions: number
  }) | null
  article: Pick<Article, 'title' | 'slug' | 'byline'> | null
}

// ─── Data ─────────────────────────────────────────────────────────────────────

async function getProsecution(id: string): Promise<ProsecutionDetail | null> {
  const { data, error } = await supabase
    .from('prosecutions')
    .select(
      '*, party:parties(name, slug, sector, headquarters, total_fines, total_prosecutions), article:articles(title, slug, byline)'
    )
    .eq('id', id)
    .eq('verified', true)
    .single()

  if (error || !data) return null
  return data as ProsecutionDetail
}

// ─── generateStaticParams ─────────────────────────────────────────────────────

export async function generateStaticParams() {
  const { data } = await supabase
    .from('prosecutions')
    .select('id')
    .eq('verified', true)
    .order('sentence_date', { ascending: false })
    .limit(50)

  return (data ?? []).map((row: { id: string }) => ({ id: row.id }))
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const prosecution = await getProsecution(id)

  if (!prosecution) {
    return { title: 'Prosecution Not Found | SafetyNews Pro' }
  }

  const partyName = prosecution.party?.name ?? 'Unknown defendant'
  const court = prosecution.court ?? 'UK Court'

  return {
    title: `Prosecution: ${partyName} — ${court} | SafetyNews Pro`,
    description:
      prosecution.summary ??
      `HSE prosecution record for ${partyName} at ${court}. Verified by Governance Swarm.`,
    openGraph: {
      title: `Prosecution: ${partyName} — ${court}`,
      description:
        prosecution.summary ??
        `HSE prosecution of ${partyName}. Verified enforcement record.`,
    },
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatFine(amount: number | null): string {
  if (!amount) return '—'
  return amount.toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  })
}

function sentenceLabel(type: Prosecution['sentence_type']): string {
  switch (type) {
    case 'fine':                  return 'Financial Penalty'
    case 'imprisonment':          return 'Custodial Sentence'
    case 'conditional_discharge': return 'Conditional Discharge'
    case 'absolute_discharge':    return 'Absolute Discharge'
    case 'community_order':       return 'Community Order'
    case 'suspended':             return 'Suspended Sentence'
    default:                      return 'Other Disposal'
  }
}

// ─── Section label component ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-4">
      {children}
    </p>
  )
}

// ─── Detail row (label / value pair) ─────────────────────────────────────────

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 border-b border-rule py-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-paper-dim w-48 shrink-0">
        {label}
      </span>
      <span className={`${mono ? 'font-mono text-data' : 'font-serif text-body'} text-paper`}>
        {value}
      </span>
    </div>
  )
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

function LegalActionJsonLd({ prosecution }: { prosecution: ProsecutionDetail }) {
  const partyName = prosecution.party?.name ?? 'Unknown'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LegalAction',
    name: `HSE Prosecution: ${partyName}`,
    description: prosecution.summary ?? undefined,
    startDate: prosecution.hearing_date ?? undefined,
    endDate: prosecution.sentence_date ?? undefined,
    location: prosecution.court
      ? { '@type': 'Courthouse', name: prosecution.court }
      : undefined,
    defendant: {
      '@type': 'Organization',
      name: partyName,
    },
    lawEnforcer: {
      '@type': 'GovernmentOrganization',
      name: 'Health and Safety Executive',
      url: 'https://www.hse.gov.uk',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProsecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const prosecution = await getProsecution(id)

  if (!prosecution) notFound()

  const partyName = prosecution.party?.name ?? 'Unknown defendant'
  const isImprisonment = prosecution.sentence_type === 'imprisonment'

  return (
    <>
      <LegalActionJsonLd prosecution={prosecution} />

      <div className="min-h-screen bg-charcoal">
        {/* Breadcrumb */}
        <div className="border-b border-rule">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-paper-dim">
              <Link href="/" className="hover:text-amber transition-colors">
                Home
              </Link>
              <span className="text-rule select-none">/</span>
              <Link href="/prosecutions" className="hover:text-amber transition-colors">
                Prosecutions
              </Link>
              <span className="text-rule select-none">/</span>
              <span className="text-paper truncate max-w-[20ch]">{partyName}</span>
            </nav>
          </div>
        </div>

        {/* Page header */}
        <div className="border-b border-rule">
          <div className="container mx-auto px-4 py-10">
            <SectionLabel>Prosecution Record</SectionLabel>
            <h1 className="font-serif text-headline text-paper font-semibold leading-tight">
              {partyName}
            </h1>
            {prosecution.court && (
              <p className="mt-2 font-mono text-data text-paper-dim">
                {prosecution.court}
                {prosecution.court_abbreviation ? ` (${prosecution.court_abbreviation})` : ''}
              </p>
            )}

            {/* Sentence badge */}
            <div className="mt-6 inline-flex items-center gap-3">
              <span
                className={[
                  'font-mono text-[10px] uppercase tracking-widest px-3 py-1 border',
                  isImprisonment
                    ? 'border-[#E53E3E] text-[#E53E3E] bg-[#E53E3E]/10'
                    : 'border-amber text-amber bg-amber/10',
                ].join(' ')}
              >
                {sentenceLabel(prosecution.sentence_type)}
              </span>
              {prosecution.fine_amount && (
                <span className="font-mono text-2xl font-semibold text-amber tabular-nums">
                  {formatFine(prosecution.fine_amount)}
                </span>
              )}
              {prosecution.imprisonment_months && (
                <span className="font-mono text-2xl font-semibold text-[#E53E3E] tabular-nums">
                  {prosecution.imprisonment_months} months
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Court & dates */}
            <section>
              <SectionLabel>Hearing &amp; Sentencing</SectionLabel>
              <div className="border-t border-rule">
                <DetailRow label="Sentence date" value={formatDate(prosecution.sentence_date)} mono />
                {prosecution.hearing_date && (
                  <DetailRow label="Hearing date" value={formatDate(prosecution.hearing_date)} mono />
                )}
                <DetailRow label="Court" value={prosecution.court ?? '—'} />
                {prosecution.court_abbreviation && (
                  <DetailRow label="Court abbreviation" value={prosecution.court_abbreviation} mono />
                )}
                <DetailRow label="Sentence type" value={sentenceLabel(prosecution.sentence_type)} />
                {prosecution.fine_amount != null && (
                  <DetailRow label="Fine amount" value={formatFine(prosecution.fine_amount)} mono />
                )}
                {prosecution.imprisonment_months != null && (
                  <DetailRow
                    label="Imprisonment"
                    value={`${prosecution.imprisonment_months} months`}
                    mono
                  />
                )}
                {prosecution.region && (
                  <DetailRow label="Region" value={prosecution.region} />
                )}
                {prosecution.sector && (
                  <DetailRow label="Sector" value={prosecution.sector} />
                )}
              </div>
            </section>

            {/* Regulations breached */}
            {prosecution.regulations_breached?.length > 0 && (
              <section>
                <SectionLabel>Regulations Breached</SectionLabel>
                <ul className="border-t border-rule space-y-0">
                  {prosecution.regulations_breached.map((slug: string) => (
                    <li
                      key={slug}
                      className="flex items-center gap-3 border-b border-rule py-3"
                    >
                      <span className="text-amber font-mono text-data select-none">—</span>
                      <span className="font-mono text-data text-paper uppercase tracking-wide">
                        {slug}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Editorial summary */}
            {prosecution.summary && (
              <section>
                <SectionLabel>Case Summary</SectionLabel>
                <p className="font-serif text-body-lg text-paper leading-relaxed border-l-2 border-amber pl-5">
                  {prosecution.summary}
                </p>
              </section>
            )}

            {/* Source links */}
            {(prosecution.hse_press_release_url || prosecution.sentencing_remarks_url) && (
              <section>
                <SectionLabel>Primary Sources</SectionLabel>
                <div className="border-t border-rule space-y-0">
                  {prosecution.hse_press_release_url && (
                    <div className="border-b border-rule py-3 flex items-center justify-between gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-paper-dim">
                        HSE Press Release
                      </span>
                      <a
                        href={prosecution.hse_press_release_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-data text-amber hover:text-paper transition-colors underline underline-offset-4"
                      >
                        hse.gov.uk ↗
                      </a>
                    </div>
                  )}
                  {prosecution.sentencing_remarks_url && (
                    <div className="border-b border-rule py-3 flex items-center justify-between gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-paper-dim">
                        Sentencing Remarks
                      </span>
                      <a
                        href={prosecution.sentencing_remarks_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-data text-amber hover:text-paper transition-colors underline underline-offset-4"
                      >
                        judiciary.gov.uk ↗
                      </a>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Linked article */}
            {prosecution.article && (
              <section>
                <SectionLabel>Related Coverage</SectionLabel>
                <div className="border border-rule p-5 hover:border-amber/50 transition-colors">
                  <Link
                    href={`/articles/${prosecution.article.slug}`}
                    className="group"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim mb-2">
                      {prosecution.article.byline}
                    </p>
                    <h3 className="font-serif text-subhead text-paper group-hover:text-amber transition-colors">
                      {prosecution.article.title}
                    </h3>
                  </Link>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Defendant profile */}
            {prosecution.party && (
              <div className="border border-rule p-5">
                <SectionLabel>Defendant Profile</SectionLabel>
                <Link
                  href={`/parties/${prosecution.party.slug}`}
                  className="font-serif text-subhead text-paper hover:text-amber transition-colors block mb-4"
                >
                  {prosecution.party.name}
                </Link>
                <div className="space-y-3">
                  {prosecution.party.sector && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim mb-0.5">
                        Sector
                      </p>
                      <p className="font-mono text-data text-paper capitalize">
                        {prosecution.party.sector}
                      </p>
                    </div>
                  )}
                  {prosecution.party.headquarters && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim mb-0.5">
                        Headquarters
                      </p>
                      <p className="font-mono text-data text-paper">
                        {prosecution.party.headquarters}
                      </p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-rule grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim mb-0.5">
                        Total fines
                      </p>
                      <p className="font-mono text-data text-amber tabular-nums">
                        {formatFine(prosecution.party.total_fines)}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim mb-0.5">
                        Prosecutions
                      </p>
                      <p className="font-mono text-data text-paper tabular-nums">
                        {prosecution.party.total_prosecutions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Governance notice */}
            <div className="border border-amber/30 bg-amber/5 p-5">
              <SectionLabel>Governance</SectionLabel>
              <p className="font-mono text-[10px] text-paper-dim leading-relaxed">
                Verified by source verifier agent — Defamation Guard cleared.
              </p>
              {prosecution.source_verifier_agent && (
                <p className="font-mono text-[10px] text-paper-dim mt-2">
                  Agent:{' '}
                  <span className="text-amber">{prosecution.source_verifier_agent}</span>
                </p>
              )}
            </div>

            {/* Back link */}
            <Link
              href="/prosecutions"
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-paper-dim hover:text-amber transition-colors"
            >
              <span>←</span>
              <span>All prosecutions</span>
            </Link>
          </aside>
        </div>
      </div>
    </>
  )
}
