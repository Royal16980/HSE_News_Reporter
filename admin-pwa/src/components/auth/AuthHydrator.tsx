'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'

export function AuthHydrator() {
  const hydrate = useAuthStore((state) => state.hydrateFromSession)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return null
}
