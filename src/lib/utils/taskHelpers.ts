import { Task, TaskStatus, Priority, Context } from '../types'
import { getStatusBadgeVariant, getPriorityBadgeVariant } from './badgeVariants'

/**
 * Centralized task helper utilities
 * Eliminates duplication and provides consistent task operations across the app
 */

/**
 * Task filtering utilities with optimized performance
 */
export const TaskFilters = {
  byStatus: (tasks: Task[], status: TaskStatus): Task[] => 
    tasks.filter(task => task.status === status),
  
  byContext: (tasks: Task[], context: Context): Task[] =>
    tasks.filter(task => task.context === context),
  
  byPriority: (tasks: Task[], priority: Priority): Task[] =>
    tasks.filter(task => task.priority === priority),
  
  byProject: (tasks: Task[], projectId: string): Task[] =>
    tasks.filter(task => task.project === projectId),
  
  overdue: (tasks: Task[]): Task[] => {
    const now = new Date()
    return tasks.filter(task => {
      if (!task.deadline || task.status === 'DONE' || task.status === 'CANCELED') {
        return false
      }
      return new Date(task.deadline) < now
    })
  },
  
  dueToday: (tasks: Task[]): Task[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return tasks.filter(task => {
      if (task.scheduled) {
        const scheduledDate = new Date(task.scheduled)
        return scheduledDate >= today && scheduledDate < tomorrow
      }
      
      if (task.deadline) {
        const dueDate = new Date(task.deadline)
        return dueDate >= today && dueDate < tomorrow
      }
      
      return false
    })
  },
  
  inProgress: (tasks: Task[]): Task[] =>
    tasks.filter(task => task.status === 'NEXT' || task.status === 'WAITING'),
  
  completed: (tasks: Task[]): Task[] =>
    tasks.filter(task => task.status === 'DONE'),
  
  pending: (tasks: Task[]): Task[] =>
    tasks.filter(task => task.status === 'TODO'),
}

/**
 * Task aggregation utilities for statistics
 */
export const TaskAggregators = {
  countByStatus: (tasks: Task[]): Record<TaskStatus, number> => {
    const counts = {
      TODO: 0,
      NEXT: 0,
      WAITING: 0,
      SOMEDAY: 0,
      DONE: 0,
      CANCELED: 0
    }
    
    tasks.forEach(task => {
      counts[task.status]++
    })
    
    return counts
  },
  
  countByPriority: (tasks: Task[]): Record<'A' | 'B' | 'C' | 'none', number> => {
    const counts = { A: 0, B: 0, C: 0, none: 0 }
    
    tasks.forEach(task => {
      if (task.priority) {
        counts[task.priority]++
      } else {
        counts.none++
      }
    })
    
    return counts
  },
  
  countByContext: (tasks: Task[]): Record<Context, number> => {
    const counts = { work: 0, home: 0 }
    
    tasks.forEach(task => {
      counts[task.context]++
    })
    
    return counts
  },
  
  completionRate: (tasks: Task[]): number => {
    if (tasks.length === 0) return 0
    const completed = TaskFilters.completed(tasks).length
    return (completed / tasks.length) * 100
  },
  
  averageCompletionTime: (tasks: Task[]): number => {
    const completedTasks = tasks.filter(task => 
      task.status === 'DONE' && task.completedAt && task.created
    )
    
    if (completedTasks.length === 0) return 0
    
    const totalDays = completedTasks.reduce((sum, task) => {
      const created = new Date(task.created)
      const completed = new Date(task.completedAt!)
      const diffTime = completed.getTime() - created.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      return sum + diffDays
    }, 0)
    
    return totalDays / completedTasks.length
  }
}

/**
 * Task validation utilities
 */
