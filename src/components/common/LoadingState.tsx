import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showSpinner?: boolean
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'md',
  className,
  showSpinner = true
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-64', 
    lg: 'h-96'
  }
  
  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      <div className="flex flex-col items-center gap-3">
        {showSpinner && (
          <div className={cn(
            'animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600',
            spinnerSizes[size]
          )} />
        )}
        <div className={cn(
          'text-gray-500 dark:text-gray-400',
          textSizes[size]
        )}>
          {message}
        </div>
      </div>
    </div>
  )
}

/**
 * Inline loading spinner for smaller spaces
 */
export function InlineLoadingSpinner({ 
  size = 'sm',
  className 
}: Pick<LoadingStateProps, 'size' | 'className'>) {
  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-current border-t-transparent',
      spinnerSizes[size],
      className
    )} />
  )
}

/**
 * Loading skeleton for content placeholders
 */
export function LoadingSkeleton({ 
  lines = 3,
  className 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}