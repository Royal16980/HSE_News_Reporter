'use client'

import { create } from 'zustand'
import { queueAction, getQueuedActions, clearQueuedAction, type ArticleActionType } from '@/lib/offline-queue'
import {
  fetchPendingArticles,
  approveArticle,
  rejectArticle,
  snoozeArticle,
  updateArticle,
} from '@/lib/api/articles'
import type { Article } from '@/types'
import { triggerHaptic } from '@/lib/haptics'

type ArticlesState = {
  queue: Article[]
  loading: boolean
  error?: string
  fetchQueue: () => Promise<void>
  syncQueuedActions: () => Promise<void>
  handleAction: (
    articleId: string,
    action: ArticleActionType,
    payload?: Record<string, unknown>
  ) => Promise<void>
  removeFromQueue: (articleId: string) => void
  updateArticleInQueue: (articleId: string, updates: Partial<Article>) => void
}

export const useArticlesStore = create<ArticlesState>((set, get) => ({
  queue: [],
  loading: false,

  async fetchQueue() {
    set({ loading: true, error: undefined })
    try {
      const articles = await fetchPendingArticles()
      set({ queue: articles })

      // Trigger success haptic
      triggerHaptic('light')
    } catch (error: any) {
      console.error('Error fetching queue:', error)
      set({ error: error.message })
      triggerHaptic('error')
    } finally {
      set({ loading: false })
    }
  },

  async syncQueuedActions() {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
    if (isOffline) return

    const queued = await getQueuedActions()
    if (!queued.length) return

    for (const action of queued) {
      if (!action.id) continue
      try {
        switch (action.type) {
          case 'approve':
            await approveArticle(action.articleId, (action.payload?.userId as string) || 'system')
            break
          case 'reject':
            await rejectArticle(action.articleId, action.payload?.reason as string)
            break
          case 'snooze':
            await snoozeArticle(action.articleId, action.payload?.snoozeUntil as Date | undefined)
            break
          case 'schedule':
          case 'update':
            await updateArticle(action.articleId, action.payload as Partial<Article>)
            break
          default:
            break
        }

        await clearQueuedAction(action.id)
      } catch (error) {
        console.error('Error syncing offline action:', error)
        set({ error: (error as Error).message })
        break
      }
    }
  },

  async handleAction(articleId, action, payload) {
    const { queue } = get()
    const article = queue.find((item) => item.id === articleId)
    if (!article) return

    // Check if offline
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

    if (isOffline) {
      // Queue for later sync
      await queueAction({ articleId, type: action, payload })
      set({ queue: queue.filter((item) => item.id !== articleId) })
      triggerHaptic('light')
      return
    }

    try {
      // Optimistically remove from queue
      set({ queue: queue.filter((item) => item.id !== articleId) })

      // Perform action based on type
      switch (action) {
        case 'approve':
          await approveArticle(articleId, payload?.userId as string || 'system')
          triggerHaptic('success')
          break

        case 'reject':
          await rejectArticle(articleId, payload?.reason as string)
          triggerHaptic('heavy')
          break

        case 'snooze':
          const snoozeUntil = payload?.snoozeUntil as Date | undefined
          await snoozeArticle(articleId, snoozeUntil)
          triggerHaptic('medium')
          break

        case 'update':
          await updateArticle(articleId, payload as Partial<Article>)
          triggerHaptic('light')
          break

        default:
          console.warn('Unknown action:', action)
      }
    } catch (error: any) {
      console.error('Error handling action:', error)

      // Revert optimistic update on error
      set({ queue: [...get().queue, article] })
      set({ error: error.message })
      triggerHaptic('error')
    }
  },

  removeFromQueue(articleId) {
    set({ queue: get().queue.filter((item) => item.id !== articleId) })
  },

  updateArticleInQueue(articleId, updates) {
    set({
      queue: get().queue.map((article) =>
        article.id === articleId ? { ...article, ...updates } : article
      ),
    })
  },
}))