export const TaskValidators = {
  isOverdue: (task: Task): boolean => {
    if (!task.deadline || task.status === 'DONE' || task.status === 'CANCELED') {
      return false
    }
    return new Date(task.deadline) < new Date()
  },
  
  isDueToday: (task: Task): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (task.deadline) {
      const dueDate = new Date(task.deadline)
      return dueDate >= today && dueDate < tomorrow
    }
    
    return false
  },
  
  isScheduledToday: (task: Task): boolean => {
    if (!task.scheduled) return false
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const scheduledDate = new Date(task.scheduled)
    return scheduledDate >= today && scheduledDate < tomorrow
  },
  
  hasHighPriority: (task: Task): boolean => {
    return task.priority === 'A'
  },
  
  isActionable: (task: Task): boolean => {
    return task.status === 'NEXT' || task.status === 'TODO'
  },
  
  isBlocked: (task: Task): boolean => {
    return task.status === 'WAITING'
  }
}

/**
 * Task formatting utilities
 */
export const TaskFormatters = {
  getBadgeVariant: (task: Task, type: 'status' | 'priority') => {
    if (type === 'status') {
      return getStatusBadgeVariant(task.status)
    } else {
      return task.priority ? getPriorityBadgeVariant(task.priority) : 'secondary'
    }
  },
  
  formatDueDate: (task: Task): string => {
    if (!task.deadline) return ''
    
    const dueDate = new Date(task.deadline)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    if (diffDays === -1) return 'Due yesterday'
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`
    if (diffDays <= 7) return `Due in ${diffDays} days`
    
    return dueDate.toLocaleDateString()
  },
  
  formatCreatedDate: (task: Task): string => {
    const created = new Date(task.created)
    const now = new Date()
    const diffTime = now.getTime() - created.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Created today'
    if (diffDays === 1) return 'Created yesterday'
    if (diffDays <= 7) return `Created ${diffDays} days ago`
    
    return created.toLocaleDateString()
  },
  
  formatEffort: (effort?: number): string => {
    if (!effort) return ''
    
    if (effort < 1) {
      return `${Math.round(effort * 60)}m`
    } else if (effort < 8) {
      return `${effort}h`
    } else {
      const days = Math.round(effort / 8 * 10) / 10
      return `${days}d`
    }
  }
}

/**
 * Task sorting utilities
 */
export const TaskSorters = {
  byPriority: (a: Task, b: Task): number => {
    const priorityOrder = { A: 3, B: 2, C: 1, null: 0 }
    const aPriority = priorityOrder[a.priority || 'null']
    const bPriority = priorityOrder[b.priority || 'null']
    return bPriority - aPriority
  },
  
  byDeadline: (a: Task, b: Task): number => {
    if (!a.deadline && !b.deadline) return 0
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  },
  
  byCreated: (a: Task, b: Task): number => {
    return new Date(b.created).getTime() - new Date(a.created).getTime()
  },
  
  byTitle: (a: Task, b: Task): number => {
    return a.title.localeCompare(b.title)
  },
  
  byStatus: (a: Task, b: Task): number => {
    const statusOrder = { NEXT: 4, TODO: 3, WAITING: 2, SOMEDAY: 1, DONE: 0, CANCELED: 0 }
    return statusOrder[b.status] - statusOrder[a.status]
  }
}

/**
 * Performance-optimized search utility
 */
export const TaskSearch = {
  searchTasks: (tasks: Task[], query: string): Task[] => {
    if (!query.trim()) return tasks
    
    const lowercaseQuery = query.toLowerCase()
    const terms = lowercaseQuery.split(/\s+/)
    
    return tasks.filter(task => {
      const searchableText = [
        task.title,
        task.description || '',
        task.project || '',
        task.area || '',
        ...task.tags
      ].join(' ').toLowerCase()
      
      return terms.every(term => searchableText.includes(term))
    })
  },
  
  searchByTags: (tasks: Task[], tags: string[]): Task[] => {
    if (tags.length === 0) return tasks
    
    return tasks.filter(task =>
      tags.some(tag => task.tags.indexOf(tag) !== -1)
    )
  }
}