import React, { useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import '../styles/design-tokens.css'
import { PremiumTopNav, TaskCreationModal, ThemeProvider, SideNavigation } from '../components/organisms'
import { Button } from '../components/atoms/Button'
import { useAppStore, useTaskStore } from '../lib/stores'
import { useGlobalShortcuts } from '../lib/hooks/useKeyboardShortcuts'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { currentContext, toggleContext, user } = useAppStore()
  const { tasks, initialize } = useTaskStore()
  const [mounted, setMounted] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  // Initialize stores on mount
  useEffect(() => {
    setMounted(true)
    initialize()
  }, [initialize])

  // Set up global keyboard shortcuts
  useGlobalShortcuts({
    onSearch: () => {}, // Search will be handled by the PremiumTopNav
    onNewTask: () => setIsTaskModalOpen(true),
    onNavigateInbox: () => router.push('/inbox'),
    onNavigateDaily: () => router.push('/daily'),
    onNavigateProjects: () => router.push('/projects'),
    onNavigateTasks: () => router.push('/tasks'),
    onContextSwitch: () => toggleContext()
  })

  // Calculate inbox count
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
      {/* Theme Provider */}
      <ThemeProvider theme={user?.preferences?.theme} />
      
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
        <SideNavigation 
          currentPath={router.pathname}
          inboxCount={inboxCount}
        />
        
        {/* Page Content */}
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
      </div>

      {/* Global Modals */}
      <TaskCreationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      {/* Mobile Quick Action Button */}
      <MobileQuickAction onClick={() => setIsTaskModalOpen(true)} />
    </div>
  )
}

// Extracted mobile quick action button
const MobileQuickAction: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button
    variant="primary"
    size="lg"
    onClick={onClick}
    className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full w-14 h-14 flex items-center justify-center md:hidden"
    aria-label="Create new task"
  >
    +
  </Button>
)