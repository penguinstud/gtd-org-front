import {
  TaskFilters,
  TaskValidators,
  TaskFormatters,
  TaskSorters,
  TaskSearch,
  calculateTaskStats
} from '../../stores/base/StoreSelectors'
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { Task, TaskStatus, Context, Priority } from '../../types'

// Mock task factory
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test Task',
  status: 'TODO' as TaskStatus,
  context: 'work' as Context,
  created: new Date('2024-01-01'),
  modified: new Date('2024-01-01'),
  priority: null,
  tags: [],
  properties: {},
  ...overrides
})

describe('TaskFilters', () => {
  const tasks: Task[] = [
    createMockTask({ id: '1', status: 'TODO', priority: 'A', context: 'work' }),
    createMockTask({ id: '2', status: 'DONE', priority: 'B', context: 'home' }),
    createMockTask({ id: '3', status: 'NEXT', priority: 'C', context: 'work' }),
    createMockTask({ id: '4', status: 'WAITING', context: 'home' }),
  ]

  describe('byStatus', () => {
    it('should filter tasks by status', () => {
      const todoTasks = TaskFilters.byStatus(tasks, 'TODO')
      expect(todoTasks).toHaveLength(1)
      expect(todoTasks[0].id).toBe('1')
    })
  })

  describe('byContext', () => {
    it('should filter tasks by context', () => {
      const workTasks = TaskFilters.byContext(tasks, 'work')
      expect(workTasks).toHaveLength(2)
      expect(workTasks.map((t: Task) => t.id)).toEqual(['1', '3'])
    })
  })

  describe('byPriority', () => {
    it('should filter tasks by priority', () => {
      const highPriorityTasks = TaskFilters.byPriority(tasks, 'A' as Priority)
      expect(highPriorityTasks).toHaveLength(1)
      expect(highPriorityTasks[0].id).toBe('1')
    })
  })

  describe('overdue', () => {
    it('should filter overdue tasks', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const tasksWithDeadlines = [
        createMockTask({ id: '1', deadline: yesterday, status: 'TODO' }),
        createMockTask({ id: '2', deadline: new Date('2025-12-31'), status: 'TODO' }),
        createMockTask({ id: '3', deadline: yesterday, status: 'DONE' }),
      ]
      
      const overdueTasks = TaskFilters.overdue(tasksWithDeadlines)
      expect(overdueTasks).toHaveLength(1)
      expect(overdueTasks[0].id).toBe('1')
    })
  })

  describe('dueToday', () => {
    it('should filter tasks due today', () => {
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const tasksWithDates = [
        createMockTask({ id: '1', scheduled: today }),
        createMockTask({ id: '2', deadline: today }),
        createMockTask({ id: '3', deadline: tomorrow }),
      ]
      
      const dueTodayTasks = TaskFilters.dueToday(tasksWithDates)
      expect(dueTodayTasks).toHaveLength(2)
      expect(dueTodayTasks.map((t: Task) => t.id)).toEqual(['1', '2'])
    })
  })

  describe('completed', () => {
    it('should filter completed tasks', () => {
      const completedTasks = TaskFilters.completed(tasks)
      expect(completedTasks).toHaveLength(1)
      expect(completedTasks[0].id).toBe('2')
    })
  })
})

describe('calculateTaskStats', () => {
  const tasks: Task[] = [
    createMockTask({ status: 'TODO', priority: 'A', context: 'work' }),
    createMockTask({ status: 'TODO', priority: 'B', context: 'home' }),
    createMockTask({ status: 'DONE', priority: 'A', context: 'work' }),
    createMockTask({ status: 'NEXT', context: 'home' }),
  ]

  describe('task statistics', () => {
    it('should calculate task statistics correctly', () => {
      const stats = calculateTaskStats(tasks)
      
      expect(stats.total).toBe(4)
      expect(stats.completed).toBe(1)
      expect(stats.pending).toBe(2)
      expect(stats.inProgress).toBe(1)
      
      expect(stats.byStatus).toEqual({
        TODO: 2,
        NEXT: 1,
        WAITING: 0,
        SOMEDAY: 0,
        DONE: 1,
        CANCELED: 0
      })
      
      expect(stats.byPriority).toEqual({
        A: 2,
        B: 1,
        C: 0
      })
      
      expect(stats.byContext).toEqual({
        work: 2,
        home: 2
      })
      
      expect(stats.completionRate).toBe(25) // 1 out of 4 tasks
    })

    it('should return 0 completion rate for empty task list', () => {
      const stats = calculateTaskStats([])
      expect(stats.completionRate).toBe(0)
      expect(stats.total).toBe(0)
    })
  })
})

