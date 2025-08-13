import React from 'react'
import { Button } from '../atoms/Button'
import { Badge } from '../atoms/Badge'

interface PremiumTopNavProps {
  currentContext?: 'work' | 'home'
  onContextSwitch?: (context: 'work' | 'home') => void
  user?: {
    name: string
    avatar?: string
  }
}

export function PremiumTopNav({ 
  currentContext = 'work', 
  onContextSwitch,
  user 
}: PremiumTopNavProps) {
  return (
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
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="w-64 bg-black/20 border border-gray-500/30 rounded-md px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="absolute right-3 top-2.5">
            <SearchIcon className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Quick Actions */}
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
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
  )
}

// Simple Icon Components (will be replaced with proper icon library)
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

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