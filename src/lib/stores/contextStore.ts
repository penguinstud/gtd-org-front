import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { Task, Project, Context, TaskStatus, Priority } from '../types'

/**
 * Base interface for context-specific stores
 */
export interface BaseContextStore {
  // State
  tasks: Task[]
  projects: Project[]
  loading: boolean
  error: string | null
  lastSync: Date | null
  
  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Omit<Task, 'id'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setProjects: (projects: Project[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  syncData: () => Promise<void>
  
  // Computed selectors
  getTasksByStatus: (status: TaskStatus) => Task[]
  getTasksByProject: (projectId: string) => Task[]
  getOverdueTasks: () => Task[]
  getTasksByPriority: (priority: Priority) => Task[]
  getTodaysTasks: () => Task[]
  getTaskStats: () => ContextTaskStats
  
  // Context-specific methods
  reset: () => void
  initialize: () => Promise<void>
}

export interface ContextTaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  inProgress: number
  byPriority: Record<'A' | 'B' | 'C', number>
  completionRate: number
}

/**
 * Context Manager Store - manages active context and store selection
 */
export interface ContextManagerStore {
  currentContext: Context
  activeStore: BaseContextStore | null
  
  // Context switching
  switchContext: (context: Context) => void
  getWorkStore: () => BaseContextStore
  getHomeStore: () => BaseContextStore
  getCurrentStore: () => BaseContextStore
  
  // Global operations
  syncAllContexts: () => Promise<void>
  resetAllContexts: () => void
}

/**
 * Factory function to create context-specific stores
 */
export function createContextStore(context: Context) {
  return create<BaseContextStore>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        // Initial state
        tasks: [],
        projects: [],
        loading: false,
        error: null,
        lastSync: null,

        // Actions
        setTasks: (tasks: Task[]) => set({ tasks, lastSync: new Date() }),
        
        addTask: (taskData: Omit<Task, 'id'>) => {
          const newTask: Task = {
            ...taskData,
            id: `${context}_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            created: new Date(),
            modified: new Date(),
            context // Enforce context to override any passed context
          }
          set((state: BaseContextStore) => ({ tasks: [...state.tasks, newTask] }))
        },

        updateTask: (id: string, updates: Partial<Task>) => {
          set((state: BaseContextStore) => ({
            tasks: state.tasks.map((task: Task) =>
              task.id === id
                ? { ...task, ...updates, modified: new Date(), context } // Preserve context
                : task
            )
          }))
        },

        deleteTask: (id: string) => {
          set((state: BaseContextStore) => ({
            tasks: state.tasks.filter((task: Task) => task.id !== id)
          }))
        },

        setProjects: (projects: Project[]) => set({ projects }),
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),

        syncData: async () => {
          const { setLoading, setError, setTasks, setProjects } = get()
          
          try {
            setLoading(true)
            setError(null)

            // Fetch context-specific org files
            const response = await fetch(`/api/files/list?context=${context}`)
            const result = await response.json()

            if (!result.success) {
              throw new Error(result.error || `Failed to fetch ${context} org files`)
            }

            // Parse org files and extract tasks/projects for this context only
            const allTasks: Task[] = []
            const allProjects: Project[] = []

            for (const file of result.data.files) {
              // Only process files that belong to this context
              if (file.context !== context) continue

              try {
                const fileResponse = await fetch('/api/files/read', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ filePath: file.path })
                })

                const fileResult = await fileResponse.json()
                if (fileResult.success) {
                  const { tasks, projects } = fileResult.data.parsed
                  // Double-check context isolation
                  allTasks.push(...tasks.filter((task: Task) => task.context === context))
                  allProjects.push(...projects.filter((project: Project) => project.context === context))
                }
              } catch (error) {
                // Silently skip files that fail to parse
                // TODO: Consider adding proper error logging mechanism
              }
            }

            setTasks(allTasks)
            setProjects(allProjects)
          } catch (error) {
            setError(error instanceof Error ? error.message : `Unknown error in ${context} context`)
          } finally {
            setLoading(false)
          }
        },

        // Computed selectors
        getTasksByStatus: (status: TaskStatus) => {
          return get().tasks.filter((task: Task) => task.status === status)
        },

        getTasksByProject: (projectId: string) => {
          return get().tasks.filter((task: Task) => task.project === projectId)
        },

        getOverdueTasks: () => {
          const now = new Date()
          return get().tasks.filter((task: Task) => {
            if (!task.deadline || task.status === 'DONE' || task.status === 'CANCELED') {
              return false
            }
            return new Date(task.deadline) < now
          })
        },

        getTasksByPriority: (priority: Priority) => {
          return get().tasks.filter((task: Task) => task.priority === priority)
        },

        getTodaysTasks: () => {
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

        getTaskStats: (): ContextTaskStats => {
          const tasks = get().tasks
          const total = tasks.length
          const completed = tasks.filter((t: Task) => t.status === 'DONE').length
          const pending = tasks.filter((t: Task) => t.status === 'TODO').length
          const inProgress = tasks.filter((t: Task) => t.status === 'NEXT' || t.status === 'WAITING').length
          const overdue = get().getOverdueTasks().length

          const byPriority: Record<'A' | 'B' | 'C', number> = {
            A: tasks.filter((t: Task) => t.priority === 'A').length,
            B: tasks.filter((t: Task) => t.priority === 'B').length,
            C: tasks.filter((t: Task) => t.priority === 'C').length
          }

          const completionRate = total > 0 ? (completed / total) * 100 : 0

          return {
            total,
            completed,
            pending,
            overdue,
            inProgress,
            byPriority,
            completionRate
          }
        },

        // Context-specific methods
        reset: () => {
          set({
            tasks: [],
            projects: [],
            loading: false,
            error: null,
            lastSync: null
          })
        },

        initialize: async () => {
          const { syncData } = get()
          await syncData()
        }
      })),
      { name: `${context}-store` }
    )
  )
}