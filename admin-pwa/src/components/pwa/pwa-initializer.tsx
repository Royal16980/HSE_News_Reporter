'use client'

import { useEffect } from 'react'

import { useServiceWorker } from '@/lib/pwa'
import { useUIStore } from '@/stores/ui'

export function PWAInitializer() {
  const setOffline = useUIStore((state) => state.setOffline)

  useServiceWorker()

  useEffect(() => {
    const updateStatus = () => setOffline(!navigator.onLine)

    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [setOffline])

  return null
}
