import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — SafetyNews Pro',
  description:
    'SafetyNews Pro is an autonomous health and safety newsroom operated by the NOVA-PRIME 7-swarm architecture. Editorial charter, methodology and governance principles.',
}

// ─── Pull quote ───────────────────────────────────────────────────────────────

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-10 border-l-2 border-amber pl-6">
      <p className="font-serif text-subhead text-paper leading-relaxed italic">{children}</p>
    </blockquote>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6 border-b border-rule pb-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-1">{kicker}</p>
      <h2 className="font-serif text-subhead font-semibold text-paper">{title}</h2>
    </div>
  )
}

// ─── Charter principle card ───────────────────────────────────────────────────

function Principle({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="border border-rule p-5 bg-charcoal">
      <p className="font-mono text-[10px] text-amber mb-2">§{number}</p>
      <h3 className="font-serif text-base font-semibold text-paper mb-2">{title}</h3>
      <p className="font-sans text-sm text-paper-dim leading-relaxed">{body}</p>
    </div>
  )
}

// ─── Swarm agent row ──────────────────────────────────────────────────────────

function SwarmAgent({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-start gap-4 border-b border-rule py-4 last:border-0">
      <span className="font-mono text-[10px] text-amber shrink-0 w-8 pt-0.5">▸</span>
      <div>
        <p className="font-mono text-xs font-semibold text-paper mb-0.5">{name}</p>
        <p className="font-sans text-xs text-paper-dim">{role}</p>
      </div>
    </div>
  )
}

// ─── Tech badge ───────────────────────────────────────────────────────────────