describe('TaskValidators', () => {
  describe('isOverdue', () => {
    it('should identify overdue tasks', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const overdueTask = createMockTask({
        deadline: yesterday,
        status: 'TODO'
      })
      const futureTask = createMockTask({
        deadline: new Date('2025-12-31'),
        status: 'TODO'
      })
      const doneTask = createMockTask({
        deadline: yesterday,
        status: 'DONE'
      })
      
      expect(TaskValidators.isOverdue(overdueTask)).toBe(true)
      expect(TaskValidators.isOverdue(futureTask)).toBe(false)
      expect(TaskValidators.isOverdue(doneTask)).toBe(false)
    })
  })

  describe('hasHighPriority', () => {
    it('should identify high priority tasks', () => {
      const highPriorityTask = createMockTask({ priority: 'A' })
      const lowPriorityTask = createMockTask({ priority: 'C' })
      
      expect(TaskValidators.hasHighPriority(highPriorityTask)).toBe(true)
      expect(TaskValidators.hasHighPriority(lowPriorityTask)).toBe(false)
    })
  })

  describe('isActionable', () => {
    it('should identify actionable tasks', () => {
      const nextTask = createMockTask({ status: 'NEXT' })
      const todoTask = createMockTask({ status: 'TODO' })
      const waitingTask = createMockTask({ status: 'WAITING' })
      
      expect(TaskValidators.isActionable(nextTask)).toBe(true)
      expect(TaskValidators.isActionable(todoTask)).toBe(true)
      expect(TaskValidators.isActionable(waitingTask)).toBe(false)
    })
  })
})

describe('TaskFormatters', () => {
  describe('formatDueDate', () => {
    it('should format due date correctly', () => {
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const todayTask = createMockTask({ deadline: today })
      const tomorrowTask = createMockTask({ deadline: tomorrow })
      const yesterdayTask = createMockTask({ deadline: yesterday })
      
      expect(TaskFormatters.formatDueDate(todayTask)).toBe('Due today')
      expect(TaskFormatters.formatDueDate(tomorrowTask)).toBe('Due tomorrow')
      expect(TaskFormatters.formatDueDate(yesterdayTask)).toBe('Due yesterday')
    })
  })

  describe('formatEffort', () => {
    it('should format effort correctly', () => {
      expect(TaskFormatters.formatEffort(0.5)).toBe('30m')
      expect(TaskFormatters.formatEffort(2)).toBe('2h')
      expect(TaskFormatters.formatEffort(8)).toBe('1d')
      expect(TaskFormatters.formatEffort(16)).toBe('2d')
      expect(TaskFormatters.formatEffort()).toBe('')
    })
  })
})

describe('TaskSorters', () => {
  describe('byPriority', () => {
    it('should sort tasks by priority', () => {
      const tasks = [
        createMockTask({ id: '1', priority: 'C' }),
        createMockTask({ id: '2', priority: 'A' }),
        createMockTask({ id: '3', priority: 'B' }),
        createMockTask({ id: '4' }), // no priority
      ]
      
      const sorted = [...tasks].sort(TaskSorters.byPriority)
      expect(sorted.map((t: Task) => t.id)).toEqual(['2', '3', '1', '4'])
    })
  })

  describe('byDeadline', () => {
    it('should sort tasks by deadline', () => {
      const tasks = [
        createMockTask({ id: '1', deadline: new Date('2025-01-15') }),
        createMockTask({ id: '2', deadline: new Date('2025-01-10') }),
        createMockTask({ id: '3' }), // no deadline
        createMockTask({ id: '4', deadline: new Date('2025-01-20') }),
      ]
      
      const sorted = [...tasks].sort(TaskSorters.byDeadline)
      expect(sorted.map((t: Task) => t.id)).toEqual(['2', '1', '4', '3'])
    })
  })
})

describe('TaskSearch', () => {
  const tasks: Task[] = [
    createMockTask({ 
      id: '1', 
      title: 'Write documentation',
      description: 'Update API docs',
      tags: ['docs', 'api']
    }),
    createMockTask({ 
      id: '2', 
      title: 'Fix bug in login',
      project: 'Authentication',
      tags: ['bug', 'urgent']
    }),
    createMockTask({ 
      id: '3', 
      title: 'Review PR',
      tags: ['review']
    }),
  ]

  describe('searchTasks', () => {
    it('should search tasks by title', () => {
      const results = TaskSearch.searchTasks(tasks, 'documentation')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('1')
    })

    it('should search tasks by multiple terms', () => {
      const results = TaskSearch.searchTasks(tasks, 'bug login')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('2')
    })

    it('should search in all text fields', () => {
      const results = TaskSearch.searchTasks(tasks, 'api')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('1')
    })

    it('should return all tasks for empty query', () => {
      const results = TaskSearch.searchTasks(tasks, '')
      expect(results).toHaveLength(3)
    })
  })

  describe('searchByTags', () => {
    it('should search tasks by tags', () => {
      const results = TaskSearch.searchByTags(tasks, ['bug'])
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('2')
    })

    it('should search tasks by multiple tags', () => {
      const results = TaskSearch.searchByTags(tasks, ['docs', 'bug'])
      expect(results).toHaveLength(2)
      expect(results.map((t: Task) => t.id)).toContain('1')
      expect(results.map((t: Task) => t.id)).toContain('2')
    })

    it('should return all tasks for empty tag list', () => {
      const results = TaskSearch.searchByTags(tasks, [])
      expect(results).toHaveLength(3)
    })
  })
})