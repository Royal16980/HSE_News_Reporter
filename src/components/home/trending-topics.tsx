'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TrendingTopicsProps {
  topics?: Array<{ tag: string; count: number }>
}

/**
 * Trending topics section with animated tags
 * Features: clickable tags, trend indicators, hover animations
 */
export function TrendingTopics({ topics }: TrendingTopicsProps) {
  // Mock data if no topics provided
  const defaultTopics = [
    { tag: 'workplace-safety', count: 45 },
    { tag: 'fire-regulations', count: 38 },
    { tag: 'risk-assessment', count: 32 },
    { tag: 'ppe-equipment', count: 28 },
    { tag: 'mental-health', count: 25 },
    { tag: 'construction-safety', count: 22 },
    { tag: 'chemical-handling', count: 19 },
    { tag: 'ergonomics', count: 17 },
    { tag: 'first-aid', count: 15 },
    { tag: 'training-compliance', count: 13 },
  ]

  const displayTopics = topics || defaultTopics

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 mb-2"
            >
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold md:text-3xl">
                Trending Topics
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              Most discussed topics in UK health & safety this month
            </motion.p>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="flex flex-wrap gap-3">
          {displayTopics.map((topic, index) => (
            <motion.div
              key={topic.tag}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link href={`/tag/${topic.tag}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-4 py-2 text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary group"
                >
                  <Hash className="mr-1 h-3 w-3 inline-block" />
                  {topic.tag.replace(/-/g, ' ')}
                  <span className="ml-2 text-xs opacity-70 group-hover:opacity-100">
                    {topic.count}
                  </span>
                </Badge>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Ticker Animation for Mobile */}
        <div className="mt-8 md:hidden overflow-hidden">
          <motion.div
            className="flex space-x-3"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {[...displayTopics, ...displayTopics].map((topic, index) => (
              <Badge
                key={`ticker-${index}`}
                variant="outline"
                className="whitespace-nowrap px-4 py-2"
              >
                <Hash className="mr-1 h-3 w-3 inline-block" />
                {topic.tag.replace(/-/g, ' ')}
              </Badge>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
