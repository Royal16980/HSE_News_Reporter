'use client'

import { create } from 'zustand'
import { getSupabaseClient } from '@/lib/supabase'
import { queueAction, type ArticleActionType } from '@/lib/offline-queue'
import type { Article } from '@/types'

type ArticlesState = {
  queue: Article[]
  loading: boolean
  error?: string
  fetchQueue: () => Promise<void>
  handleAction: (articleId: string, action: ArticleActionType, payload?: Record<string, unknown>) => Promise<void>
  removeFromQueue: (articleId: string) => void
}

const seedArticles: Article[] = [
  {
    id: '1',
    title: 'New Safety Regulations for Construction Sites',
    excerpt: 'The UK has introduced updated safety regulations aimed at reducing on-site incidents by 20% over the next year.',
    category: 'Regulation',
    priority: 5,
    qualityScore: 88,
    status: 'pending_review',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
    source: 'HSE',
  },
  {
    id: '2',
    title: 'Warehouse Fire Drill Best Practices',
    excerpt: 'A checklist for running effective fire drills that prepare staff and reduce evacuation times.',
    category: 'Best Practice',
    priority: 4,
    qualityScore: 82,
    status: 'pending_review',
    imageUrl: 'https://images.unsplash.com/photo-1474224017046-182ece80b263?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
    source: 'HSE',
  },
  {
    id: '3',
    title: 'Case Study: Reducing Slips and Trips in Retail',
    excerpt: 'How one retailer cut slip incidents by 60% with simple floor checks and training.',
    category: 'Case Study',
    priority: 3,
    qualityScore: 76,
    status: 'pending_review',
    imageUrl: 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
    source: 'Industry',
  },
]

export const useArticlesStore = create<ArticlesState>((set, get) => ({
  queue: seedArticles,
  loading: false,
  async fetchQueue() {
    set({ loading: true, error: undefined })
    try {
      // Placeholder: would call Supabase in production
      void getSupabaseClient()
      // Example fetch (kept commented until API is ready)
      // const { data, error } = await client
      //   .from('articles')
      //   .select('*')
      //   .eq('status', 'pending_review')
      //   .order('priority', { ascending: false })
      //   .order('created_at', { ascending: true })

      // if (error) throw error
      // set({ queue: data as Article[] })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  async handleAction(articleId, action, payload) {
    const { queue } = get()
    const article = queue.find((item) => item.id === articleId)
    if (!article) return

    const client = getSupabaseClient()
    void client
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

    if (isOffline) {
      await queueAction({ articleId, type: action, payload })
      set({ queue: queue.filter((item) => item.id !== articleId) })
      return
    }

    try {
      set({ loading: true })
      // Placeholder: call Supabase RPC/update
      // const { error } = await client
      //   .from('articles')
      //   .update({ status: action })
      //   .eq('id', articleId)
      // if (error) throw error
      set({ queue: queue.filter((item) => item.id !== articleId) })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  removeFromQueue(articleId) {
    set({ queue: get().queue.filter((item) => item.id !== articleId) })
  },
}))
