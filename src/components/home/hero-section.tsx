'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Scale, AlertTriangle } from 'lucide-react'

// Phase 1 seed stats — replaced by Supabase data in Phase 2
const SEED_STATS = [
  { label: 'Prosecutions YTD', value: '847', icon: Scale, href: '/prosecutions' },
  { label: 'Total fines levied', value: '£38.4M', icon: TrendingUp, href: '/prosecutions' },
  { label: 'Active investigations', value: '12', icon: AlertTriangle, href: '/investigations' },
  { label: 'Sectors tracked', value: '8', icon: null, href: '/sectors' },
]

export function HeroSection() {
  return (
    <section className="bg-charcoal border-b border-rule">
      {/* Amber masthead rule */}
      <div className="h-px w-full bg-amber" />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">

          {/* Editorial lede — left column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Kicker */}
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-amber">
              Autonomous UK H&amp;S Intelligence
            </p>

            {/* Editorial headline — NOT centred, no gradient */}
            <h1 className="font-serif text-headline font-semibold text-paper leading-[1.08] max-w-[22ch]">
              Every fine. Every prosecution. Every life-changing breach —
              <em className="not-italic text-amber"> reported the moment it happens.</em>
            </h1>

            {/* Lede */}
            <p className="text-body text-paper-dim leading-relaxed max-w-[55ch]">
              NOVA-PRIME monitors HSE enforcement actions, tribunal decisions, and
              regulatory changes across all eight UK industry sectors, 24 hours a day.
              No press releases. No PRs. Just the record.
            </p>

            {/* CTA — text link, not a button pill */}
            <div className="flex items-center gap-6 pt-1">
              <Link
                href="/prosecutions"
                className="inline-flex items-center gap-2 text-sm font-medium text-amber hover:text-amber-dim transition-colors group"
              >
                Browse all prosecutions
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="text-sm text-paper-dim hover:text-paper transition-colors"
              >
                How this works
              </Link>
            </div>
          </motion.div>

          {/* Stats block — right column */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="border border-rule bg-charcoal-50 divide-y divide-rule"
          >
            <div className="px-4 py-3 border-b border-rule">
              <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim">
                Live enforcement data
              </p>
            </div>
            {SEED_STATS.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="flex items-center justify-between px-4 py-3 hover:bg-amber/5 transition-colors group"
              >
                <span className="text-[12px] font-mono text-paper-dim group-hover:text-paper transition-colors">
                  {stat.label}
                </span>
                <span className="font-mono text-[15px] font-medium text-amber tabular-nums">
                  {stat.value}
                </span>
              </Link>
            ))}
            <div className="px-4 py-2">
              <p className="font-mono text-[10px] text-paper-dim/50">
                Updated every 15 min by NOVA-PRIME
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom amber hairline */}
      <div className="h-px w-full bg-rule" />
    </section>
  )
}
