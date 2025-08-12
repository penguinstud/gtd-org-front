// Core GTD Types for the application

export type TaskStatus = 'TODO' | 'NEXT' | 'WAITING' | 'SOMEDAY' | 'DONE' | 'CANCELED'
export type Priority = 'A' | 'B' | 'C' | null
export type Context = 'work' | 'home'

// Shopping-specific statuses for home context
export type ShoppingStatus = 'BUY' | 'RESEARCH' | 'BOUGHT' | 'RETURNED'

// Learning-specific statuses for home context  
export type LearningStatus = 'LEARN' | 'PRACTICE' | 'MASTERED' | 'PAUSED'

// Health activity types
export type HealthActivityType = 'Exercise' | 'Meal' | 'Sleep' | 'Medical' | 'Wellness'

// Expense categories for budget tracking
export type ExpenseCategory = 
  | 'Groceries' 
  | 'Utilities' 
  | 'Entertainment' 
  | 'Transport' 
  | 'Health' 
  | 'Shopping' 
  | 'Dining' 
  | 'Other'

// Journal mood types
export type JournalMood = '😊' | '😐' | '😔' | '😴' | '🤔' | '😤'

// Base task interface
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  project?: string
  context: Context
  scheduled?: Date
  deadline?: Date
  effort?: number // hours
  cost?: number // for home context
  area?: string // for home context (Finance, Health, Learning, etc.)
  tags: string[]
  properties: Record<string, any>
  created: Date
  modified: Date
  completedAt?: Date
}

// Project interface
export interface Project {
  id: string
  title: string
  description?: string
  status: 'ACTIVE' | 'SOMEDAY' | 'COMPLETED' | 'ARCHIVED'
  context: Context
  tasks: Task[]
  area?: string
  priority: Priority
  created: Date
  modified: Date
  completedAt?: Date
}

// Shopping item (extends Task)
export interface ShoppingItem extends Omit<Task, 'status'> {
  status: ShoppingStatus
  price?: number
  store?: string
  category?: ExpenseCategory
}

// Learning item (extends Task)
export interface LearningItem extends Omit<Task, 'status'> {
  status: LearningStatus
  topic: string
  source?: string
  progress?: number // percentage 0-100
}

// Health activity
export interface HealthActivity {
  id: string
  type: HealthActivityType
  title: string
  description?: string
  duration?: number // minutes
  date: Date
  properties?: Record<string, any>
}

// Expense entry
export interface Expense {
  id: string
  amount: number
  description: string
  category: ExpenseCategory
  date: Date
  tags?: string[]
  receipt?: string // file path or URL
}

// Journal entry
export interface JournalEntry {
  id: string
  title?: string
  content: string
  mood?: JournalMood
  date: Date
  tags?: string[]
}

// Meeting entry
export interface Meeting {
  id: string
  title: string
  description?: string
  participants: string[]
  date: Date
  duration?: number // minutes
  location?: string
  notes?: string
  actionItems?: Task[]
}

// File structure for org-mode integration
export interface OrgFile {
  path: string
  name: string
  context: Context
  lastModified: Date
  content?: string
}

// Board configuration
export interface BoardConfig {
  id: string
  name: string
  context: Context
  columns: BoardColumn[]
  filters?: FilterConfig
  sorting?: SortConfig
}

export interface BoardColumn {
  id: string
  title: string
  status: TaskStatus[]
  color?: string
  limit?: number // WIP limit
}

// Filter and sorting
export interface FilterConfig {
  projects?: string[]
  priorities?: Priority[]
  tags?: string[]
  areas?: string[]
  dateRange?: {
    start?: Date
    end?: Date
  }
}

export interface SortConfig {
  field: 'created' | 'modified' | 'scheduled' | 'deadline' | 'priority' | 'title'
  direction: 'asc' | 'desc'
}

// Application state interfaces
export interface AppState {
  currentContext: Context
  user?: User
  settings: AppSettings
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  preferences: UserPreferences
}

export interface UserPreferences {
  defaultContext: Context
  theme: 'light' | 'dark' | 'system'
  enableAnimations: boolean
  notifications: {
    deadlines: boolean
    dailyReview: boolean
    weeklyReview: boolean
  }
  orgPaths: {
    workDir: string
    homeDir: string
  }
}

export interface AppSettings {
  enableFileWatching: boolean
  autoBackup: boolean
  backupRetentionDays: number
  syncInterval: number // minutes
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface TaskFormData {
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  project?: string
  scheduled?: Date
  deadline?: Date
  effort?: number
  cost?: number
  area?: string
  tags: string[]
}

export interface ProjectFormData {
  title: string
  description?: string
  area?: string
  priority: Priority
}

export interface ExpenseFormData {
  amount: number
  description: string
  category: ExpenseCategory
  date: Date
  tags?: string[]
}

// Chart and analytics types
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
  }[]
}

export interface DashboardStats {
  totalTasks: number
  nextActions: number
  dueToday: number
  completionRate: number
  tasksThisWeek: number
  tasksCompleted: number
  averageCompletionTime?: number // days
}

export interface BudgetStats {
  totalSpent: number
  budgetLimit: number
  remaining: number
  categoryBreakdown: Record<ExpenseCategory, number>
  monthlyTrend: {
    month: string
    amount: number
  }[]
}

// Drag and drop types
export interface DragItem {
  id: string
  type: 'task' | 'project'
  status: TaskStatus
  sourceColumn: string
}

export interface DropResult {
  draggedId: string
  destination: {
    columnId: string
    status: TaskStatus
    index: number
  }
}

// Search and filtering
export interface SearchResult {
  type: 'task' | 'project' | 'note' | 'meeting'
  id: string
  title: string
  description?: string
  context: Context
  relevance: number
}

export interface QuickCaptureData {
  type: 'task' | 'expense' | 'journal' | 'health' | 'learning' | 'meeting'
  content: string
  context: Context
  metadata?: Record<string, any>
}

// Integration types
export interface OrgModeSync {
  enabled: boolean
  lastSync: Date
  conflicts: string[]
  status: 'idle' | 'syncing' | 'error'
}

export interface BackupInfo {
  id: string
  timestamp: Date
  type: 'manual' | 'automatic'
  size: number
  files: string[]
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Event types for real-time updates
export type AppEvent = 
  | { type: 'TASK_CREATED'; payload: Task }
  | { type: 'TASK_UPDATED'; payload: Task }
  | { type: 'TASK_DELETED'; payload: string }
  | { type: 'PROJECT_CREATED'; payload: Project }
  | { type: 'PROJECT_UPDATED'; payload: Project }
  | { type: 'CONTEXT_SWITCHED'; payload: Context }
  | { type: 'SYNC_STARTED'; payload: {} }
  | { type: 'SYNC_COMPLETED'; payload: {} }
  | { type: 'SYNC_ERROR'; payload: { error: string } }