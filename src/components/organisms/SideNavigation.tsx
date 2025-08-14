import React from 'react'
import Link from 'next/link'
import { Badge } from '../atoms/Badge'
import { cn } from '../../lib/utils/cn'
import { NAVIGATION_ITEMS } from '../../lib/config/navigation'

interface SideNavigationProps {
  currentPath: string
  inboxCount?: number
}

export const SideNavigation: React.FC<SideNavigationProps> = ({ 
  currentPath, 
  inboxCount = 0 
}) => {
  return (
    <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4">
        <ul className="space-y-1">
          {NAVIGATION_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={currentPath === item.path}
              badgeCount={item.id === 'inbox' ? inboxCount : undefined}
            />
          ))}
        </ul>
      </div>
    </nav>
  )
}

interface NavItemProps {
  item: typeof NAVIGATION_ITEMS[0]
  isActive: boolean
  badgeCount?: number
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, badgeCount }) => {
  const showBadge = badgeCount !== undefined && badgeCount > 0

  return (
    <li>
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
            {badgeCount}
          </Badge>
        )}
      </Link>
    </li>
  )
}