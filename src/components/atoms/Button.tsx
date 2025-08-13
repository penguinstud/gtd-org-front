import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  children: React.ReactNode
  loading?: boolean
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  loading = false,
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-premium focus-premium disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-dark shadow-premium',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-gray-200',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-700',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-red-600 shadow-premium'
  }
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-8 text-base',
    icon: 'h-10 w-10'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
}

// Icon Button variant
export function IconButton({ children, ...props }: Omit<ButtonProps, 'size'>) {
  return (
    <Button {...props} size="icon">
      {children}
    </Button>
  )
}