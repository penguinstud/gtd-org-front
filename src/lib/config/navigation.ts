/**
 * Navigation configuration for the GTD application
 * Centralized configuration eliminates duplication and makes the navigation data-driven
 */

export interface NavigationItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: {
    count: number
    variant: string
  }
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/dashboard'
  },
  {
    id: 'daily',
    label: 'Daily',
    icon: '📅',
    path: '/daily'
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: '📥',
    path: '/inbox',
    badge: {
      count: 0, // Will be populated dynamically from store
      variant: 'progress'
    }
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: '📁',
    path: '/projects'
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: '✅',
    path: '/tasks'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    path: '/settings'
  }
]

/**
 * Quick action configurations for dashboard and navigation
 */
export const QUICK_ACTIONS = [
  {
    id: 'add-task',
    label: 'Add Task',
    icon: '📝',
    action: 'quickCapture',
    shortcut: 'Ctrl+N'
  },
  {
    id: 'process-inbox',
    label: 'Process Inbox',
    icon: '📥',
    action: 'processInbox',
    shortcut: 'Ctrl+I'
  },
  {
    id: 'view-projects',
    label: 'View Projects',
    icon: '📊',
    action: 'navigate',
    path: '/projects',
    shortcut: 'Ctrl+P'
  },
  {
    id: 'daily-plan',
    label: 'Daily Plan',
    icon: '📅',
    action: 'navigate',
    path: '/daily',
    shortcut: 'Ctrl+D'
  }
]

/**
 * Context-specific configurations
 */
export const CONTEXT_CONFIG = {
  work: {
    label: 'Work Context',
    icon: '💼',
    variant: 'progress' as const,
    primaryColor: 'blue'
  },
  home: {
    label: 'Home Context', 
    icon: '🏠',
    variant: 'planning' as const,
    primaryColor: 'purple'
  }
} as const

/**
 * Dashboard section configurations
 */
export const DASHBOARD_SECTIONS = [
  {
    id: 'header',
    component: 'DashboardHeader',
    priority: 1
  },
  {
    id: 'kpis',
    component: 'DashboardKPIs',
    priority: 2,
    lazy: false
  },
  {
    id: 'stats',
    component: 'DashboardStats',
    priority: 3,
    lazy: true
  },
  {
    id: 'tasks',
    component: 'DashboardTasks',
    priority: 4,
    lazy: true
  },
  {
    id: 'actions',
    component: 'DashboardActions',
    priority: 5,
    lazy: false
  }
]

/**
 * Performance thresholds for monitoring
 */
export const PERFORMANCE_THRESHOLDS = {
  componentRenderTime: 16, // ms - target 60fps
  dataFetchTime: 1000, // ms
  largeListItems: 100, // threshold for virtualization
  memoryUsage: 50 * 1024 * 1024, // 50MB
  bundleSize: 500 * 1024 // 500KB per chunk
}