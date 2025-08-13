import { Task, Project, TaskStatus, Priority, Context } from '../../types'

/**
 * Base interface for all task stores
 * Contains common state and methods to eliminate duplication
 */
export interface BaseTaskStoreState {
  tasks: Task[]
  projects: Project[]
  loading: boolean
  error: string | null
  lastSync: Date | null
}

/**
 * Common task statistics interface
 */
export interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  inProgress: number
  byPriority: Record<'A' | 'B' | 'C', number>
  byContext: Record<'work' | 'home', number>
  completionRate: number
}

/**
 * Project statistics interface
 */
export interface ProjectStats {
  projectId: string
  projectTitle: string
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  completionPercentage: number
  lastModified: Date
  status: 'ACTIVE' | 'SOMEDAY' | 'COMPLETED' | 'ARCHIVED'
  priority: Priority
}

/**
 * Base store methods that all task stores will share
 */
export interface BaseTaskStoreMethods {
  // State setters
  setTasks: (tasks: Task[]) => void
  setProjects: (projects: Project[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Task operations
  addTask: (task: Omit<Task, 'id'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  
  // Selectors
  getTasksByStatus: (status: TaskStatus) => Task[]
  getTasksByProject: (projectId: string) => Task[]
  getOverdueTasks: () => Task[]
  getTasksByPriority: (priority: Priority) => Task[]
  getTodaysTasks: () => Task[]
  getScheduledTasksForDate: (date: Date) => Task[]
  getTaskStats: () => TaskStats
  
  // Project-related methods
  getProjects: () => Project[]
  getProjectStats: (projectId: string) => ProjectStats | null
  getAllProjectStats: () => ProjectStats[]
  getProjectOverallStats: () => { totalProjects: number; overallCompletionRate: number; totalOverdueTasks: number }
  
  // Sync operations
  syncData: () => Promise<void>
  reset: () => void
  initialize: () => Promise<void>
}

/**
 * Complete base store interface
 */
export type BaseTaskStore = BaseTaskStoreState & BaseTaskStoreMethods

/**
 * Create base store implementation with all common logic
 */
export function createBaseStoreImplementation<T extends BaseTaskStore>(
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
  get: () => T,
  context?: Context
): BaseTaskStoreMethods {
  return {
    // State setters
    setTasks: (tasks: Task[]) => set({ tasks, lastSync: new Date() } as Partial<T>),
    
    setProjects: (projects: Project[]) => set({ projects } as Partial<T>),
    
    setLoading: (loading: boolean) => set({ loading } as Partial<T>),
    
    setError: (error: string | null) => set({ error } as Partial<T>),
    
    // Task operations
    addTask: (taskData: Omit<Task, 'id'>) => {
      const newTask: Task = {
        ...taskData,
        id: `${context || 'task'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created: new Date(),
        modified: new Date(),
        ...(context && { context }) // Only add context if provided
      }
      set((state: T) => ({ 
        tasks: [...state.tasks, newTask] 
      } as Partial<T>))
    },
    
    updateTask: (id: string, updates: Partial<Task>) => {
      set((state: T) => ({
        tasks: state.tasks.map((task: Task) =>
          task.id === id
            ? { 
                ...task, 
                ...updates, 
                modified: new Date(),
                ...(context && { context }) // Preserve context if provided
              }
            : task
        )
      } as Partial<T>))
    },
    
    deleteTask: (id: string) => {
      set((state: T) => ({
        tasks: state.tasks.filter((task: Task) => task.id !== id)
      } as Partial<T>))
    },
    
    // Common selectors
    getTasksByStatus: (status: TaskStatus): Task[] => {
      return get().tasks.filter((task: Task) => task.status === status)
    },
    
    getTasksByProject: (projectId: string): Task[] => {
      return get().tasks.filter((task: Task) => task.project === projectId)
    },
    
    getOverdueTasks: (): Task[] => {
      const now = new Date()
      return get().tasks.filter((task: Task) => {
        if (!task.deadline || task.status === 'DONE' || task.status === 'CANCELED') {
          return false
        }
        return new Date(task.deadline) < now
      })
    },
    
    getTasksByPriority: (priority: Priority): Task[] => {
      return get().tasks.filter((task: Task) => task.priority === priority)
    },
    
    getTodaysTasks: (): Task[] => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      return get().tasks.filter((task: Task) => {
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
    },
    
    getScheduledTasksForDate: (date: Date): Task[] => {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      return get().tasks.filter((task: Task) => {
        if (task.scheduled) {
          const scheduledDate = new Date(task.scheduled)
          return scheduledDate >= startOfDay && scheduledDate <= endOfDay
        }
        // Also include tasks due on this date if they don't have a scheduled time
        if (!task.scheduled && task.deadline) {
          const dueDate = new Date(task.deadline)
          return dueDate >= startOfDay && dueDate <= endOfDay
        }
        return false
      })
    },
    
    getTaskStats: (): TaskStats => {
      const tasks = get().tasks
      const total = tasks.length
      const completed = tasks.filter((t: Task) => t.status === 'DONE').length
      const pending = tasks.filter((t: Task) => t.status === 'TODO').length
      const inProgress = tasks.filter((t: Task) =>
        t.status === 'NEXT' || t.status === 'WAITING'
      ).length
      
      const baseStore = get() as unknown as BaseTaskStore
      const overdue = baseStore.getOverdueTasks ? baseStore.getOverdueTasks().length : 0
      
      const byPriority: Record<'A' | 'B' | 'C', number> = {
        A: tasks.filter((t: Task) => t.priority === 'A').length,
        B: tasks.filter((t: Task) => t.priority === 'B').length,
        C: tasks.filter((t: Task) => t.priority === 'C').length
      }
      
      const byContext: Record<'work' | 'home', number> = {
        work: tasks.filter((t: Task) => t.context === 'work').length,
        home: tasks.filter((t: Task) => t.context === 'home').length
      }
      
      const completionRate = total > 0 ? (completed / total) * 100 : 0
      
      return {
        total,
        completed,
        pending,
        overdue,
        inProgress,
        byPriority,
        byContext,
        completionRate
      }
    },
    
    // Project-related methods
    getProjects: (): Project[] => {
      return get().projects
    },
    
    getProjectStats: (projectId: string): ProjectStats | null => {
      const project = get().projects.find(p => p.id === projectId || p.title === projectId)
      if (!project) return null
      
      const tasks = get().tasks.filter(t => t.project === project.title)
      const completedTasks = tasks.filter(t => t.status === 'DONE').length
      const overdueTasks = tasks.filter(t => {
        if (!t.deadline || t.status === 'DONE' || t.status === 'CANCELED') {
          return false
        }
        return new Date(t.deadline) < new Date()
      }).length
      
      const lastModified = tasks.reduce((latest, task) => {
        const taskModified = new Date(task.modified)
        return taskModified > latest ? taskModified : latest
      }, project.modified)
      
      return {
        projectId: project.id,
        projectTitle: project.title,
        totalTasks: tasks.length,
        completedTasks,
        overdueTasks,
        completionPercentage: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0,
        lastModified,
        status: project.status,
        priority: project.priority
      }
    },
    
    getAllProjectStats: (): ProjectStats[] => {
      const projects = get().projects
      return projects.map(project => {
        const stats = get().getProjectStats(project.title)
        return stats!
      }).filter(Boolean)
    },
    
    getProjectOverallStats: () => {
      const allStats = get().getAllProjectStats()
      const totalProjects = allStats.length
      const totalOverdueTasks = allStats.reduce((sum, stat) => sum + stat.overdueTasks, 0)
      
      const totalTasks = allStats.reduce((sum, stat) => sum + stat.totalTasks, 0)
      const totalCompleted = allStats.reduce((sum, stat) => sum + stat.completedTasks, 0)
      const overallCompletionRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0
      
      return {
        totalProjects,
        overallCompletionRate,
        totalOverdueTasks
      }
    },
    
    // Sync operations (to be overridden by specific implementations)
    syncData: async () => {
      const store = get()
      store.setLoading(true)
      store.setError(null)
      
      try {
        // Context-specific sync logic should be implemented in derived stores
        const endpoint = context ? `/api/files/list?context=${context}` : '/api/files/list'
        const response = await fetch(endpoint)
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch org files')
        }
        
        // Parse org files and extract tasks/projects
        const allTasks: Task[] = []
        const allProjects: Project[] = []
        
        for (const file of result.data.files) {
          // Filter by context if provided
          if (context && file.context !== context) continue
          
          try {
            const fileResponse = await fetch('/api/files/read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filePath: file.path })
            })
            
            const fileResult = await fileResponse.json()
            if (fileResult.success) {
              const { tasks, projects } = fileResult.data.parsed
              
              // Filter by context if needed
              if (context) {
                allTasks.push(...tasks.filter((task: Task) => task.context === context))
                allProjects.push(...projects.filter((project: Project) => project.context === context))
              } else {
                allTasks.push(...tasks)
                allProjects.push(...projects)
              }
            }
          } catch (error) {
            // Failed to parse file
          }
        }
        
        store.setTasks(allTasks)
        store.setProjects(allProjects)
      } catch (error) {
        store.setError(error instanceof Error ? error.message : 'Unknown error occurred')
      } finally {
        store.setLoading(false)
      }
    },
    
    reset: () => {
      set((state: T) => ({
        ...state,
        tasks: [],
        projects: [],
        loading: false,
        error: null,
        lastSync: null
      }))
    },
    
    initialize: async () => {
      const store = get()
      await store.syncData()
    }
  }
}

/**
 * Initial state factory for task stores
 */
export function createInitialState(): BaseTaskStoreState {
  return {
    tasks: [],
    projects: [],
    loading: false,
    error: null,
    lastSync: null
  }
}