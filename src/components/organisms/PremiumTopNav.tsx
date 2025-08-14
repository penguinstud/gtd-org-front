import React, { useState, useCallback } from 'react'
import { Button } from '../atoms/Button'
import { SearchModal } from '../molecules/SearchModal'
import { SearchResult } from '../../lib/types'
import { useRouter } from 'next/router'
import { useKeyboardShortcuts } from '../../lib/hooks/useKeyboardShortcuts'

interface PremiumTopNavProps {
  currentContext?: 'work' | 'home'
  onContextSwitch?: (context: 'work' | 'home') => void
  user?: {
    name: string
    avatar?: string
  }
  onNewTask?: () => void
}

export function PremiumTopNav({
  currentContext = 'work',
  onContextSwitch,
  user,
  onNewTask
}: PremiumTopNavProps) {
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context: currentContext,
          limit: 20
        })
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      return data.data?.results || []
    } catch (error) {
      // Search failed, return empty results
      return []
    }
  }, [currentContext])

  const handleSelectResult = useCallback((result: SearchResult) => {
    // Navigate to appropriate page based on result type
    switch (result.type) {
      case 'task':
        router.push('/tasks')
        break
      case 'project':
        router.push('/projects')
        break
      default:
        router.push('/dashboard')
    }
  }, [router])

  // Set up keyboard shortcut for search
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      metaKey: true,
      handler: () => setIsSearchOpen(true),
      description: 'Open search'
    }
  ])

  return (
    <>
      <nav className="glassmorphic-dark h-16 px-6 flex items-center justify-between border-b border-gray-200/20 sticky top-0 z-50">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <h1 className="text-xl font-bold text-white">GTD Org Front</h1>
          </div>
        </div>

        {/* Center - Context Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300 mr-2">Context:</span>
          <div className="flex bg-black/20 rounded-lg p-1">
            <button
              onClick={() => onContextSwitch?.('work')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-premium ${
                currentContext === 'work'
                  ? 'bg-primary text-white shadow-premium'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Work
            </button>
            <button
              onClick={() => onContextSwitch?.('home')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-premium ${
                currentContext === 'home'
                  ? 'bg-context-home text-white shadow-premium'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </button>
          </div>
        </div>

        {/* Right Section - Search & User */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-64 bg-black/20 border border-gray-500/30 rounded-md px-4 py-2 text-sm text-left text-gray-400 hover:bg-black/30 hover:border-gray-400/30 transition-colors flex items-center justify-between"
            >
              <span>Search tasks, projects...</span>
              <kbd className="px-2 py-0.5 text-xs bg-gray-700/50 rounded">⌘K</kbd>
            </button>
          </div>

          {/* Quick Actions */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-white/10"
            onClick={onNewTask}
            title="Create new task (Ctrl+N)"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
            <BellIcon className="w-4 h-4" />
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-2 pl-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-300 hidden lg:block">{user.name}</span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gray-600 rounded-full" />
            )}
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
        onSelect={handleSelectResult}
      />
    </>
  )
}

// Simple Icon Components (will be replaced with proper icon library)
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}