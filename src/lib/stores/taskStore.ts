import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { Task, Project, Context, TaskStatus, Priority } from '../types'

export interface TaskStore {
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
  
  // Computed values
  getTasksByContext: (context: Context) => Task[]
  getTasksByStatus: (status: TaskStatus) => Task[]
  getTasksByProject: (projectId: string) => Task[]
  getOverdueTasks: () => Task[]
  getTasksByPriority: (priority: Priority) => Task[]
  getTodaysTasks: () => Task[]
  getTaskStats: () => TaskStats
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  inProgress: number
  byContext: Record<Context, number>
  byPriority: Record<'A' | 'B' | 'C', number>
  completionRate: number
}

export const useTaskStore = create<TaskStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      tasks: [],
      projects: [],
      loading: false,
      error: null,
      lastSync: null,

      // Actions
      setTasks: (tasks) => set({ tasks, lastSync: new Date() }),
      
      addTask: (taskData) => {
        const newTask: Task = {
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...taskData,
          created: taskData.created || new Date(),
          modified: taskData.modified || new Date()
        }
        set((state) => ({ tasks: [...state.tasks, newTask] }))
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          )
        }))
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id)
        }))
      },

      setProjects: (projects) => set({ projects }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      syncData: async () => {
        const { setLoading, setError, setTasks, setProjects } = get()
        
        try {
          setLoading(true)
          setError(null)

          // Fetch org files data
          const response = await fetch('/api/files/list')
          const result = await response.json()

          if (!result.success) {
            throw new Error(result.error || 'Failed to fetch org files')
          }

          // Parse org files and extract tasks/projects
          const allTasks: Task[] = []
          const allProjects: Project[] = []

          for (const file of result.data.files) {
            try {
              const fileResponse = await fetch('/api/files/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: file.path })
              })

              const fileResult = await fileResponse.json()
              if (fileResult.success) {
                const { tasks, projects } = fileResult.data.parsed
                allTasks.push(...tasks)
                allProjects.push(...projects)
              }
            } catch (error) {
              console.warn(`Failed to parse file ${file.path}:`, error)
            }
          }

          setTasks(allTasks)
          setProjects(allProjects)
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error occurred')
        } finally {
          setLoading(false)
        }
      },

      // Computed selectors
      getTasksByContext: (context) => {
        return get().tasks.filter((task) => task.context === context)
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status)
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter((task) => task.project === projectId)
      },

      getOverdueTasks: () => {
        const now = new Date()
        return get().tasks.filter((task) => {
          if (!task.deadline || task.status === 'DONE' || task.status === 'CANCELED') {
            return false
          }
          return new Date(task.deadline) < now
        })
      },

      getTasksByPriority: (priority) => {
        return get().tasks.filter((task) => task.priority === priority)
      },

      getTodaysTasks: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        return get().tasks.filter((task) => {
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

      getTaskStats: (): TaskStats => {
        const tasks = get().tasks
        const total = tasks.length
        const completed = tasks.filter(t => t.status === 'DONE').length
        const pending = tasks.filter(t => t.status === 'TODO').length
        const inProgress = tasks.filter(t => t.status === 'NEXT' || t.status === 'WAITING').length
        const overdue = get().getOverdueTasks().length

        const byContext: Record<Context, number> = {
          work: tasks.filter(t => t.context === 'work').length,
          home: tasks.filter(t => t.context === 'home').length
        }

        const byPriority: Record<'A' | 'B' | 'C', number> = {
          A: tasks.filter(t => t.priority === 'A').length,
          B: tasks.filter(t => t.priority === 'B').length,
          C: tasks.filter(t => t.priority === 'C').length
        }

        const completionRate = total > 0 ? (completed / total) * 100 : 0

        return {
          total,
          completed,
          pending,
          overdue,
          inProgress,
          byContext,
          byPriority,
          completionRate
        }
      }
    })),
    { name: 'task-store' }
  )
)

// Auto-sync on store creation
useTaskStore.getState().syncData()