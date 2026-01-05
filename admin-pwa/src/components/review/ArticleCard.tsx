import Image from 'next/image'
import { BadgeCheck, Clock3, Flame, Sparkles, Timer } from 'lucide-react'
import { motion } from 'framer-motion'

import type { Article } from '@/types'
import { cn, formatRelative, truncate } from '@/lib/utils'
import type { SwipeDirection } from '@/lib/gestures/useSwipeGesture'

type ArticleCardProps = {
  article: Article
  direction?: SwipeDirection | null
  onPreview?: () => void
}

const overlayStyles: Record<Exclude<SwipeDirection, undefined>, { color: string; label: string }> = {
  right: { color: 'bg-green-500/80', label: 'Approve' },
  left: { color: 'bg-red-500/80', label: 'Reject' },
  up: { color: 'bg-safety-blue/80', label: 'Preview' },
  down: { color: 'bg-amber-500/80', label: 'Snooze' },
}

export function ArticleCard({ article, direction, onPreview }: ArticleCardProps) {
  const overlay = direction ? overlayStyles[direction] : null

  return (
    <div className="relative overflow-hidden rounded-card bg-white shadow-card dark:bg-gray-900">
      {article.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
              {article.category}
            </span>
            <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
              <Flame className="h-4 w-4 text-amber-300" />
              Priority {article.priority}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold leading-tight">{article.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{truncate(article.excerpt, 160)}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="inline-flex items-center gap-2 rounded-full bg-safety-blue/10 px-3 py-1 text-safety-blue">
            <BadgeCheck className="h-4 w-4" />
            {article.source}
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            {formatRelative(article.createdAt)}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Quality score</span>
            <span className="font-semibold text-gray-800 dark:text-white">{article.qualityScore}/100</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-safety-blue"
              style={{ width: `${article.qualityScore}%` }}
              aria-label="Quality score"
            />
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onPreview}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-button border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-safety-blue hover:bg-white hover:text-safety-blue dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        >
          <Sparkles className="h-5 w-5 text-safety-blue" />
          Open preview
        </motion.button>
      </div>

      {overlay && (
        <div className={cn('absolute inset-0 flex items-center justify-center text-white', overlay.color)}>
          <span className="text-2xl font-bold uppercase tracking-wide">{overlay.label}</span>
        </div>
      )}
    </div>
  )
}
