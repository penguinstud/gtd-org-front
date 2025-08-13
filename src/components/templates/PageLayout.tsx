import React from 'react'
import { PremiumTopNav } from '../organisms/PremiumTopNav'
import { Button } from '../atoms/Button'

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
}

export function PageLayout({
  children,
  title,
  actions,
  currentContext = 'work',
  onContextSwitch,
  user
}: PageLayoutProps) {
  return (
    <div className="bg-workspace min-h-screen">
      <PremiumTopNav 
        currentContext={currentContext}
        onContextSwitch={onContextSwitch}
        user={user}
      />
      
      <main className="max-w-7xl mx-auto p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </header>
        
        {children}
      </main>
    </div>
  )
}

// Sidebar Layout variant (for future use)
export function SidebarLayout({
  children,
  title,
  actions,
  currentContext = 'work',
  onContextSwitch,
  user
}: PageLayoutProps) {
  return (
    <div className="bg-workspace min-h-screen">
      <PremiumTopNav 
        currentContext={currentContext}
        onContextSwitch={onContextSwitch}
        user={user}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <div className="space-y-1">
              <SidebarItem icon="📊" label="Dashboard" href="/dashboard" active />
              <SidebarItem icon="📋" label="Daily" href="/daily" />
              <SidebarItem icon="📁" label="Projects" href="/projects" />
              <SidebarItem icon="📥" label="Inbox" href="/inbox" />
              <SidebarItem icon="⚙️" label="Settings" href="/settings" />
            </div>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {actions && <div className="flex items-center space-x-3">{actions}</div>}
          </header>
          
          {children}
        </main>
      </div>
    </div>
  )
}

// Sidebar Item Component
interface SidebarItemProps {
  icon: string
  label: string
  href: string
  active?: boolean
}

function SidebarItem({ icon, label, href, active = false }: SidebarItemProps) {
  return (
    <a
      href={href}
      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-premium ${
        active
          ? 'bg-primary text-white shadow-premium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </a>
  )
}