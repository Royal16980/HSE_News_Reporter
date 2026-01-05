'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SafeAreaWrapperProps = {
  children: ReactNode
  className?: string
}

export function SafeAreaWrapper({ children, className }: SafeAreaWrapperProps) {
  return <div className={cn('safe-top safe-bottom px-4', className)}>{children}</div>
}
