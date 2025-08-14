import React, { useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Link from 'next/link'
import '../styles/globals.css'
import '../styles/design-tokens.css'
import { PremiumTopNav } from '../components/organisms/PremiumTopNav'
import { TaskCreationModal } from '../components/organisms/TaskCreationModal'
import { Badge } from '../components/atoms/Badge'
import { Button } from '../components/atoms/Button'
import { cn } from '../lib/utils/cn'
import { useAppStore, useTaskStore } from '../lib/stores'
import { NAVIGATION_ITEMS } from '../lib/config/navigation'
import { useGlobalShortcuts } from '../lib/hooks/useKeyboardShortcuts'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { currentContext, toggleContext, user } = useAppStore()
  const { tasks, initialize } = useTaskStore()
  const [mounted, setMounted] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Initialize stores on mount and apply theme
  useEffect(() => {
    setMounted(true)
    initialize()
    
    // Apply theme from user preferences
    if (user?.preferences?.theme) {
      const theme = user.preferences.theme
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', prefersDark)
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark')
      }
    }
  }, [initialize, user?.preferences?.theme])

  // Set up global keyboard shortcuts
  useGlobalShortcuts({
    onSearch: () => setIsSearchOpen(true),
    onNewTask: () => setIsTaskModalOpen(true),
    onNavigateInbox: () => router.push('/inbox'),
    onNavigateDaily: () => router.push('/daily'),
    onNavigateProjects: () => router.push('/projects'),
    onNavigateTasks: () => router.push('/tasks'),
    onContextSwitch: () => toggleContext()
  })

  // Get inbox count for badge
  const inboxCount = tasks.filter(task =>
    task.context === currentContext &&
    (!task.project || (task.status === 'TODO' && !task.scheduled))
  ).length

  // Don't render navigation until client-side hydration is complete
  if (!mounted) {
    return <Component {...pageProps} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <PremiumTopNav
        currentContext={currentContext}
        onContextSwitch={toggleContext}
        user={{ name: user?.name || 'User' }}
        onNewTask={() => setIsTaskModalOpen(true)}
      />
      
      {/* Main Layout */}
      <div className="flex">
        {/* Side Navigation */}
        <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-4">
            <ul className="space-y-1">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = router.pathname === item.path
                const showBadge = item.id === 'inbox' && inboxCount > 0
                
                return (
                  <li key={item.id}>
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {showBadge && (
                        <Badge variant="progress" size="sm">
                          {inboxCount}
                        </Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
        
        {/* Page Content */}
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
      </div>

      {/* Global Task Creation Modal */}
      <TaskCreationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      {/* Quick Action Button (mobile/tablet) */}
      <Button
        variant="primary"
        size="lg"
        onClick={() => setIsTaskModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full w-14 h-14 flex items-center justify-center md:hidden"
        aria-label="Create new task"
      >
        +
      </Button>
    </div>
  )
}