'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, CalendarCheck2, Gauge, Settings, Swipe } from 'lucide-react'

import { cn } from '@/lib/utils'
import { triggerHaptic } from '@/lib/haptics'
import { useUIStore } from '@/stores/ui'

const tabs = [
  { key: 'review', label: 'Review', href: '/review', icon: Swipe },
  { key: 'schedule', label: 'Schedule', href: '/schedule', icon: CalendarCheck2 },
  { key: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { key: 'settings', label: 'Settings', href: '/settings', icon: Settings },
]

export function BottomTabBar() {
  const pathname = usePathname()
  const setActiveTab = useUIStore((state) => state.setActiveTab)

  return (
    <nav className="glass-panel safe-bottom fixed bottom-0 left-0 right-0 z-20 border-t border-white/20 bg-white/80 px-4 py-2 backdrop-blur dark:border-white/10 dark:bg-black/70">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.key}
              href={tab.href}
              onClick={() => {
                setActiveTab(tab.key as any)
                triggerHaptic('light')
              }}
              className={cn(
                'flex flex-1 flex-col items-center rounded-xl px-3 py-2 text-xs font-semibold transition',
                isActive
                  ? 'bg-safety-blue/10 text-safety-blue ring-1 ring-safety-blue/30'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-safety-blue' : '')} />
              <span className="mt-1">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
