import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Handles conditional classes and deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate status-based CSS classes
 */
export function getStatusStyles(status: string) {
  const statusMap = {
    success: 'bg-status-success text-white',
    done: 'bg-status-success text-white',
    progress: 'bg-status-progress text-gray-800',
    next: 'bg-status-next text-white',
    waiting: 'bg-status-progress text-gray-800',
    blocked: 'bg-status-blocked text-white',
    canceled: 'bg-status-blocked text-white',
    planning: 'bg-status-planning text-white',
    someday: 'bg-status-planning text-white',
    todo: 'bg-gray-200 text-gray-700',
  }
  return statusMap[status as keyof typeof statusMap] || 'bg-gray-200 text-gray-700'
}

/**
 * Generate priority-based CSS classes
 */
export function getPriorityStyles(priority: string | null) {
  if (!priority) return 'border-l-gray-300'
  
  const priorityMap = {
    A: 'border-l-priority-high',
    high: 'border-l-priority-high',
    B: 'border-l-priority-medium', 
    medium: 'border-l-priority-medium',
    C: 'border-l-priority-low',
    low: 'border-l-priority-low',
  }
  return priorityMap[priority as keyof typeof priorityMap] || 'border-l-gray-300'
}

/**
 * Generate context-based CSS classes
 */
export function getContextStyles(context: string) {
  const contextMap = {
    work: 'bg-context-work text-white',
    home: 'bg-context-home text-white',
  }
  return contextMap[context as keyof typeof contextMap] || 'bg-gray-500 text-white'
}