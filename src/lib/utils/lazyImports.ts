/**
 * Centralized lazy imports for code splitting
 * Reduces initial bundle size by loading components on demand
 */
import dynamic from 'next/dynamic'
import React, { ComponentType } from 'react'

// Loading component for dynamic imports
export const LoadingComponent = () =>
  React.createElement('div', {
    className: "flex items-center justify-center min-h-[200px]"
  },
    React.createElement('div', {
      className: "animate-pulse"
    },
      React.createElement('div', {
        className: "h-8 w-8 bg-blue-500 rounded-full"
      })
    )
  )

// Lazy load heavy components with loading states
export const DynamicDashboard = dynamic(
  () => import('../../components/organisms/Dashboard').then(mod => ({ default: mod.Dashboard })),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: true
  }
)

export const DynamicModal = dynamic(
  () => import('../../components/molecules/Modal').then(mod => ({ default: mod.Modal })),
  {
    loading: () => null, // Modals don't need loading states
    ssr: false
  }
)

export const DynamicCard = dynamic(
  () => import('../../components/molecules/Card').then(mod => ({ default: mod.Card })),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: true
  }
)

// Lazy load drag-and-drop functionality (heavy library)
export const DynamicDndContext = dynamic(
  () => import('@dnd-kit/core').then(mod => ({ default: mod.DndContext })),
  {
    ssr: false
  }
)

export const DynamicDragOverlay = dynamic(
  () => import('@dnd-kit/core').then(mod => ({ default: mod.DragOverlay })),
  {
    ssr: false
  }
)

export const DynamicSortableContext = dynamic(
  () => import('@dnd-kit/sortable').then(mod => ({ default: mod.SortableContext })),
  {
    ssr: false
  }
)

// Page-specific lazy imports
export const DynamicInboxPage = dynamic(
  () => import('../../pages/inbox'),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: true
  }
)

export const DynamicDailyPage = dynamic(
  () => import('../../pages/daily'),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: true
  }
)

// Utility function for creating dynamic imports with custom options
export function createDynamicImport<P = Record<string, never>>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: ComponentType
    ssr?: boolean
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading ? () => React.createElement(options.loading!) : () => React.createElement(LoadingComponent),
    ssr: options?.ssr !== false
  })
}

// Preload components for better UX
export const preloadComponent = (component: unknown) => {
  if (component && typeof component === 'object' && component !== null && 'preload' in component) {
    const preloadable = component as { preload?: () => void }
    preloadable.preload?.()
  }
}

// Route-based preloading strategy
export const preloadRouteComponents = (route: string) => {
  switch (route) {
    case '/inbox':
      // Next.js dynamic imports don't expose preload directly
      // These would be loaded on route change
      break
    case '/daily':
      // These heavy components will be loaded when needed
      break
    case '/dashboard':
      // Dashboard components will be loaded on demand
      break
  }
}