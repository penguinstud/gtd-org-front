import { useAppStore } from './appStore'
import { useWorkStore } from './workStore'
import { useHomeStore } from './homeStore'
import { BaseTaskStore } from './base/BaseTaskStore'
import { ContextTaskStats } from './contextStore'

/**
 * Context-aware task store that dynamically delegates to work or home store
 * This provides a unified interface for components to use without worrying about context
 */

export type TaskStore = BaseTaskStore
export type TaskStats = ContextTaskStats

/**
 * Hook that returns the appropriate store based on current context
 * This allows pages to use a single useTaskStore() hook that automatically
 * switches between work and home stores
 */
export const useTaskStore = () => {
  // Get current context from app store
  const currentContext = useAppStore((state) => state.currentContext)
  
  // Select the appropriate store based on context
  const workStore = useWorkStore()
  const homeStore = useHomeStore()
  
  // Return the store for the current context
  return currentContext === 'work' ? workStore : homeStore
}