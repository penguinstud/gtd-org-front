import React from 'react'
import Link from 'next/link'
import { PremiumTopNav } from '../organisms/PremiumTopNav'
import { NAVIGATION_ITEMS } from '../../lib/config/navigation'
import { cn } from '../../lib/utils/cn'

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  actions?: React.ReactNode
  currentContext?: 'work' | 'home'
  onContextSwitch?: (context: 'work' | 'home') => void
  user?: {
    name: string
    avatar?: string
  }
  variant?: 'default' | 'sidebar'
  currentPath?: string
}

interface BaseLayoutProps extends PageLayoutProps {
  sidebar?: React.ReactNode
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  title,
  actions,
  currentContext = 'work',
  onContextSwitch,
  user,
  sidebar
}) => {
  return (
    <div className="bg-workspace min-h-screen">
      <PremiumTopNav 
        currentContext={currentContext}
        onContextSwitch={onContextSwitch}
        user={user}
      />
      
      {sidebar ? (
        <div className="flex">
          {sidebar}
          <main className="flex-1 p-6">
            <PageHeader title={title} actions={actions} />
            {children}
          </main>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto p-6">
          <PageHeader title={title} actions={actions} />
          {children}
        </main>
      )}
    </div>
  )
}

const PageHeader: React.FC<{ title: string; actions?: React.ReactNode }> = ({ title, actions }) => (
  <header className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    {actions && <div className="flex items-center space-x-3">{actions}</div>}
  </header>
)

const Sidebar: React.FC<{ currentPath?: string }> = ({ currentPath = '' }) => (
  <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
    <nav className="p-4">
      <div className="space-y-1">
        {NAVIGATION_ITEMS.map(item => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            href={item.path}
            active={currentPath === item.path}
          />
        ))}
      </div>
    </nav>
  </aside>
)

interface SidebarItemProps {
  icon: string
  label: string
  href: string
  active?: boolean
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href, active = false }) => (
  <Link
    href={href}
    className={cn(
      'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-premium',
      active
        ? 'bg-primary text-white shadow-premium'
        : 'text-gray-700 hover:bg-gray-100'
    )}
  >
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
  </Link>
)

export const PageLayout: React.FC<PageLayoutProps> = (props) => {
  const { variant = 'default', currentPath, ...baseProps } = props
  
  return (
    <BaseLayout 
      {...baseProps}
      sidebar={variant === 'sidebar' ? <Sidebar currentPath={currentPath} /> : undefined}
    />
  )
}