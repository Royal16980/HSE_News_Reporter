import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Prosecution } from '@/types/database'

export const revalidate = 300

// ─── Types ────────────────────────────────────────────────────────────────────

type ProsecutionRow = Prosecution & {
  party: { name: string; slug: string } | null
}

// ─── Sectors ─────────────────────────────────────────────────────────────────

const SECTORS = [
  'construction',
  'manufacturing',
  'healthcare',
  'hospitality',
  'food',
  'agriculture',
  'logistics',
  'office',
] as const

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getProsecutions(): Promise<ProsecutionRow[]> {
  const { data, error } = await supabase
    .from('prosecutions')
    .select('*, party:parties(name, slug)')
    .eq('verified', true)
    .order('sentence_date', { ascending: false })
    .limit(50)

  if (error) return []
  return (data as ProsecutionRow[]) ?? []
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFine(amount: number | null): string {
  if (!amount) return '—'
  return amount.toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  })
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function sentenceLabel(type: Prosecution['sentence_type']): string {
  switch (type) {
    case 'fine':               return 'Fine'
    case 'imprisonment':       return 'Imprisonment'
    case 'conditional_discharge': return 'Cond. Discharge'
    case 'absolute_discharge': return 'Abs. Discharge'
    case 'community_order':    return 'Community Order'
    case 'suspended':          return 'Suspended'
    default:                   return 'Other'
  }
}

