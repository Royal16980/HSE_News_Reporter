'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { format } from 'date-fns'

interface ViewsChartProps {
  data: Array<{
    date: string
    views: number
    uniqueVisitors?: number
  }>
}

export function ViewsChart({ data }: ViewsChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Views Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                className="text-xs text-gray-600 dark:text-gray-400"
                tickLine={false}
              />
              <YAxis
                className="text-xs text-gray-600 dark:text-gray-400"
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#0066FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
