'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Ban, Check, Clock3, X } from 'lucide-react'

import type { Article } from '@/types'
import { formatRelative } from '@/lib/utils'

type ArticlePreviewProps = {
  article: Article | null
  open: boolean
  onClose: () => void
  onApprove?: () => void
  onReject?: () => void
  onSchedule?: () => void
}

export function ArticlePreview({ article, open, onClose, onApprove, onReject, onSchedule }: ArticlePreviewProps) {
  return (
    <AnimatePresence>
      {open && article && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 backdrop-blur">
          <motion.div
            key={article.id}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="safe-bottom relative w-full max-w-xl rounded-t-3xl bg-white p-4 shadow-modal dark:bg-gray-900"
          >
            <div className="mx-auto h-1 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
            <button
              aria-label="Close preview"
              className="absolute right-3 top-3 rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-2 rounded-full bg-safety-blue/10 px-3 py-1 text-safety-blue">
                  {article.category}
                </span>
                <span>{formatRelative(article.createdAt)}</span>
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">{article.title}</h2>
              <p className="text-gray-700 dark:text-gray-200">{article.excerpt}</p>
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 shadow-inner dark:bg-gray-800 dark:text-gray-200">
                <p>
                  Quick preview is limited in this build. Full content, markdown rendering, and media attachments will show
                  here once the article API is wired up.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-sm font-semibold">
                <button
                  onClick={onReject}
                  className="flex items-center justify-center gap-2 rounded-button bg-red-50 px-3 py-3 text-red-600 transition hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200"
                >
                  <Ban className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={onSchedule}
                  className="flex items-center justify-center gap-2 rounded-button bg-amber-50 px-3 py-3 text-amber-700 transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-200"
                >
                  <Clock3 className="h-4 w-4" />
                  Snooze
                </button>
                <button
                  onClick={onApprove}
                  className="flex items-center justify-center gap-2 rounded-button bg-green-50 px-3 py-3 text-green-700 transition hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
