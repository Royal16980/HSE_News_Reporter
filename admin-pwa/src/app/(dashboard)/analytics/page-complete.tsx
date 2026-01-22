'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Calendar,
} from 'lucide-react'
import { MetricCard } from '@/components/analytics/MetricCard'
import { ViewsChart } from '@/components/analytics/ViewsChart'
import { CategoryPieChart } from '@/components/analytics/CategoryPieChart'
import {
  fetchAnalyticsOverview,
  fetchViewsData,
  type AnalyticsOverview,
  type ViewsData,
} from '@/lib/api/analytics'
import { triggerHaptic } from '@/lib/haptics'

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [viewsData, setViewsData] = useState<ViewsData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
        triggerHaptic('light')
      } else {
        setLoading(true)
      }

      const [overviewData, viewsChartData] = await Promise.all([
        fetchAnalyticsOverview(),
        fetchViewsData(),
      ])

      setOverview(overviewData)
      setViewsData(viewsChartData)

      if (isRefresh) {
        triggerHaptic('success')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      triggerHaptic('error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-safety-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-safe-bottom">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 bg-gradient-to-b from-safety-blue to-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-blue-100">Performance insights</p>
          </div>
          <button
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
            className="p-3 rounded-xl bg-white/20 backdrop-blur-sm active:scale-95 transition-transform"
          >
            <TrendingUp
              className={`w-6 h-6 text-white ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Total Articles"
            value={overview.totalArticles}
            icon={FileText}
          />
          <MetricCard
            title="Published Today"
            value={overview.publishedToday}
            change={overview.changePercent}
            trend={overview.recentTrend}
            icon={CheckCircle}
          />
          <MetricCard
            title="Pending Review"
            value={overview.pendingReview}
            icon={Clock}
          />
          <MetricCard
            title="Scheduled"
            value={overview.scheduledArticles}
            icon={Calendar}
          />
        </div>

        {/* Views Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ViewsChart data={viewsData} />
        </motion.div>

        {/* Category Breakdown */}
        {overview.categoryBreakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CategoryPieChart data={overview.categoryBreakdown} />
          </motion.div>
        )}

        {/* Category List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
        >
          <h2 className="text-lg font-bold mb-4">Content Distribution</h2>
          <div className="space-y-3">
            {overview.categoryBreakdown.map((cat, index) => {
              const percentage = (cat.count / overview.totalArticles) * 100
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {cat.category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {cat.count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-safety-blue"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Trend Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl ${
            overview.recentTrend === 'up'
              ? 'bg-green-50 dark:bg-green-900/20'
              : overview.recentTrend === 'down'
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-gray-50 dark:bg-gray-800/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                overview.recentTrend === 'up'
                  ? 'bg-green-100 dark:bg-green-900'
                  : overview.recentTrend === 'down'
                  ? 'bg-red-100 dark:bg-red-900'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <TrendingUp
                className={`w-6 h-6 ${
                  overview.recentTrend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : overview.recentTrend === 'down'
                    ? 'text-red-600 dark:text-red-400 rotate-180'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {overview.recentTrend === 'up'
                  ? 'Publishing trending up'
                  : overview.recentTrend === 'down'
                  ? 'Publishing trending down'
                  : 'Publishing stable'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Math.abs(overview.changePercent)}% vs last week
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
