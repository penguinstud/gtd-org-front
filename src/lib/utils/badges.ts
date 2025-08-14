export type TaskStatus = 'TODO' | 'NEXT' | 'DONE' | 'WAITING' | 'SOMEDAY' | 'CANCELED'
export type Priority = 'A' | 'B' | 'C'
export type BadgeVariant = 'default' | 'success' | 'progress' | 'blocked' | 'planning' | 'secondary'

export const getStatusBadgeVariant = (status: TaskStatus): BadgeVariant => {
  const variants: Record<TaskStatus, BadgeVariant> = {
    'DONE': 'success',
    'NEXT': 'progress',
    'WAITING': 'planning',
    'TODO': 'secondary',
    'SOMEDAY': 'default',
    'CANCELED': 'blocked'
  }
  return variants[status] || 'secondary'
}

export const getPriorityBadgeVariant = (priority: Priority): BadgeVariant => {
  const variants: Record<Priority, BadgeVariant> = {
    'A': 'blocked',
    'B': 'progress',
    'C': 'secondary'
  }
  return variants[priority] || 'secondary'
}

export const getCompletionRateBadgeVariant = (rate: number): BadgeVariant => {
  if (rate > 75) return 'success'
  if (rate > 50) return 'progress'
  return 'blocked'
}