import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils/cn'

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  options?: Array<{ value: string; label: string }>
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, label, error, fullWidth = false, options, children, ...props }, ref) => {
    const baseStyles = "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    const widthStyles = fullWidth ? "w-full" : ""
    
    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(baseStyles, widthStyles, className)}
          {...props}
        >
          {options ? (
            options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

FormSelect.displayName = 'FormSelect'