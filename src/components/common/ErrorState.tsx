import React from 'react'
import { Button } from '../atoms/Button'
import { cn } from '../../lib/utils/cn'

export interface ErrorStateProps {
  error: string | Error
  title?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onRetry?: () => void
  retryLabel?: string
  showDetails?: boolean
}

export function ErrorState({
  error,
  title = 'Something went wrong',
  size = 'md',
  className,
  onRetry,
  retryLabel = 'Try Again',
  showDetails = false
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error
  
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-64',
    lg: 'h-96'
  }
  
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  }

  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        {/* Error Icon */}
        <div className="text-red-500 text-4xl">⚠️</div>
        
        {/* Title */}
        <h3 className={cn(
          'font-semibold text-gray-900 dark:text-white',
          titleSizes[size]
        )}>
          {title}
        </h3>
        
        {/* Error Message */}
        <p className={cn(
          'text-gray-600 dark:text-gray-300',
          textSizes[size]
        )}>
          {errorMessage}
        </p>
        
        {/* Details (collapsible) */}
        {showDetails && error instanceof Error && error.stack && (
          <details className="w-full">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Show Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto text-left">
              {error.stack}
            </pre>
          </details>
        )}
        
        {/* Retry Button */}
        {onRetry && (
          <Button onClick={onRetry} variant="primary">
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Inline error display for smaller spaces
 */
export function InlineError({ 
  error, 
  className,
  onRetry 
}: Pick<ErrorStateProps, 'error' | 'className' | 'onRetry'>) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className={cn(
      'flex items-center gap-2 p-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded',
      className
    )}>
      <span>⚠️</span>
      <span className="flex-1">{errorMessage}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-700 hover:text-red-800 underline"
        >
          Retry
        </button>
      )}
    </div>
  )
}

/**
 * Toast-style error notification
 */
export function ErrorToast({ 
  error, 
  onDismiss,
  autoHide = true
}: {
  error: string | Error
  onDismiss: () => void
  autoHide?: boolean
}) {
  const errorMessage = error instanceof Error ? error.message : error

  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(onDismiss, 5000)
      return () => clearTimeout(timer)
    }
  }, [autoHide, onDismiss])

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-red-500 text-lg">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {errorMessage}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}