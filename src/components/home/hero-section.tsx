'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Shield, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TRUST_INDICATORS } from '@/lib/constants'

/**
 * Hero section with animated gradient background and search
 * Features: floating particles, gradient animation, trust indicators
 */
export function HeroSection() {
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 animated-gradient opacity-20" />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary/30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container relative mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center space-x-2 rounded-full bg-white/90 dark:bg-gray-800/90 px-4 py-2 shadow-lg backdrop-blur"
          >
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              The UK's Most Trusted H&S News Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            The UK's Premier{' '}
            <span className="gradient-text">Health & Safety</span>
            <br />
            Intelligence Platform
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 text-lg text-muted-foreground md:text-xl"
          >
            Stay ahead with real-time updates, expert analysis, and
            comprehensive coverage of UK health and safety news and regulations.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <form
              onSubmit={handleSearch}
              className="mx-auto flex max-w-2xl items-center space-x-2 rounded-full bg-white dark:bg-gray-800 p-2 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700"
            >
              <Search className="ml-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search health & safety news, regulations, best practices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                type="submit"
                variant="gradient"
                className="rounded-full px-8"
              >
                Search
              </Button>
            </form>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm"
          >
            {[
              {
                icon: Shield,
                text: `${TRUST_INDICATORS.SUBSCRIBERS} Safety Professionals`,
              },
              {
                icon: CheckCircle2,
                text: TRUST_INDICATORS.UPDATE_FREQUENCY,
              },
              {
                icon: CheckCircle2,
                text: TRUST_INDICATORS.VERIFICATION,
              },
            ].map((indicator, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 rounded-full bg-white/80 dark:bg-gray-800/80 px-4 py-2 backdrop-blur"
              >
                <indicator.icon className="h-4 w-4 text-primary" />
                <span className="font-medium">{indicator.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  )
}
