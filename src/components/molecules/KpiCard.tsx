import React from 'react'
import { Card } from './Card'
import { Badge } from '../atoms/Badge'
import { cn } from '../../lib/utils/cn'

export interface KpiCardProps {
  title: string
  value: number | string
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  badge?: {
    text: string
    variant?: 'default' | 'success' | 'progress' | 'blocked' | 'planning' | 'secondary'
  }
  icon?: React.ReactNode
  className?: string
  onClick?: () => void
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  badge,
  icon,
  className,
  onClick
}: KpiCardProps) {
  return (
    <Card 
      hover={!!onClick} 
      className={cn(
        'p-6 cursor-pointer transition-all duration-200',
        onClick && 'hover:shadow-lg hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && (
              <div className="text-gray-500 dark:text-gray-400">
                {icon}
              </div>
            )}
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {title}
            </h3>
          </div>
          
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </span>
            {trend && (
              <div className={cn(
                'flex items-center text-xs font-medium',
                trend.direction === 'up' && 'text-green-600 dark:text-green-400',
                trend.direction === 'down' && 'text-red-600 dark:text-red-400',
                trend.direction === 'neutral' && 'text-gray-500 dark:text-gray-400'
              )}>
                <span className="mr-1">
                  {trend.direction === 'up' && '↗️'}
                  {trend.direction === 'down' && '↘️'}
                  {trend.direction === 'neutral' && '➡️'}
                </span>
                {trend.value > 0 ? '+' : ''}{trend.value}%
                {trend.label && (
                  <span className="ml-1 text-gray-400">{trend.label}</span>
                )}
              </div>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        
        {badge && (
          <Badge variant={badge.variant || 'default'}>
            {badge.text}
          </Badge>
        )}
      </div>
    </Card>
  )
}