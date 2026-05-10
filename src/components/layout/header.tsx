'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'

const NAV_ITEMS = [
  { name: 'Latest', href: '/news' },
  { name: 'Prosecutions', href: '/prosecutions' },
  { name: 'Regulations', href: '/regulations' },
  { name: 'Investigations', href: '/investigations' },
  { name: 'About', href: '/about' },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  React.useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-rule transition-all duration-200',
        isScrolled
          ? 'bg-charcoal/95 backdrop-blur-sm'
          : 'bg-charcoal'
      )}
    >
      {/* Primary nav bar */}
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Wordmark */}
          <Link href="/" className="flex-shrink-0" aria-label="SafetyNews Pro — Home">
            <span className="font-serif text-xl font-semibold tracking-tight">
              <span className="text-amber">Safety</span>
              <span className="text-paper">News</span>
            </span>
            <span className="ml-1.5 font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-amber/60 align-super">
              Pro
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-1 text-[13px] font-medium tracking-wide transition-colors',
                    active
                      ? 'text-amber'
                      : 'text-paper-dim hover:text-paper'
                  )}
                >
                  {item.name}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-[1px] h-px bg-amber" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {/* Ask AI — Phase 5 stub */}
            <button
              type="button"
              disabled
              title="Ask AI — available in Phase 5"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono uppercase tracking-widest border border-amber/20 text-amber/40 cursor-not-allowed"
            >
              <Zap className="h-3 w-3" />
              Ask AI
            </button>

            {/* Search */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label={isSearchOpen ? 'Close search' : 'Open search'}
              className="p-2 text-paper-dim hover:text-paper transition-colors"
            >
              {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 text-paper-dim hover:text-paper transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden border-t border-rule"
            >
              <div className="py-3">
                <form onSubmit={(e) => e.preventDefault()} role="search">
                  <input
                    type="search"
                    placeholder="Search prosecutions, regulations, incidents..."
                    autoFocus
                    className="w-full bg-charcoal-50 border border-rule px-4 py-2 text-sm text-paper placeholder:text-paper-dim focus:outline-none focus:border-amber/40 font-mono"
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-rule"
            >
              <nav className="py-2 space-y-0.5" aria-label="Mobile primary">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'block px-4 py-2.5 text-sm font-medium border-l-2 transition-colors',
                        active
                          ? 'border-amber text-amber bg-amber/5'
                          : 'border-transparent text-paper-dim hover:text-paper hover:bg-charcoal-50'
                      )}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sector lens bar */}
      <div className="border-t border-rule bg-charcoal-50/40">
        <div className="container mx-auto px-4">
          <div
            className="flex overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
            role="navigation"
            aria-label="Sector lenses"
          >
            {CATEGORIES.map((sector) => {
              const active = pathname === `/sector/${sector.slug}`
              return (
                <Link
                  key={sector.slug}
                  href={`/sector/${sector.slug}`}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 text-[11px] font-mono uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors',
                    active
                      ? 'border-amber text-amber'
                      : 'border-transparent text-paper-dim hover:text-paper hover:border-paper-dim/30'
                  )}
                >
                  {sector.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
