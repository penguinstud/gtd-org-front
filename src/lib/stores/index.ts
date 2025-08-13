/**
 * Centralized store exports for GTD Org Front
 * Provides access to all Zustand stores used in the application
 */

export { useTaskStore, type TaskStore, type TaskStats } from './taskStore'
export { useAppStore } from './appStore'

// New context-isolated stores
export { useWorkStore } from './workStore'
export { useHomeStore } from './homeStore'
export { createContextStore, type BaseContextStore, type ContextTaskStats } from './contextStore'

// Export store types for TypeScript
export type { Task, Project, Context, TaskStatus, Priority } from '../types'