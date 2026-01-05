'use client'

import { useGesture } from '@use-gesture/react'
import { useSpring } from 'framer-motion'

import { triggerHaptic } from '../haptics'

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

type UseSwipeGestureOptions = {
  threshold?: number
  onStart?: () => void
}

export function useSwipeGesture(onSwipe: (direction: SwipeDirection) => void, options?: UseSwipeGestureOptions) {
  const { threshold = 0.35, onStart } = options || {}
  const x = useSpring(0, { stiffness: 240, damping: 24 })
  const y = useSpring(0, { stiffness: 240, damping: 24 })
  const rotate = useSpring(0, { stiffness: 220, damping: 20 })

  const bind = useGesture(
    {
      onDrag: ({ down, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], first }) => {
        if (first && onStart) onStart()

        const speed = Math.max(vx, vy)
        const trigger = speed > threshold || Math.abs(mx) > 120 || Math.abs(my) > 120

        if (!down && trigger) {
          const isHorizontal = Math.abs(dx) > Math.abs(dy)
          const dir: SwipeDirection = isHorizontal ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down'

          triggerHaptic(dir === 'right' ? 'medium' : dir === 'left' ? 'heavy' : 'light')
          onSwipe(dir)

          x.set(0)
          y.set(0)
          rotate.set(0)
          return
        }

        x.set(down ? mx : 0)
        y.set(down ? my : 0)
        rotate.set(down ? mx / 20 : 0)
      },
    },
    {
      drag: {
        filterTaps: true,
        preventScroll: true,
      },
    },
  )

  return { bind, style: { x, y, rotate } }
}
