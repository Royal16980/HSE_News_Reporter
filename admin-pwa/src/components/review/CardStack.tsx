'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

import type { Article } from '@/types'
import { ArticleCard } from './ArticleCard'
import { ArticlePreview } from './ArticlePreview'
import { useSwipeGesture, type SwipeDirection } from '@/lib/gestures/useSwipeGesture'
import { triggerHaptic } from '@/lib/haptics'

type CardStackProps = {
  articles: Article[]
  loading?: boolean
  onRefresh?: () => void
  onAction: (articleId: string, action: 'approve' | 'reject' | 'snooze' | 'schedule') => Promise<void>
}

export function CardStack({ articles, loading, onAction, onRefresh }: CardStackProps) {
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null)
  const [overlayDirection, setOverlayDirection] = useState<SwipeDirection | null>(null)

  const currentArticle = useMemo(() => articles[0] ?? null, [articles])

  const handleSwipe = async (direction: SwipeDirection) => {
    if (!currentArticle) return

    if (direction === 'up') {
      setPreviewArticle(currentArticle)
      setOverlayDirection(null)
      return
    }

    setOverlayDirection(direction)
    triggerHaptic('medium')

    const action = direction === 'right' ? 'approve' : direction === 'left' ? 'reject' : 'snooze'
    await onAction(currentArticle.id, action)
    setOverlayDirection(null)
  }

  const { bind, style } = useSwipeGesture(handleSwipe, {
    onStart: () => setOverlayDirection(null),
  })

  if (!articles.length && !loading) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
        <p className="text-lg font-semibold">Queue is clear</p>
        <p className="text-sm">Everything is published. Enjoy your day!</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 inline-flex items-center gap-2 rounded-button border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-safety-blue hover:text-safety-blue dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative h-[520px] w-full">
      <AnimatePresence>
        {articles.slice(0, 3).map((article, index) => {
          const isTop = index === 0
          const yOffset = index * 8
          const scale = 1 - index * 0.03

          return (
            <motion.div
              key={article.id}
              {...(isTop ? bind() : {})}
              className="absolute inset-0"
              style={{
                zIndex: 10 - index,
              }}
              initial={{ y: 50, opacity: 0, scale }}
              animate={{ y: yOffset, opacity: 1, scale }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <motion.div style={isTop ? style : undefined} className="h-full">
                <ArticleCard
                  article={article}
                  direction={isTop ? overlayDirection : null}
                  onPreview={() => setPreviewArticle(article)}
                />
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <ArticlePreview
        article={previewArticle}
        open={!!previewArticle}
        onClose={() => setPreviewArticle(null)}
        onApprove={() => {
          if (!previewArticle) return
          onAction(previewArticle.id, 'approve')
          setPreviewArticle(null)
        }}
        onReject={() => {
          if (!previewArticle) return
          onAction(previewArticle.id, 'reject')
          setPreviewArticle(null)
        }}
        onSchedule={() => {
          if (!previewArticle) return
          onAction(previewArticle.id, 'snooze')
          setPreviewArticle(null)
        }}
      />
    </div>
  )
}
