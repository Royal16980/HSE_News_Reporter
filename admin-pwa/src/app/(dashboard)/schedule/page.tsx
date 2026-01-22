'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { format, startOfWeek, addDays } from 'date-fns'
import { Calendar, Clock, RefreshCw, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { fetchWeekSchedule, type ScheduledArticle } from '@/lib/api/schedule'
import { triggerHaptic } from '@/lib/haptics'
import { usePullToRefresh } from '@/lib/gestures/usePullToRefresh'

export default function SchedulePage() {
  const [weekArticles, setWeekArticles] = useState<ScheduledArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<ScheduledArticle | null>(null)

  const loadSchedule = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
        triggerHaptic('light')
      } else {
        setLoading(true)
      }

      const data = await fetchWeekSchedule()
      setWeekArticles(data)

      if (isRefresh) {
        triggerHaptic('success')
      }
    } catch (error) {
      console.error('Error loading schedule:', error)
      triggerHaptic('error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadSchedule()
  }, [])

  // Group articles by date
  const articlesByDate = weekArticles.reduce((acc, article) => {
    if (!article.scheduled_publish_time) return acc
    const date = format(new Date(article.scheduled_publish_time), 'yyyy-MM-dd')
    if (!acc[date]) acc[date] = []
    acc[date].push(article)
    return acc
  }, {} as Record<string, ScheduledArticle[]>)

  // Generate week days
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh(() => loadSchedule(true), {
    disabled: loading,
  })

  const categoryBadgeClasses: Record<string, string> = {
    'workplace-safety': 'bg-blue-100 text-blue-700',
    'fire-safety': 'bg-orange-100 text-orange-700',
    'chemical-safety': 'bg-purple-100 text-purple-700',
    construction: 'bg-amber-100 text-amber-700',
    healthcare: 'bg-emerald-100 text-emerald-700',
    'food-safety': 'bg-lime-100 text-lime-700',
    ergonomics: 'bg-indigo-100 text-indigo-700',
    'mental-health': 'bg-pink-100 text-pink-700',
    incidents: 'bg-red-100 text-red-700',
    regulations: 'bg-slate-100 text-slate-700',
    'best-practices': 'bg-teal-100 text-teal-700',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-safety-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="pb-safe-bottom">
      <div
        className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400"
        style={{ height: pullDistance }}
      >
        {isRefreshing || refreshing ? 'Refreshing schedule...' : pullDistance > 10 ? 'Release to refresh' : ''}
      </div>
      {/* Header */}
      <div className="px-6 pt-8 pb-6 bg-gradient-to-b from-safety-blue to-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Schedule</h1>
            <p className="text-blue-100">Publishing calendar</p>
          </div>
          <button
            onClick={() => loadSchedule(true)}
            disabled={refreshing}
            className="p-3 rounded-xl bg-white/20 backdrop-blur-sm active:scale-95 transition-transform disabled:opacity-50"
            aria-label="Refresh schedule"
          >
            <RefreshCw
              className={`w-6 h-6 text-white ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Week View */}
      <div className="px-6 py-6 space-y-4">
        {weekDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayArticles = articlesByDate[dateKey] || []
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

          return (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className={isToday ? 'border-safety-blue border-2' : ''}>
                <CardContent className="p-4">
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {format(day, 'EEEE')}
                        {isToday && <span className="ml-2 text-sm text-safety-blue">(Today)</span>}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(day, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{dayArticles.length}</span>
                    </div>
                  </div>

                  {/* Articles */}
                  {dayArticles.length > 0 ? (
                    <div className="space-y-2">
                      {dayArticles
                        .sort((a, b) => {
                          const timeA = new Date(a.scheduled_publish_time!).getTime()
                          const timeB = new Date(b.scheduled_publish_time!).getTime()
                          return timeA - timeB
                        })
                        .map((article) => (
                          <motion.div
                            key={article.id}
                            whileTap={{ scale: 0.98 }}
                            className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
                            onClick={() => setSelectedArticle(article)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-white">
                                  {article.title}
                                </p>
                                {article.scheduled_publish_time && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {format(new Date(article.scheduled_publish_time), 'h:mm a')}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {article.category && (
                                <span
                                  className={`ml-2 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                                    categoryBadgeClasses[article.category] || 'bg-safety-blue/10 text-safety-blue'
                                  }`}
                                >
                                  {article.category}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No articles scheduled
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {selectedArticle && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="safe-bottom relative w-full max-w-xl rounded-t-3xl bg-white p-6 shadow-modal dark:bg-gray-900"
          >
            <button
              aria-label="Close schedule details"
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              onClick={() => setSelectedArticle(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {selectedArticle.scheduled_publish_time
                    ? format(new Date(selectedArticle.scheduled_publish_time), 'MMMM dd, yyyy')
                    : 'Unscheduled'}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {selectedArticle.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                {selectedArticle.scheduled_publish_time && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(selectedArticle.scheduled_publish_time), 'h:mm a')}
                  </span>
                )}
                {selectedArticle.status && <span className="capitalize">{selectedArticle.status}</span>}
              </div>
              {selectedArticle.category && (
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    categoryBadgeClasses[selectedArticle.category] || 'bg-safety-blue/10 text-safety-blue'
                  }`}
                >
                  {selectedArticle.category}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