function sentenceColour(type: Prosecution['sentence_type']): string {
  switch (type) {
    case 'imprisonment': return 'text-[#E53E3E]'
    case 'fine':         return 'text-amber'
    default:             return 'text-paper-dim'
  }
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({
  total,
  totalFines,
  latest,
}: {
  total: number
  totalFines: number
  latest: string | null
}) {
  return (
    <div className="border-b border-rule grid grid-cols-3 divide-x divide-rule">
      <div className="px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim mb-1">
          Total on record
        </p>
        <p className="font-mono text-2xl font-semibold text-paper tabular-nums">{total}</p>
      </div>
      <div className="px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim mb-1">
          Total fines
        </p>
        <p className="font-mono text-2xl font-semibold text-amber tabular-nums">
          {totalFines > 0
            ? totalFines.toLocaleString('en-GB', {
                style: 'currency',
                currency: 'GBP',
                minimumFractionDigits: 0,
              })
            : '—'}
        </p>
      </div>
      <div className="px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim mb-1">
          Most recent
        </p>
        <p className="font-mono text-2xl font-semibold text-paper tabular-nums">
          {latest ? formatDate(latest) : '—'}
        </p>
      </div>
    </div>
  )
}

// ─── Filter controls (client rendered via URL search params) ──────────────────

function FilterBar({
  sector,
  sentenceType,
  year,
  allYears,
}: {
  sector: string
  sentenceType: string
  year: string
  allYears: number[]
}) {
  return (
    <form method="GET" className="flex flex-wrap items-center gap-3 py-5 border-b border-rule">
      {/* Sector */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-paper-dim shrink-0">
          Sector
        </span>
        <div className="flex flex-wrap gap-1">
          <FilterPill name="sector" value="" current={sector} label="All" />
          {SECTORS.map((s) => (
            <FilterPill key={s} name="sector" value={s} current={sector} label={s} />
          ))}
        </div>
      </div>

      <div className="h-4 w-px bg-rule hidden sm:block" />

      {/* Sentence type */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-paper-dim shrink-0">
          Sentence
        </span>
        <div className="flex flex-wrap gap-1">
          <FilterPill name="sentenceType" value="" current={sentenceType} label="All" />
          <FilterPill name="sentenceType" value="fine" current={sentenceType} label="Fine" />
          <FilterPill
            name="sentenceType"
            value="imprisonment"
            current={sentenceType}
            label="Imprisonment"
          />
          <FilterPill name="sentenceType" value="other" current={sentenceType} label="Other" />
        </div>
      </div>

      <div className="h-4 w-px bg-rule hidden sm:block" />

      {/* Year */}
      {allYears.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-paper-dim shrink-0">
            Year
          </span>
          <div className="flex flex-wrap gap-1">
            <FilterPill name="year" value="" current={year} label="All" />
            {allYears.map((y) => (
              <FilterPill key={y} name="year" value={String(y)} current={year} label={String(y)} />
            ))}
          </div>
        </div>
      )}
    </form>
  )
}

function FilterPill({
  name,
  value,
  current,
  label,
}: {
  name: string
  value: string
  current: string
  label: string
}) {
  const active = current === value
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={[
        'font-mono text-[10px] uppercase tracking-widest px-2 py-1 border transition-colors',
        active
          ? 'border-amber text-amber bg-amber/10'
          : 'border-rule text-paper-dim hover:border-amber/50 hover:text-paper',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

function ProsecutionTable({ rows }: { rows: ProsecutionRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="py-20 text-center border border-rule">
        <p className="font-mono text-sm text-paper-dim">
          No prosecutions recorded yet — NOVA-PRIME is gathering enforcement data.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-rule">
            {['Date', 'Defendant', 'Court', 'Sector', 'Sentence', 'Fine'].map((col) => (
              <th
                key={col}
                className="font-mono text-[10px] uppercase tracking-widest text-paper-dim px-4 py-3 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id}
              className={[
                'border-b border-rule transition-colors hover:bg-charcoal-50 group',
                idx % 2 === 0 ? '' : 'bg-charcoal-50/40',
              ].join(' ')}
            >
              <td className="px-4 py-3 font-mono text-data text-paper-dim whitespace-nowrap">
                {formatDate(row.sentence_date)}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/prosecutions/${row.id}`}
                  className="font-serif text-body text-paper group-hover:text-amber transition-colors"
                >
                  {row.party?.name ?? 'Unknown defendant'}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-data text-paper-dim whitespace-nowrap">
                {row.court_abbreviation ?? row.court ?? '—'}
              </td>
              <td className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-paper-dim whitespace-nowrap">
                {row.sector ?? '—'}
              </td>
              <td className={`px-4 py-3 font-mono text-data whitespace-nowrap ${sentenceColour(row.sentence_type)}`}>
                {sentenceLabel(row.sentence_type)}
              </td>
              <td className="px-4 py-3 font-mono text-data text-amber whitespace-nowrap tabular-nums">
                {formatFine(row.fine_amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProsecutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; sentenceType?: string; year?: string }>
}) {
  const params = await searchParams
  const sectorFilter    = params.sector      ?? ''
  const sentenceFilter  = params.sentenceType ?? ''
  const yearFilter      = params.year         ?? ''

  const allRows = await getProsecutions()

  // Derive all years present
  const allYears = Array.from(
    new Set(
      allRows
        .map((r) => r.sentence_date ? new Date(r.sentence_date).getFullYear() : null)
        .filter((y): y is number => y !== null)
    )
  ).sort((a, b) => b - a)

  // Apply filters client-side (data is already fetched)
  const filtered = allRows.filter((row) => {
    if (sectorFilter && row.sector !== sectorFilter) return false
    if (sentenceFilter) {
      if (sentenceFilter === 'other') {
        if (row.sentence_type === 'fine' || row.sentence_type === 'imprisonment') return false
      } else {
        if (row.sentence_type !== sentenceFilter) return false
      }
    }
    if (yearFilter) {
      const rowYear = row.sentence_date ? new Date(row.sentence_date).getFullYear() : null
      if (rowYear !== Number(yearFilter)) return false
    }
    return true
  })

  // Stats from full unfiltered set
  const totalFines = allRows.reduce((acc, r) => acc + (r.fine_amount ?? 0), 0)
  const latest = allRows[0]?.sentence_date ?? null

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Page header */}
      <div className="border-b border-rule">
        <div className="container mx-auto px-4 py-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-3">
            Enforcement — Prosecutions
          </p>
          <h1 className="font-serif text-headline text-paper font-semibold">
            HSE Prosecution Record
          </h1>
          <p className="mt-2 font-mono text-data text-paper-dim max-w-xl">
            Verified court outcomes sourced from HSE press releases and Crown Court
            sentencing remarks. Defamation-cleared by Governance Swarm.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="container mx-auto px-4">
        <StatsBar total={allRows.length} totalFines={totalFines} latest={latest} />
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4">
        <FilterBar
          sector={sectorFilter}
          sentenceType={sentenceFilter}
          year={yearFilter}
          allYears={allYears}
        />
      </div>

      {/* Result count */}
      <div className="container mx-auto px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {sectorFilter || sentenceFilter || yearFilter ? ' (filtered)' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="container mx-auto px-4 pb-20">
        <ProsecutionTable rows={filtered} />
      </div>
    </div>
  )
}
