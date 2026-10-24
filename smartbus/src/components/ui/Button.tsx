import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

  const variantClasses = {
    default: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    primary: 'bg-navy-600 text-white hover:bg-navy-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700'
  }

  const sizeClasses = {
    sm: 'h-8 py-1 px-2',
    md: 'h-10 py-2 px-4',
    lg: 'h-12 py-3 px-6'
  }

  return (
    <button
      className={[
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 mr-2"></span>
      ) : (
        children
      )}
    </button>
  )
}