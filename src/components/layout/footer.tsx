import Link from 'next/link'
import { Linkedin, Twitter, Mail, Shield } from 'lucide-react'
import { SITE_CONFIG, CATEGORIES, BYLINE } from '@/lib/constants'

const SECTOR_LINKS = CATEGORIES.map((c) => ({ name: c.name, href: `/sector/${c.slug}` }))

const COVERAGE_LINKS = [
  { name: 'Latest News', href: '/news' },
  { name: 'Prosecutions', href: '/prosecutions' },
  { name: 'Regulations', href: '/regulations' },
  { name: 'Investigations', href: '/investigations' },
  { name: 'Podcast', href: '/podcast' },
]

const PLATFORM_LINKS = [
  { name: 'About SafetyNews Pro', href: '/about' },
  { name: 'Right of Reply', href: '/right-of-reply', highlight: true },
  { name: 'Editorial Charter', href: '/editorial-charter' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Contact', href: '/contact' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-rule bg-charcoal">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" aria-label="SafetyNews Pro — Home">
              <span className="font-serif text-xl font-semibold tracking-tight">
                <span className="text-amber">Safety</span>
                <span className="text-paper">News</span>
              </span>
              <span className="ml-1.5 font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-amber/60 align-super">
                Pro
              </span>
            </Link>

            <p className="text-sm text-paper-dim leading-relaxed">
              Autonomous UK Health &amp; Safety intelligence. Prosecutions,
              regulations, incidents and investigations — published continuously
              by NOVA-PRIME.
            </p>

            <div className="flex gap-4">
              <Link
                href={SITE_CONFIG.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SafetyNews Pro on X / Twitter"
                className="text-paper-dim hover:text-amber transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href={SITE_CONFIG.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SafetyNews Pro on LinkedIn"
                className="text-paper-dim hover:text-amber transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                aria-label="Contact SafetyNews Pro"
                className="text-paper-dim hover:text-amber transition-colors"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>

            {/* Editorial provenance */}
            <div className="pt-3 border-t border-rule">
              <div className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-amber mt-0.5 flex-shrink-0" />
                <p className="text-[11px] font-mono text-paper-dim leading-relaxed">
                  {BYLINE.DEFAULT}
                </p>
              </div>
            </div>
          </div>

          {/* Sectors */}
          <div>
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-paper-dim mb-4">
              Sectors
            </h3>
            <ul className="space-y-2">
              {SECTOR_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-paper-dim hover:text-amber transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coverage */}
          <div>
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-paper-dim mb-4">
              Coverage
            </h3>
            <ul className="space-y-2">
              {COVERAGE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-paper-dim hover:text-amber transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-paper-dim mb-4">
              Platform
            </h3>
            <ul className="space-y-2">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      link.highlight
                        ? 'text-sm text-amber/80 hover:text-amber transition-colors'
                        : 'text-sm text-paper-dim hover:text-amber transition-colors'
                    }
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-rule">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[12px] font-mono text-paper-dim">
              © {currentYear} SafetyNews Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-[11px] font-mono text-paper-dim">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-amber animate-pulse" />
                <span>NOVA-PRIME active</span>
              </span>
              <Link
                href="/right-of-reply"
                className="hover:text-amber transition-colors underline underline-offset-4 decoration-paper-dim/30"
              >
                Right of reply portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
