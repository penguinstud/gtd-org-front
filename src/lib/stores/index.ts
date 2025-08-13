/**
 * Centralized store exports for GTD Org Front
 * Provides access to all Zustand stores used in the application
 */

export { useAppStore } from './appStore'

// Context-isolated stores
export { useWorkStore } from './workStore'
export { useHomeStore } from './homeStore'
export { createContextStore, type BaseContextStore, type ContextTaskStats } from './contextStore'

// Context-aware task store
export { useTaskStore, type TaskStore, type TaskStats } from './taskStore'

// Export store types for TypeScript
export type { Task, Project, Context, TaskStatus, Priority } from '../types'

// Export ProjectStats from BaseTaskStore
export type { ProjectStats } from './base/BaseTaskStore'