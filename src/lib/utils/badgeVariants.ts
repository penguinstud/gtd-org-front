import { TaskStatus, Priority } from '../types'

/**
 * Badge variant mappings for consistent styling across the application
 * Eliminates duplication and provides type-safe badge variant selection
 */

export type BadgeVariant = 'default' | 'success' | 'progress' | 'blocked' | 'planning' | 'secondary'

/**
 * Maps task status to appropriate badge variant
 */
export const getStatusBadgeVariant = (status: TaskStatus): BadgeVariant => {
  const statusVariants: Record<TaskStatus, BadgeVariant> = {
    TODO: 'default',
    NEXT: 'progress',
    WAITING: 'planning',
    DONE: 'success',
    SOMEDAY: 'secondary',
    CANCELED: 'blocked'
  }
  
  return statusVariants[status] || 'default'
}

/**
 * Maps priority level to appropriate badge variant
 */
export const getPriorityBadgeVariant = (priority: Priority): BadgeVariant => {
  if (!priority) return 'secondary'
  
  const priorityVariants: Record<Exclude<Priority, null>, BadgeVariant> = {
    A: 'blocked',   // High priority - urgent attention
    B: 'progress',  // Medium priority - in progress
    C: 'secondary'  // Low priority - secondary
  }
  
  return priorityVariants[priority] || 'secondary'
}

/**
 * Maps context to appropriate badge variant
 */
export const getContextBadgeVariant = (context: 'work' | 'home'): BadgeVariant => {
  return context === 'work' ? 'progress' : 'planning'
}

/**
 * Utility function to get completion rate badge variant based on percentage
 */
export const getCompletionRateBadgeVariant = (completionRate: number): BadgeVariant => {
  if (completionRate >= 75) return 'success'
  if (completionRate >= 50) return 'progress'
  if (completionRate >= 25) return 'planning'
  return 'blocked'
}

/**
 * Pre-defined badge configurations for common use cases
 */
export const BADGE_CONFIGS = {
  // Task status badges
  status: {
    TODO: { variant: 'default' as const, label: 'TODO' },
    NEXT: { variant: 'progress' as const, label: 'NEXT' },
    WAITING: { variant: 'planning' as const, label: 'WAITING' },
    DONE: { variant: 'success' as const, label: 'DONE' },
    SOMEDAY: { variant: 'secondary' as const, label: 'SOMEDAY' },
    CANCELED: { variant: 'blocked' as const, label: 'CANCELED' }
  },
  
  // Priority badges
  priority: {
    A: { variant: 'blocked' as const, label: 'High Priority' },
    B: { variant: 'progress' as const, label: 'Medium Priority' },
    C: { variant: 'secondary' as const, label: 'Low Priority' }
  },
  
  // Context badges
  context: {
    work: { variant: 'progress' as const, label: 'Work Context', icon: '💼' },
    home: { variant: 'planning' as const, label: 'Home Context', icon: '🏠' }
  },
  
  // Common action badges
  actions: {
    active: { variant: 'progress' as const, label: 'Active' },
    attention: { variant: 'blocked' as const, label: 'Attention' },
    onTrack: { variant: 'success' as const, label: 'On Track' },
    sync: { variant: 'progress' as const, label: 'Syncing...' }
  }
} as const