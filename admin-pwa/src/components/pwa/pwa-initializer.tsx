'use client'

import { useEffect } from 'react'

import { useServiceWorker } from '@/lib/pwa'
import { useUIStore } from '@/stores/ui'
import { useArticlesStore } from '@/stores/articles'

export function PWAInitializer() {
  const setOffline = useUIStore((state) => state.setOffline)
  const syncQueuedActions = useArticlesStore((state) => state.syncQueuedActions)

  useServiceWorker()

  useEffect(() => {
    const updateStatus = () => setOffline(!navigator.onLine)

    updateStatus()
    syncQueuedActions()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    window.addEventListener('online', syncQueuedActions)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      window.removeEventListener('online', syncQueuedActions)
    }
  }, [setOffline, syncQueuedActions])

  return null
}
