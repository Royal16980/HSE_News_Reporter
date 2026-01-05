'use client'

import { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

import { BottomTabBar } from './BottomTabBar'
import { SafeAreaWrapper } from './SafeAreaWrapper'
import { useUIStore } from '@/stores/ui'
import { cn } from '@/lib/utils'

type DashboardShellProps = {
  children: ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  const isOffline = useUIStore((state) => state.isOffline)

  return (
    <div className={cn('pb-24', className)}>
      {isOffline && (
        <div className="safe-top z-10 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
          <div className="mx-auto flex max-w-xl items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <p>Offline mode — actions will be queued and synced later.</p>
          </div>
        </div>
      )}
      <SafeAreaWrapper className="mx-auto flex max-w-xl flex-col gap-4 py-4">{children}</SafeAreaWrapper>
      <BottomTabBar />
    </div>
  )
}
