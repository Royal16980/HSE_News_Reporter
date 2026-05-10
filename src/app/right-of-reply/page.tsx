import type { Metadata } from 'next'
import Link from 'next/link'
import { RightOfReplyForm } from './RightOfReplyForm'

export const metadata: Metadata = {
  title: 'Right of Reply — SafetyNews Pro',
  description:
    'Submit a right-of-reply statement to SafetyNews Pro. Verified submissions are reviewed by the Governance Swarm and published within 5 working days.',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RightOfReplyPage() {
  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <div className="border-b border-rule">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-2">
            Editorial portal · SafetyNews Pro
          </p>
          <h1 className="font-serif text-headline font-semibold text-paper mb-4">
            Right of Reply
          </h1>
          <p className="font-serif text-body-lg text-paper-dim leading-relaxed">
            If you or your organisation appears in a SafetyNews Pro article and you wish to submit
            a factual correction or contextual statement, use the form below. All submissions are
            treated with the same editorial standards as our original reporting.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_260px]">
          {/* Form */}
          <div>
            <RightOfReplyForm />
          </div>

          {/* Sidebar — editorial note */}
          <aside className="space-y-8">
            {/* Process note */}
            <div className="border border-rule p-5 bg-charcoal-50">
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-3">
                Review process
              </p>
              <p className="font-sans text-xs text-paper-dim leading-relaxed mb-4">
                Submissions are reviewed by the Governance Swarm and published within{' '}
                <span className="text-paper font-semibold">5 working days</span> if verified.
              </p>
              <p className="font-sans text-xs text-paper-dim leading-relaxed mb-4">
                Verification involves confirming your identity and role via publicly available
                information, and cross-referencing your statement against the original source record.
              </p>
              <p className="font-sans text-xs text-paper-dim leading-relaxed">
                Submissions that cannot be verified, or that contain content our editorial charter
                identifies as defamatory, will not be published. You will be notified of the outcome
                by email.
              </p>
            </div>

            {/* Charter reference */}
            <div className="border-l-2 border-amber pl-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-2">
                Charter §3
              </p>
              <p className="font-serif text-sm text-paper-dim italic leading-relaxed">
                "Any individual or organisation named in a prosecution record may submit a
                right-of-reply statement. Verified submissions are published alongside the original
                article."
              </p>
            </div>

            {/* Links */}
            <div className="space-y-3 border-t border-rule pt-5">
              <Link
                href="/about"
                className="block font-mono text-[10px] uppercase tracking-wide text-paper-dim hover:text-amber transition-colors"
              >
                Editorial charter →
              </Link>
              <Link
                href="/news"
                className="block font-mono text-[10px] uppercase tracking-wide text-paper-dim hover:text-amber transition-colors"
              >
                Latest coverage →
              </Link>
              <Link
                href="/"
                className="block font-mono text-[10px] uppercase tracking-wide text-paper-dim hover:text-amber transition-colors"
              >
                ← Home
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
