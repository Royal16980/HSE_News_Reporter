'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  trend?: 'up' | 'down' | 'stable'
}

export function MetricCard({ title, value, change, icon: Icon, trend }: MetricCardProps) {
  const getTrendColor = () => {
    if (!change) return 'text-gray-500'
    if (trend === 'up') return 'text-green-500'
    if (trend === 'down') return 'text-red-500'
    return 'text-gray-500'
  }

  const formatChange = () => {
    if (change === undefined) return null
    const sign = change > 0 ? '+' : ''
    return `${sign}${change}%`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </span>
            <div className="p-2 rounded-xl bg-safety-blue/10">
              <Icon className="w-5 h-5 text-safety-blue" />
            </div>
          </div>

          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>

            {change !== undefined && (
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {formatChange()}
                </span>
              </div>
            )}
          </div>

          {trend && (
            <div className="mt-2">
              <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    trend === 'up'
                      ? 'bg-green-500'
                      : trend === 'down'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
