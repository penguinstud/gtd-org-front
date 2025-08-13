import { Task, TaskStatus, Priority, Context } from '../../types'

/**
 * Reusable selector functions for task stores
 * These pure functions can be used by any store implementation
 */

/**
 * Filter tasks by status
 */
export function selectTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter(task => task.status === status)
}

/**
 * Filter tasks by project
 */
export function selectTasksByProject(tasks: Task[], projectId: string): Task[] {
  return tasks.filter(task => task.project === projectId)
}

/**
 * Filter tasks by context
 */
export function selectTasksByContext(tasks: Task[], context: Context): Task[] {
  return tasks.filter(task => task.context === context)
}

/**
 * Get overdue tasks
 */
export function selectOverdueTasks(tasks: Task[]): Task[] {
  const now = new Date()
  return tasks.filter(task => {
    if (!task.deadline || task.status === 'DONE' || task.status === 'CANCELED') {
      return false
    }
    return new Date(task.deadline) < now
  })
}

/**
 * Filter tasks by priority
 */
export function selectTasksByPriority(tasks: Task[], priority: Priority): Task[] {
  return tasks.filter(task => task.priority === priority)
}

/**
 * Get today's tasks (scheduled or due today)
 */
export function selectTodaysTasks(tasks: Task[]): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return tasks.filter(task => {
    // Tasks scheduled for today
    if (task.scheduled) {
      const scheduledDate = new Date(task.scheduled)
      return scheduledDate >= today && scheduledDate < tomorrow
    }
    
    // Tasks due today
    if (task.deadline) {
      const dueDate = new Date(task.deadline)
      return dueDate >= today && dueDate < tomorrow
    }
    
    return false
  })
}

/**
 * Get tasks for this week
 */
export function selectWeekTasks(tasks: Task[]): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  return tasks.filter(task => {
    if (task.scheduled) {
      const scheduledDate = new Date(task.scheduled)
      return scheduledDate >= today && scheduledDate < nextWeek
    }
    
    if (task.deadline) {
      const dueDate = new Date(task.deadline)
      return dueDate >= today && dueDate < nextWeek
    }
    
    return false
  })
}

/**
 * Get upcoming tasks (next 30 days)
 */
export function selectUpcomingTasks(tasks: Task[]): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const nextMonth = new Date(today)
  nextMonth.setDate(nextMonth.getDate() + 30)

  return tasks.filter(task => {
    if (task.scheduled) {
      const scheduledDate = new Date(task.scheduled)
      return scheduledDate >= today && scheduledDate < nextMonth
    }
    
    if (task.deadline) {
      const dueDate = new Date(task.deadline)
      return dueDate >= today && dueDate < nextMonth
    }
    
    return false
  })
}

/**
 * Get unscheduled tasks
 */
export function selectUnscheduledTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => 
    !task.scheduled && 
    !task.deadline && 
    task.status !== 'DONE' && 
    task.status !== 'CANCELED'
  )
}

/**
 * Get completed tasks
 */
export function selectCompletedTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.status === 'DONE')
}

/**
 * Get active tasks (not done or canceled)
 */
export function selectActiveTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => 
    task.status !== 'DONE' && 
    task.status !== 'CANCELED'
  )
}

/**
 * Get next actions (NEXT status tasks)
 */
export function selectNextActions(tasks: Task[]): Task[] {
  return tasks.filter(task => task.status === 'NEXT')
}

/**
 * Get waiting tasks
 */
export function selectWaitingTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.status === 'WAITING')
}

/**
 * Get someday/maybe tasks
 */
export function selectSomedayTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.status === 'SOMEDAY')
}

/**
 * Calculate task statistics
 */
export interface TaskStatistics {
  total: number
  completed: number
  pending: number
  overdue: number
  inProgress: number
  byPriority: Record<'A' | 'B' | 'C', number>
  byStatus: Record<TaskStatus, number>
  byContext?: Record<Context, number>
  completionRate: number
  averageCompletionTime?: number
}

