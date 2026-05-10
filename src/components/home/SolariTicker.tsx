'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { AnimatePresence, motion } from 'framer-motion'

interface Prosecution {
  id: string
  court_abbreviation: string
  defendant_name: string
  regulation_short: string
  sentence_type: 'fine' | 'imprisonment' | 'conditional_discharge' | 'absolute_discharge' | 'other'
  fine_amount: number | null
  sentence_date: string
  article_slug?: string
  summary?: string
}

const SENTENCE_LABELS: Record<string, string> = {
  fine:                 'FINE',
  imprisonment:         'CUSTODIAL',
  conditional_discharge:'COND DISCHARGE',
  absolute_discharge:   'ABS DISCHARGE',
  community_order:      'COMMUNITY',
  suspended:            'SUSPENDED',
  other:                'ORDER',
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789£ .,-/'

function formatFine(amount: number | null): string {
  if (!amount) return '—'
  if (amount >= 1_000_000) return `£${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `£${(amount / 1_000).toFixed(0)}K`
  return `£${amount.toLocaleString('en-GB')}`
}

// Single split-flap character cell
function SolariChar({
  target,
  delay = 0,
}: {
  target: string
  delay?: number
}) {
  const [displayed, setDisplayed] = useState(target)
  const [flipping, setFlipping] = useState(false)
  const prevRef = useRef(target)
  const flipCount = useRef(0)

  useEffect(() => {
    if (prevRef.current === target) return
    prevRef.current = target

    const totalFlips = 6 + Math.floor(Math.random() * 4)
    flipCount.current = 0

    const tick = () => {
      flipCount.current++
      setFlipping(true)
      setTimeout(() => {
        setFlipping(false)
        if (flipCount.current < totalFlips) {
          setDisplayed(CHARS[Math.floor(Math.random() * CHARS.length)])
          setTimeout(tick, 80)
        } else {
          setDisplayed(target)
        }
      }, 60)
    }

    const t = setTimeout(tick, delay)
    return () => clearTimeout(t)
  }, [target, delay])

  return (
    <span
      className={`solari-char inline-block text-center font-mono tabular-nums ${flipping ? 'solari-char-inner flipping' : ''}`}
      style={{ minWidth: '0.65em' }}
      aria-hidden="true"
    >
      {displayed}
    </span>
  )
}

// Animates a string through the Solari mechanic
function SolariString({
  value,
  className = '',
  charDelay = 18,
}: {
  value: string
  className?: string
  charDelay?: number
}) {
  return (
    <span className={`solari-tile ${className}`} role="text" aria-label={value}>
      {value.split('').map((char, i) => (
        <SolariChar key={i} target={char} delay={i * charDelay} />
      ))}
    </span>
  )
}

// Expanded row — full summary
function ExpandedRow({ prosecution }: { prosecution: Prosecution }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="px-4 py-3 border-t border-amber/20 bg-charcoal-100/60">
        <p className="text-paper-dim text-sm leading-relaxed max-w-prose font-sans">
          {prosecution.summary ?? 'Full sentencing details available in the linked article.'}
        </p>
        {prosecution.article_slug && (
          <a
            href={`/articles/${prosecution.article_slug}`}
            className="inline-block mt-2 text-amber text-xs font-mono border-b border-amber/30 hover:border-amber transition-colors"
          >
            READ FULL REPORT →
          </a>
        )}
      </div>
    </motion.div>
  )
}

// One prosecution row
function ProsecutionRow({
  prosecution,
  isNew,
}: {
  prosecution: Prosecution
  isNew: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={isNew ? 'amber-new-entry' : ''}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-white/[0.03] transition-colors group"
        aria-expanded={expanded}
      >
        {/* Court */}
        <span className="w-[4rem] shrink-0 text-paper-dim text-xs font-mono uppercase tracking-widest truncate">
          <SolariString value={(prosecution.court_abbreviation ?? '???').toUpperCase().slice(0, 5)} charDelay={12} />
        </span>

        {/* Defendant */}
        <span className="flex-1 min-w-0 text-paper text-sm font-sans font-medium truncate">
          <SolariString value={prosecution.defendant_name.toUpperCase().slice(0, 30)} charDelay={10} />
        </span>

        {/* Regulation */}
        <span className="hidden sm:block w-[10rem] shrink-0 truncate">
          <span className="regulation-chip text-xs">
            <SolariString value={prosecution.regulation_short.slice(0, 16)} charDelay={8} />
          </span>
        </span>

        {/* Sentence type */}
        <span className="hidden md:block w-[8rem] shrink-0 text-xs font-mono text-paper-dim tracking-wider">
          <SolariString value={SENTENCE_LABELS[prosecution.sentence_type] ?? 'ORDER'} charDelay={6} />
        </span>

        {/* Fine amount */}
        <span className="w-[5rem] shrink-0 text-right text-sm font-mono tnum text-amber">
          <SolariString value={formatFine(prosecution.fine_amount)} charDelay={14} />
        </span>

        {/* Date */}
        <span className="hidden lg:block w-[6rem] shrink-0 text-right text-xs font-mono text-paper-dim">
          <SolariString
            value={new Date(prosecution.sentence_date).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: '2-digit',
            }).toUpperCase()}
            charDelay={8}
          />
        </span>

        {/* Expand indicator */}
        <span className="text-paper-dim text-xs group-hover:text-amber transition-colors ml-1">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      <AnimatePresence>
        {expanded && <ExpandedRow prosecution={prosecution} />}
      </AnimatePresence>
    </div>
  )
}

// Seed data for Phase 1 prototype (before Court Watch agent is live)
const SEED_PROSECUTIONS: Prosecution[] = [
  {
    id: '1',
    court_abbreviation: 'BHAM',
    defendant_name: 'Premier Scaffolding Ltd',
    regulation_short: 'WAH 2005 r.4',
    sentence_type: 'fine',
    fine_amount: 120000,
    sentence_date: '2026-05-08',
    summary: 'Defendant failed to ensure working at height activities were properly planned and supervised, resulting in a worker falling 4.2 metres. No pre-use inspection of scaffolding was conducted.',
  },
  {
    id: '2',
    court_abbreviation: 'WMC',
    defendant_name: 'TechCorp Manufacturing',
    regulation_short: 'PUWER 1998 r.4',
    sentence_type: 'fine',
    fine_amount: 85000,
    sentence_date: '2026-05-07',
    summary: 'Machinery guarding removed to increase throughput. Worker suffered degloving injury to right hand when caught in unguarded conveyor mechanism.',
  },
  {
    id: '3',
    court_abbreviation: 'MCC',
    defendant_name: 'Apex Construction Group',
    regulation_short: 'HSWA 1974 § 2',
    sentence_type: 'fine',
    fine_amount: 200000,
    sentence_date: '2026-05-06',
    summary: 'Principal contractor failed to manage and monitor health and safety of contractors on site. Two workers exposed to asbestos-containing materials during demolition.',
  },
  {
    id: '4',
    court_abbreviation: 'LEEDS',
    defendant_name: 'Forklift Solutions Ltd',
    regulation_short: 'LOLER 1998 r.4',
    sentence_type: 'fine',
    fine_amount: 45000,
    sentence_date: '2026-05-05',
    summary: 'Lifting equipment operated beyond its safe working load. Thorough examination overdue by 14 months at time of incident.',
  },
  {
    id: '5',
    court_abbreviation: 'BRIST',
    defendant_name: 'Heritage Care Homes Ltd',
    regulation_short: 'MHSWR 1999 r.3',
    sentence_type: 'fine',
    fine_amount: 160000,
    sentence_date: '2026-05-04',
    summary: 'No suitable and sufficient risk assessment in place for moving and handling of residents. Three carers suffered musculoskeletal injuries over an 18-month period.',
  },
]

export function SolariTicker() {
  const [prosecutions, setProsecutions] = useState<Prosecution[]>(SEED_PROSECUTIONS)
  const [newIds, setNewIds] = useState<Set<string>>(new Set())

  // Subscribe to live prosecution inserts
  useEffect(() => {
    const channel = supabase
      .channel('prosecutions-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'prosecutions' },
        (payload) => {
          const row = payload.new as Prosecution
          setProsecutions((prev) => [row, ...prev.slice(0, 19)])
          setNewIds((prev) => new Set(prev).add(row.id))
          setTimeout(() => {
            setNewIds((prev) => {
              const next = new Set(prev)
              next.delete(row.id)
              return next
            })
          }, 3500)
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  return (
    <section
      aria-label="Live prosecution ticker"
      className="border-t border-b border-rule bg-charcoal-100"
    >
      {/* Header strip */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-rule">
        <span className="text-amber text-xs font-mono font-medium tracking-widest uppercase">
          Live Prosecutions
        </span>
        <span className="text-paper-dim text-xs font-mono">
          · {prosecutions.length} on record
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-paper-dim text-xs font-mono">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber animate-digit-pulse" />
          LIVE
        </span>
      </div>

      {/* Column headers */}
      <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 border-b border-rule text-paper-dim text-[10px] font-mono tracking-widest uppercase select-none">
        <span className="w-[4rem] shrink-0">Court</span>
        <span className="flex-1">Defendant</span>
        <span className="hidden sm:block w-[10rem] shrink-0">Regulation</span>
        <span className="hidden md:block w-[8rem] shrink-0">Sentence</span>
        <span className="w-[5rem] shrink-0 text-right">Amount</span>
        <span className="hidden lg:block w-[6rem] shrink-0 text-right">Date</span>
        <span className="w-4 shrink-0" />
      </div>

      {/* Prosecution rows */}
      <div className="divide-y divide-rule">
        {prosecutions.map((p) => (
          <ProsecutionRow
            key={p.id}
            prosecution={p}
            isNew={newIds.has(p.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-rule">
        <p className="text-paper-dim text-[10px] font-mono">
          Data sourced from HSE press releases and HMCTS records · verified by Governance Swarm ·{' '}
          <a href="/statistics" className="text-amber hover:underline">full statistics →</a>
        </p>
      </div>
    </section>
  )
}
