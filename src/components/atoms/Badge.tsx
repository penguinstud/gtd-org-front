import React from 'react'
import {
  getStatusBadgeVariant,
  getPriorityBadgeVariant,
  getContextBadgeVariant,
  BADGE_CONFIGS,
  type BadgeVariant
} from '../../lib/utils/badgeVariants'
import { TaskStatus, Priority } from '../../lib/types'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-premium'
  
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-status-success text-white',
    progress: 'bg-status-progress text-gray-800',
    blocked: 'bg-status-blocked text-white',
    planning: 'bg-status-planning text-white',
    secondary: 'bg-secondary text-secondary-foreground'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  )
}

// Status-specific badge using badgeVariants utility
export function StatusBadge({ status }: { status: TaskStatus }) {
  const variant = getStatusBadgeVariant(status)
  
  return (
    <Badge variant={variant}>
      {status}
    </Badge>
  )
}

// Priority badge using badgeVariants utility
export function PriorityBadge({ priority }: { priority: Priority }) {
  if (!priority) return null
  
  const variant = getPriorityBadgeVariant(priority)
  const config = BADGE_CONFIGS.priority[priority]
  
  return (
    <Badge variant={variant} size="sm">
      {config.label}
    </Badge>
  )
}

// Context badge using badgeVariants utility
export function ContextBadge({ context }: { context: 'work' | 'home' }) {
  const variant = getContextBadgeVariant(context)
  const config = BADGE_CONFIGS.context[context]
  
  return (
    <Badge
      variant={variant}
      className={context === 'work' ? 'bg-context-work' : 'bg-context-home'}
    >
      {config.icon} {config.label}
    </Badge>
  )
}