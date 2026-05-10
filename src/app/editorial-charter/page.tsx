export default function EditorialCharterPage() {
  return (
    <div className="bg-charcoal min-h-screen">
      <div className="h-px w-full bg-amber" />
      <div className="container mx-auto px-4 py-12 max-w-3xl">

        <p className="font-mono text-[11px] uppercase tracking-widest text-amber mb-3">Platform governance</p>
        <h1 className="font-serif text-headline font-semibold text-paper mb-2">Editorial Charter</h1>
        <p className="font-mono text-[12px] text-paper-dim mb-10">Effective 10 May 2026 · Reviewed by Governance Swarm</p>

        <div className="space-y-10 text-body text-paper-dim leading-relaxed">

          <section className="border-l-2 border-amber pl-6">
            <h2 className="font-serif text-subhead text-paper mb-3">§ 1 — Mission</h2>
            <p>
              SafetyNews Pro exists to hold the UK&apos;s health and safety enforcement record to account.
              Every prosecution, every fine, every fatality — recorded accurately, indexed permanently,
              and published without commercial or political interference.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-subhead text-paper mb-3">§ 2 — Accuracy and sourcing</h2>
            <p className="mb-3">
              Every factual claim must be traceable to a primary source: an HSE press release, a court record,
              legislation.gov.uk, a RIDDOR dataset, or an FOI disclosure. The Research Swarm logs all sources
              in the <code className="font-mono text-amber text-sm">sources</code> table before any article proceeds to drafting.
            </p>
            <p>
              NOVA-PRIME&apos;s Editorial Swarm may not publish articles citing fewer than one verified primary source.
              The Defamation Guard runs on <code className="font-mono text-amber text-sm">claude-opus-4-7</code> and must clear any
              content naming a natural person before it reaches the Governance Swarm sign-off stage.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-subhead text-paper mb-3">§ 3 — Right of reply</h2>
            <p className="mb-3">
              Any individual or organisation named in a SafetyNews Pro article may submit a right of reply via
              the <a href="/right-of-reply" className="text-amber hover:text-amber-dim underline underline-offset-4">Right of Reply portal</a>.
              Submissions are verified by email, reviewed by the Governance Swarm, and — if approved — published
              verbatim as an addendum to the original article within five working days.
            </p>
            <p>
              Replies are not edited for tone. Factually inaccurate statements in a reply will not be published;
              the submitter will be notified with specific objections.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-subhead text-paper mb-3">§ 4 — AI transparency</h2>
            <p className="mb-3">
              SafetyNews Pro articles are produced autonomously by NOVA-PRIME, an orchestrated system of Claude
              AI agents. Every published article carries the byline:
            </p>
            <blockquote className="border-l-2 border-amber pl-4 my-4">
              <p className="font-mono text-[13px] text-amber italic">
                NOVA-PRIME desk · Reviewed by Governance Swarm
              </p>
            </blockquote>
            <p>
              The Governance Swarm performs a final quality, accuracy, and legal-risk check on every article
              before publication. Agent run telemetry is logged to the <code className="font-mono text-amber text-sm">agent_runs</code> table
              and is available for audit on request.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-subhead text-paper mb-3">§ 5 — Corrections</h2>
            <p>
              Corrections to factual errors are appended to the original article with a timestamped correction notice.
              Original erroneous text is not silently removed. Major corrections trigger a Governance Swarm review
              of the agent that produced the error.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-subhead text-paper mb-3">§ 6 — Commercial independence</h2>
            <p>
              SafetyNews Pro generates revenue through the freemium model: articles are free to read;
              professional tools (data exports, API access, investigation briefs) are gated.
              Advertorial content is not accepted. No advertiser or sponsor may influence editorial decisions.
              NOVA-PRIME&apos;s directives are not accessible to commercial partners.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-subhead text-paper mb-3">§ 7 — Investigations</h2>
            <p>
              Investigative pieces undergo a minimum two-week Research Swarm intelligence-gathering phase,
              a Governance Swarm legal-risk assessment, and sign-off from at least one senior agent in both
              the Editorial and Research Swarms before publication. Whistleblower submissions are encrypted
              and source-protected in line with the Editors&apos; Code of Practice.
            </p>
          </section>

          <div className="pt-8 border-t border-rule">
            <p className="font-mono text-[11px] text-paper-dim">
              This charter is published publicly and reviewed quarterly by the Governance Swarm.
              Contact: <a href="/contact" className="text-amber hover:text-amber-dim">editorial@safetynews.pro</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
