import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils/cn'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, fullWidth = true, ...props }, ref) => {
    const baseStyles = "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    const widthStyles = fullWidth ? "w-full" : ""
    
    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(baseStyles, widthStyles, className)}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'