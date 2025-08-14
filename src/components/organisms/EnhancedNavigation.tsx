import React from 'react'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { useAppStore, useTaskStore } from '../../lib/stores'
import { NAVIGATION_ITEMS } from '../../lib/config/navigation'
import { cn } from '../../lib/utils/cn'

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
  const { tasks } = useTaskStore()

  // Calculate inbox count dynamically
  const inboxCount = tasks.filter(task =>
    task.context === currentContext &&
    (!task.project || (task.status === 'TODO' && !task.scheduled))
  ).length

  // Add dynamic badge data to navigation items
  const navigationItemsWithBadges = NAVIGATION_ITEMS.map(item => ({
    ...item,
    badge: item.id === 'inbox' && inboxCount > 0 
      ? { count: inboxCount, variant: 'progress' as const }
      : undefined
  }))

  return (
    <div className={cn(
      'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
      'w-64 h-full flex flex-col',
      className
    )}>
      {/* Context Switcher */}
      <ContextSwitcher 
        currentContext={currentContext}
        onToggle={toggleContext}
      />

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItemsWithBadges.map((item) => (
            <NavigationButton
              key={item.id}
              item={item}
              isActive={currentView === item.id}
              onClick={() => onNavigate(item.id)}
              badge={item.badge}
            />
          ))}
        </div>
      </nav>

      {/* Quick Actions */}
      <QuickActionsPanel />
    </div>
  )
}

interface ContextSwitcherProps {
  currentContext: 'work' | 'home'
  onToggle: () => void
}

const ContextSwitcher: React.FC<ContextSwitcherProps> = ({ currentContext, onToggle }) => (
  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        GTD Workspace
      </h2>
    </div>
    
    <div className="flex items-center gap-2">
      <ContextButton
        context="work"
        icon="💼"
        label="Work"
        isActive={currentContext === 'work'}
        onClick={onToggle}
      />
      <ContextButton
        context="home"
        icon="🏠"
        label="Home"
        isActive={currentContext === 'home'}
        onClick={onToggle}
      />
    </div>
    
    <div className="mt-3 text-center">
      <Badge variant={currentContext === 'work' ? 'progress' : 'planning'}>
        {currentContext === 'work' ? 'Work Context' : 'Home Context'}
      </Badge>
    </div>
  </div>
)

interface ContextButtonProps {
  context: 'work' | 'home'
  icon: string
  label: string
  isActive: boolean
  onClick: () => void
}

const ContextButton: React.FC<ContextButtonProps> = ({ icon, label, isActive, onClick }) => (
  <Button
    variant={isActive ? 'primary' : 'secondary'}
    size="sm"
    onClick={isActive ? undefined : onClick}
    className="flex-1"
  >
    <span className="mr-2">{icon}</span>
    {label}
  </Button>
)

interface NavigationButtonProps {
  item: typeof NAVIGATION_ITEMS[0]
  isActive: boolean
  onClick: () => void
  badge?: { count: number; variant: 'progress' }
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ item, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200',
      'hover:bg-gray-100 dark:hover:bg-gray-800',
      isActive
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
        : 'text-gray-700 dark:text-gray-300'
    )}
  >
    <div className="flex items-center gap-3">
      <span className="text-xl">{item.icon}</span>
      <span className="font-medium">{item.label}</span>
    </div>
    
    {badge && badge.count > 0 && (
      <Badge variant={badge.variant} size="sm">
        {badge.count}
      </Badge>
    )}
  </button>
)

const QuickActionsPanel: React.FC = () => (
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
)