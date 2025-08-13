import React from 'react'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { useAppStore } from '../../lib/stores'
import { cn } from '../../lib/utils/cn'

export interface NavigationItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: {
    count: number
    variant?: 'default' | 'success' | 'progress' | 'blocked' | 'planning' | 'secondary'
  }
}

export interface EnhancedNavigationProps {
  currentView: string
  onNavigate: (view: string) => void
  className?: string
}

export function EnhancedNavigation({ 
  currentView, 
  onNavigate, 
  className 
}: EnhancedNavigationProps) {
  const { currentContext, toggleContext } = useAppStore()

  const navigationItems: NavigationItem[] = [
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
        count: 5, // This would come from store
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

  return (
    <div className={cn(
      'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
      'w-64 h-full flex flex-col',
      className
    )}>
      {/* Context Switcher */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            GTD Workspace
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={currentContext === 'work' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => currentContext !== 'work' && toggleContext()}
            className="flex-1"
          >
            <span className="mr-2">💼</span>
            Work
          </Button>
          
          <Button
            variant={currentContext === 'home' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => currentContext !== 'home' && toggleContext()}
            className="flex-1"
          >
            <span className="mr-2">🏠</span>
            Home
          </Button>
        </div>
        
        <div className="mt-3 text-center">
          <Badge variant={currentContext === 'work' ? 'progress' : 'planning'}>
            {currentContext === 'work' ? 'Work Context' : 'Home Context'}
          </Badge>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                currentView === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              
              {item.badge && item.badge.count > 0 && (
                <Badge variant={item.badge.variant || 'default'} size="sm">
                  {item.badge.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <Button 
            variant="primary" 
            size="sm" 
            className="w-full justify-start"
          >
            <span className="mr-2">➕</span>
            Quick Capture
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full justify-start"
          >
            <span className="mr-2">🔄</span>
            Sync Files
          </Button>
        </div>
      </div>
    </div>
  )
}