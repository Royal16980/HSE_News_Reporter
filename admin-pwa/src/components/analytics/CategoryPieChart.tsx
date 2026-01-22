'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface CategoryPieChartProps {
  data: Array<{
    category: string
    count: number
  }>
}

const COLORS = [
  '#0066FF', // safety-blue
  '#10B981', // green
  '#F59E0B', // orange
  '#8B5CF6', // purple
  '#EF4444', // red
  '#06B6D4', // cyan
  '#F97316', // orange-red
]

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.category,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-xs font-medium"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  )
                }}
                outerRadius={100}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
