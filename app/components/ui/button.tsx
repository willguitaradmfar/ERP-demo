'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'coin' | 'pipe' | 'star'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-bold rounded-xl
    transition-all duration-150 transform
    focus:outline-none focus:ring-4
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-95
    border-4 shadow-[3px_3px_0_rgba(0,0,0,0.4)]
    hover:shadow-[4px_4px_0_rgba(0,0,0,0.4)] hover:-translate-y-0.5
    active:shadow-[1px_1px_0_rgba(0,0,0,0.4)] active:translate-y-0.5
  `

  const variantStyles = {
    primary: 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-yellow-900 border-yellow-700 focus:ring-yellow-300 hover:from-yellow-300 hover:to-yellow-500',
    secondary: 'bg-gradient-to-b from-orange-500 to-orange-700 text-white border-orange-800 focus:ring-orange-300 hover:from-orange-400 hover:to-orange-600',
    danger: 'bg-gradient-to-b from-red-500 to-red-700 text-white border-red-800 focus:ring-red-300 hover:from-red-400 hover:to-red-600',
    ghost: 'bg-transparent text-yellow-600 dark:text-yellow-400 border-transparent shadow-none hover:bg-yellow-100 dark:hover:bg-yellow-900/20 focus:ring-yellow-300',
    coin: 'bg-gradient-to-b from-yellow-300 to-yellow-500 text-yellow-900 border-yellow-600 focus:ring-yellow-200 hover:from-yellow-200 hover:to-yellow-400 animate-pulse',
    pipe: 'bg-gradient-to-b from-green-400 to-green-600 text-white border-green-700 focus:ring-green-300 hover:from-green-300 hover:to-green-500',
    star: 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-900 border-amber-600 focus:ring-amber-200 hover:from-amber-200 hover:to-amber-400',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin text-lg">🪙</span>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  )
}
