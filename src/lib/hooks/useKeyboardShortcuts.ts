import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  handler: () => void
  description?: string
}

/**
 * Custom hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : true
      const metaMatch = shortcut.metaKey ? event.metaKey : true
      const shiftMatch = shortcut.shiftKey ? event.shiftKey : true
      const altMatch = shortcut.altKey ? event.altKey : true

      // For cross-platform support, treat Cmd (Mac) and Ctrl (Windows/Linux) as equivalent
      const modifierMatch = shortcut.ctrlKey || shortcut.metaKey
        ? (event.ctrlKey || event.metaKey)
        : (ctrlMatch && metaMatch)

      return keyMatch && modifierMatch && shiftMatch && altMatch
    })

    if (matchingShortcut) {
      event.preventDefault()
      event.stopPropagation()
      matchingShortcut.handler()
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Hook for setting up global keyboard shortcuts in the app
 */
export function useGlobalShortcuts(handlers: {
  onSearch?: () => void
  onNewTask?: () => void
  onNavigateInbox?: () => void
  onNavigateDaily?: () => void
  onNavigateProjects?: () => void
  onNavigateTasks?: () => void
  onContextSwitch?: () => void
}) {
  const shortcuts: KeyboardShortcut[] = []

  if (handlers.onSearch) {
    shortcuts.push({
      ...globalShortcuts.search,
      handler: handlers.onSearch
    })
  }

  if (handlers.onNewTask) {
    shortcuts.push({
      ...globalShortcuts.newTask,
      handler: handlers.onNewTask
    })
  }

  if (handlers.onNavigateInbox) {
    shortcuts.push({
      ...globalShortcuts.inbox,
      handler: handlers.onNavigateInbox
    })
  }

  if (handlers.onNavigateDaily) {
    shortcuts.push({
      ...globalShortcuts.daily,
      handler: handlers.onNavigateDaily
    })
  }

  if (handlers.onNavigateProjects) {
    shortcuts.push({
      ...globalShortcuts.projects,
      handler: handlers.onNavigateProjects
    })
  }

  if (handlers.onNavigateTasks) {
    shortcuts.push({
      ...globalShortcuts.tasks,
      handler: handlers.onNavigateTasks
    })
  }

  if (handlers.onContextSwitch) {
    shortcuts.push({
      ...globalShortcuts.contextSwitch,
      handler: handlers.onContextSwitch
    })
  }

  useKeyboardShortcuts(shortcuts)
}

/**
 * Global keyboard shortcuts used across the application
 */
export const globalShortcuts = {
  search: {
    key: 'k',
    ctrlKey: true,
    metaKey: true,
    description: 'Open search'
  },
  newTask: {
    key: 'n',
    ctrlKey: true,
    metaKey: true,
    description: 'Create new task'
  },
  inbox: {
    key: 'i',
    ctrlKey: true,
    metaKey: true,
    description: 'Go to inbox'
  },
  daily: {
    key: 'd',
    ctrlKey: true,
    metaKey: true,
    description: 'Go to daily view'
  },
  projects: {
    key: 'p',
    ctrlKey: true,
    metaKey: true,
    description: 'Go to projects'
  },
  tasks: {
    key: 't',
    ctrlKey: true,
    metaKey: true,
    description: 'Go to tasks'
  },
  contextSwitch: {
    key: '\\',
    ctrlKey: true,
    metaKey: true,
    description: 'Switch context'
  }
}