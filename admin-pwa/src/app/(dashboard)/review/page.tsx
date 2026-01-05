'use client'

import { useEffect } from 'react'
import { Sparkles, RefreshCcw } from 'lucide-react'

import { CardStack } from '@/components/review/CardStack'
import { useArticlesStore } from '@/stores/articles'

export default function ReviewPage() {
  const { queue, loading, fetchQueue, handleAction } = useArticlesStore()

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Review Queue</p>
          <h1 className="text-2xl font-semibold">Swipe to approve, reject, or preview</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Right = approve, Left = reject, Up = preview, Down = snooze
          </p>
        </div>
        <button
          onClick={() => fetchQueue()}
          className="rounded-full border border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition hover:border-safety-blue hover:text-safety-blue dark:border-gray-800 dark:bg-gray-900"
        >
          <RefreshCcw className="h-5 w-5" />
        </button>
      </header>

      <div className="rounded-2xl bg-white p-4 shadow-card dark:bg-gray-900">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <div className="inline-flex items-center gap-2 rounded-full bg-safety-blue/10 px-3 py-1 text-safety-blue">
            <Sparkles className="h-4 w-4" />
            {queue.length} awaiting review
          </div>
          <span className="text-xs text-gray-500">Pull to refresh anytime</span>
        </div>
      </div>

      <CardStack
        articles={queue}
        loading={loading}
        onRefresh={() => fetchQueue()}
        onAction={(articleId, action) => handleAction(articleId, action as any)}
      />
    </div>
  )
}
