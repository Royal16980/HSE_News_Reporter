'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type PullToRefreshOptions = {
  threshold?: number
  disabled?: boolean
}

type PullToRefreshResult = {
  containerRef: React.RefObject<HTMLDivElement>
  pullDistance: number
  isRefreshing: boolean
}

export function usePullToRefresh(
  onRefresh: () => Promise<void> | void,
  options?: PullToRefreshOptions,
): PullToRefreshResult {
  const { threshold = 80, disabled = false } = options || {}
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number | null>(null)
  const triggeredRef = useRef(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const resetPull = useCallback(() => {
    startYRef.current = null
    triggeredRef.current = false
    setPullDistance(0)
  }, [])

  useEffect(() => {
    if (disabled) return

    const handleTouchStart = (event: TouchEvent) => {
      if (window.scrollY > 0) return
      startYRef.current = event.touches[0]?.clientY ?? null
      triggeredRef.current = false
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (startYRef.current === null) return
      const currentY = event.touches[0]?.clientY ?? 0
      const delta = currentY - startYRef.current
      if (delta <= 0) {
        setPullDistance(0)
        return
      }

      if (event.cancelable) {
        event.preventDefault()
      }

      const distance = Math.min(delta, threshold * 1.5)
      setPullDistance(distance)

      if (distance >= threshold && !triggeredRef.current) {
        triggeredRef.current = true
        setIsRefreshing(true)
        Promise.resolve(onRefresh())
          .catch(() => undefined)
          .finally(() => {
            setIsRefreshing(false)
            resetPull()
          })
      }
    }

    const handleTouchEnd = () => {
      if (!triggeredRef.current) {
        resetPull()
      }
    }

    const target = containerRef.current || window
    target.addEventListener('touchstart', handleTouchStart, { passive: true })
    target.addEventListener('touchmove', handleTouchMove, { passive: false })
    target.addEventListener('touchend', handleTouchEnd)
    target.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      target.removeEventListener('touchstart', handleTouchStart)
      target.removeEventListener('touchmove', handleTouchMove)
      target.removeEventListener('touchend', handleTouchEnd)
      target.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [disabled, onRefresh, resetPull, threshold])

  return {
    containerRef,
    pullDistance,
    isRefreshing,
  }
}
