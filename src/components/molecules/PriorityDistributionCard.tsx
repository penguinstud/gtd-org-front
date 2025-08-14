import React from 'react'
import { Card } from './Card'
import { Badge } from '../atoms/Badge'
import { getPriorityBadgeVariant } from '../../lib/utils/badges'

interface PriorityStats {
  A: number
  B: number
  C: number
}

interface PriorityDistributionCardProps {
  priorities: PriorityStats
}

export const PriorityDistributionCard: React.FC<PriorityDistributionCardProps> = ({ priorities }) => {
  const priorityData = [
    { level: 'A' as const, label: 'High Priority', count: priorities.A },
    { level: 'B' as const, label: 'Medium Priority', count: priorities.B },
    { level: 'C' as const, label: 'Low Priority', count: priorities.C }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Priority Distribution
        </h3>
      </div>
      <div className="space-y-3">
        {priorityData.map(({ level, label, count }) => (
          <div key={level} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityBadgeVariant(level)}>{level}</Badge>
              <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
            </div>
            <span className="text-sm font-medium">{count}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}