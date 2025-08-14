import React from 'react'
import { Card } from './Card'
import { ProgressBar } from './ProgressBar'

interface ContextStats {
  work: number
  home: number
  total?: number
}

interface ContextStatsCardProps {
  stats: ContextStats
}

export const ContextStatsCard: React.FC<ContextStatsCardProps> = ({ stats }) => {
  const total = stats.total ?? (stats.work + stats.home)
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Context Breakdown
        </h3>
      </div>
      <div className="space-y-3">
        <ContextStatRow
          icon="w-3 h-3 bg-blue-500 rounded-full"
          label="Work"
          value={stats.work}
          total={total}
          color="bg-blue-500"
        />
        <ContextStatRow
          icon="w-3 h-3 bg-purple-500 rounded-full"
          label="Home"
          value={stats.home}
          total={total}
          color="bg-purple-500"
        />
      </div>
    </Card>
  )
}

interface ContextStatRowProps {
  icon: string
  label: string
  value: number
  total: number
  color: string
}

const ContextStatRow: React.FC<ContextStatRowProps> = ({ icon, label, value, total, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className={icon}></div>
      <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{value}</span>
      <ProgressBar value={value} max={total} color={color} />
    </div>
  </div>
)