export function calculateTaskStats(tasks: Task[]): TaskStatistics {
  const total = tasks.length
  const completed = selectCompletedTasks(tasks).length
  const pending = selectTasksByStatus(tasks, 'TODO').length
  const overdue = selectOverdueTasks(tasks).length
  const inProgress = selectTasksByStatus(tasks, 'NEXT').length + 
                     selectTasksByStatus(tasks, 'WAITING').length

  const byPriority: Record<'A' | 'B' | 'C', number> = {
    A: selectTasksByPriority(tasks, 'A').length,
    B: selectTasksByPriority(tasks, 'B').length,
    C: selectTasksByPriority(tasks, 'C').length
  }

  const byStatus: Record<TaskStatus, number> = {
    TODO: selectTasksByStatus(tasks, 'TODO').length,
    NEXT: selectTasksByStatus(tasks, 'NEXT').length,
    WAITING: selectTasksByStatus(tasks, 'WAITING').length,
    SOMEDAY: selectTasksByStatus(tasks, 'SOMEDAY').length,
    DONE: selectTasksByStatus(tasks, 'DONE').length,
    CANCELED: selectTasksByStatus(tasks, 'CANCELED').length
  }

  const byContext: Record<Context, number> = {
    work: selectTasksByContext(tasks, 'work').length,
    home: selectTasksByContext(tasks, 'home').length
  }

  const completionRate = total > 0 ? (completed / total) * 100 : 0

  // Calculate average completion time for completed tasks
  let averageCompletionTime: number | undefined
  const completedTasksWithTime = tasks.filter(task => 
    task.status === 'DONE' && task.completedAt && task.created
  )
  
  if (completedTasksWithTime.length > 0) {
    const totalTime = completedTasksWithTime.reduce((sum, task) => {
      const created = new Date(task.created).getTime()
      const completed = new Date(task.completedAt!).getTime()
      return sum + (completed - created)
    }, 0)
    
    averageCompletionTime = totalTime / completedTasksWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
  }

  return {
    total,
    completed,
    pending,
    overdue,
    inProgress,
    byPriority,
    byStatus,
    byContext,
    completionRate,
    averageCompletionTime
  }
}

/**
 * Sort tasks by various criteria
 */
export type TaskSortField = 'created' | 'modified' | 'scheduled' | 'deadline' | 'priority' | 'title' | 'status'
export type SortDirection = 'asc' | 'desc'

export function sortTasks(
  tasks: Task[], 
  field: TaskSortField = 'created', 
  direction: SortDirection = 'desc'
): Task[] {
  const sorted = [...tasks].sort((a, b) => {
    let aVal: any
    let bVal: any

    switch (field) {
      case 'priority':
        // Priority A > B > C > null
        const priorityOrder = { 'A': 3, 'B': 2, 'C': 1, null: 0 }
        aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
        bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
        break
      
      case 'status':
        // Status order for sorting
        const statusOrder = {
          'NEXT': 5,
          'TODO': 4,
          'WAITING': 3,
          'SOMEDAY': 2,
          'DONE': 1,
          'CANCELED': 0
        }
        aVal = statusOrder[a.status]
        bVal = statusOrder[b.status]
        break
      
      case 'created':
      case 'modified':
      case 'scheduled':
      case 'deadline':
        aVal = a[field] ? new Date(a[field] as Date).getTime() : 0
        bVal = b[field] ? new Date(b[field] as Date).getTime() : 0
        break
      
      case 'title':
        aVal = a.title.toLowerCase()
        bVal = b.title.toLowerCase()
        break
      
      default:
        aVal = a[field as keyof Task]
        bVal = b[field as keyof Task]
    }

    if (direction === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })

  return sorted
}

/**
 * Filter tasks by multiple criteria
 */
export interface TaskFilter {
  status?: TaskStatus[]
  priority?: Priority[]
  contexts?: Context[]
  projects?: string[]
  tags?: string[]
  hasDeadline?: boolean
  isOverdue?: boolean
  searchText?: string
}

export function filterTasks(tasks: Task[], filters: TaskFilter): Task[] {
  let filtered = [...tasks]

  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(task => 
      filters.status!.includes(task.status)
    )
  }

  if (filters.priority && filters.priority.length > 0) {
    filtered = filtered.filter(task => 
      task.priority && filters.priority!.includes(task.priority)
    )
  }

  if (filters.contexts && filters.contexts.length > 0) {
    filtered = filtered.filter(task => 
      filters.contexts!.includes(task.context)
    )
  }

  if (filters.projects && filters.projects.length > 0) {
    filtered = filtered.filter(task => 
      task.project && filters.projects!.includes(task.project)
    )
  }

  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(task => 
      task.tags.some(tag => filters.tags!.includes(tag))
    )
  }

  if (filters.hasDeadline !== undefined) {
    filtered = filtered.filter(task => 
      filters.hasDeadline ? !!task.deadline : !task.deadline
    )
  }

  if (filters.isOverdue) {
    filtered = selectOverdueTasks(filtered)
  }

  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase()
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(searchLower) ||
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  return filtered
}

/**
 * Group tasks by various criteria
 */
export type TaskGroupBy = 'status' | 'priority' | 'context' | 'project' | 'date'

export function groupTasks(tasks: Task[], groupBy: TaskGroupBy): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {}

  tasks.forEach(task => {
    let key: string

    switch (groupBy) {
      case 'status':
        key = task.status
        break
      
      case 'priority':
        key = task.priority || 'No Priority'
        break
      
      case 'context':
        key = task.context
        break
      
      case 'project':
        key = task.project || 'No Project'
        break
      
      case 'date':
        if (task.scheduled) {
          key = new Date(task.scheduled).toDateString()
        } else if (task.deadline) {
          key = new Date(task.deadline).toDateString()
        } else {
          key = 'Unscheduled'
        }
        break
      
      default:
        key = 'Other'
    }

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(task)
  })

  return groups
}