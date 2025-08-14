import React from 'react'
import { cn } from '../../lib/utils/cn'

interface ProgressBarProps {
  value: number
  max: number
  color?: string
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max, 
  color = 'bg-blue-500',
  className 
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0
  
  return (
    <div className={cn('w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full', className)}>
      <div 
        className={cn('h-full rounded-full', color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}