function TechBadge({ label }: { label: string }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wide text-paper border border-rule px-2 py-1 bg-charcoal-50">
      {label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-charcoal">
      {/* Masthead */}
      <div className="border-b border-rule">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-3">
            Editorial masthead · SafetyNews Pro
          </p>
          <h1 className="font-serif text-display font-semibold text-paper leading-tight mb-6">
            About this publication
          </h1>
          <p className="font-serif text-body-lg text-paper-dim leading-relaxed">
            SafetyNews Pro is the United Kingdom's first fully autonomous health and safety newsroom.
            We cover prosecutions, enforcement notices, legislative change, and incident analysis
            — produced without human bylines, verified with human-grade editorial rigour.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-14 max-w-4xl space-y-16">

        {/* NOVA-PRIME */}
        <section>
          <SectionHead kicker="The engine" title="NOVA-PRIME Autonomous Journalism" />

          <div className="font-serif text-body-lg text-paper leading-relaxed space-y-5">
            <p>
              NOVA-PRIME is a large language model orchestration layer designed for the specific
              demands of UK regulatory journalism. It does not produce speculative commentary. Every
              output is anchored to primary sources: HSE press releases, Companies House filings,
              court sentencing remarks, statutory instruments, and FOI disclosures.
            </p>
            <p>
              The system operates on a continuous 24-hour cycle. Research agents retrieve and classify
              source material from official government domains. Editorial agents draft, structure and
              sub-edit copy to the house style. Governance agents apply defamation review, factual
              cross-referencing and right-of-reply checks before any article reaches published status.
              Nothing is published without passing through all three layers.
            </p>
          </div>

          <PullQuote>
            "Automated production does not mean reduced accountability. It means more of it —
            every claim is traceable, every source is logged, and every editorial decision is
            recorded for review."
          </PullQuote>

          <p className="font-serif text-body text-paper-dim leading-relaxed">
            Human oversight remains in the loop at the governance layer. The Governance Swarm is
            programmed with the editorial charter below and cannot deviate from it. Any article
            that cannot be verified against a primary source is suppressed, not published under
            uncertainty.
          </p>
        </section>

        {/* 7-Swarm architecture */}
        <section>
          <SectionHead kicker="Architecture" title="The 7-Swarm System" />
          <p className="font-sans text-sm text-paper-dim mb-6 leading-relaxed">
            NOVA-PRIME decomposes the journalism pipeline into seven specialist agent clusters,
            each with a defined scope and escalation protocol:
          </p>
          <div className="border border-rule divide-y divide-rule">
            <SwarmAgent
              name="Research Swarm"
              role="Monitors HSE, GOV.UK, court services and parliamentary feeds. Classifies and ingests raw source material into the prosecution and incident databases."
            />
            <SwarmAgent
              name="Editorial Swarm"
              role="Drafts article copy from verified source packets. Applies BLACKSITE_AMBER house style, reading-level optimisation and SEO structure."
            />
            <SwarmAgent
              name="Governance Swarm"
              role="Defamation pre-publication review, Companies House identity verification, right-of-reply triage, and editorial charter compliance gate."
            />
            <SwarmAgent
              name="Enrichment Swarm"
              role="Links prosecutions to party profiles, regulation citations and sector taxonomy. Calculates enforcement statistics and sector heat-maps."
            />
            <SwarmAgent
              name="Audio Swarm"
              role="Produces narrated article audio at publication time. Generates chapter markers, transcripts and waveform peaks for the audio player."
            />
            <SwarmAgent
              name="Distribution Swarm"
              role="Manages newsletter dispatch, social excerpts, and ISR cache invalidation across the Next.js delivery layer."
            />
            <SwarmAgent
              name="QA Swarm"
              role="Handles reader Q&A sessions, FAQ promotion, and post-publication correction logging. Routes right-of-reply submissions to the Governance Swarm."
            />
          </div>
        </section>

        {/* Editorial charter */}
        <section>
          <SectionHead kicker="Editorial charter" title="Principles of publication" />
          <p className="font-sans text-sm text-paper-dim mb-8 leading-relaxed">
            These principles are programmed as hard constraints, not guidelines. Governance Swarm
            signoff requires all four to be satisfied before publication proceeds.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Principle
              number="1"
              title="Transparency"
              body="Every article carries a machine-readable governance signoff block. Source URLs are logged to the sources table and available for public audit on request. No source is paraphrased without a verifiable primary reference."
            />
            <Principle
              number="2"
              title="Accuracy"
              body="Fine amounts, sentence lengths, court identifiers and regulation citations are extracted verbatim from primary documents. Figures are never estimated or interpolated. Any corrected article carries a timestamped correction notice."
            />
            <Principle
              number="3"
              title="Right of Reply"
              body="Any individual or organisation named in a prosecution record may submit a right-of-reply statement via the submission portal. Verified submissions are published alongside the original article within five working days."
            />
            <Principle
              number="4"
              title="Governance Signoff"
              body="No article reaches published status without a Governance Swarm signoff token. The token records which agent version approved the piece, the defamation review outcome, and the source verification confidence score."
            />
          </div>
        </section>

        {/* Tech stack */}
        <section>
          <SectionHead kicker="Technology" title="Stack summary" />
          <p className="font-sans text-sm text-paper-dim mb-6 leading-relaxed">
            SafetyNews Pro is built on a fully serverless, edge-first architecture with no persistent
            compute. The publication layer is a Next.js App Router application deployed on Vercel,
            with ISR cache windows tuned per content type. The data layer is Supabase (PostgreSQL)
            with row-level security and a service-role automation client used exclusively by the
            swarm agents.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'Next.js 15',
              'React 19',
              'Supabase',
              'PostgreSQL',
              'Vercel Edge Network',
              'Tailwind CSS',
              'TypeScript',
              'n8n Automation',
              'IBM Plex Mono',
              'Newsreader',
            ].map((t) => (
              <TechBadge key={t} label={t} />
            ))}
          </div>
        </section>

        {/* Contact / nav */}
        <div className="border-t border-rule pt-8 flex flex-wrap gap-6">
          <Link href="/right-of-reply" className="font-mono text-xs text-amber hover:text-amber-dim transition-colors">
            Submit right of reply →
          </Link>
          <Link href="/news" className="font-mono text-xs text-paper-dim hover:text-amber transition-colors">
            Latest coverage →
          </Link>
          <Link href="/" className="font-mono text-xs text-paper-dim hover:text-amber transition-colors">
            ← Home
          </Link>
        </div>
      </div>
    </div>
  )
}
