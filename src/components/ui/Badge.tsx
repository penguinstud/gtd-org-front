import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'progress' | 'blocked' | 'planning' | 'secondary'
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
  
  const variantClasses = {
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

// Status-specific badge variants
export function StatusBadge({ status }: { status: string }) {
  const statusVariants = {
    TODO: 'default',
    NEXT: 'progress',
    WAITING: 'progress',
    DONE: 'success',
    SOMEDAY: 'secondary',
    CANCELED: 'blocked'
  }
  
  return (
    <Badge variant={statusVariants[status as keyof typeof statusVariants] as any}>
      {status}
    </Badge>
  )
}

// Priority badge
export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null
  
  const priorityColors = {
    A: 'blocked',
    B: 'progress', 
    C: 'planning'
  }
  
  return (
    <Badge variant={priorityColors[priority as keyof typeof priorityColors] as any} size="sm">
      Priority {priority}
    </Badge>
  )
}

// Context badge
export function ContextBadge({ context }: { context: string }) {
  return (
    <Badge 
      variant={context === 'work' ? 'planning' : 'secondary'} 
      className={context === 'work' ? 'bg-context-work' : 'bg-context-home'}
    >
      {context.charAt(0).toUpperCase() + context.slice(1)}
    </Badge>
  )
}