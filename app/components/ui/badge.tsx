import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'coin' | 'star' | 'mushroom'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gradient-to-b from-orange-400 to-orange-600 text-white border-2 border-orange-700',
    success: 'bg-gradient-to-b from-green-400 to-green-600 text-white border-2 border-green-700',
    warning: 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-yellow-900 border-2 border-yellow-700',
    danger: 'bg-gradient-to-b from-red-400 to-red-600 text-white border-2 border-red-700',
    info: 'bg-gradient-to-b from-blue-400 to-blue-600 text-white border-2 border-blue-700',
    coin: 'bg-gradient-to-b from-yellow-300 to-yellow-500 text-yellow-900 border-2 border-yellow-600 animate-pulse',
    star: 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-900 border-2 border-amber-600',
    mushroom: 'bg-gradient-to-b from-red-400 to-red-600 text-white border-2 border-red-700',
  }

  const emojis: Record<string, string> = {
    success: '✓',
    warning: '!',
    danger: '✗',
    info: 'i',
    coin: '🪙',
    star: '⭐',
    mushroom: '🍄',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold
        shadow-[2px_2px_0_rgba(0,0,0,0.3)]
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {emojis[variant] && <span className="text-sm">{emojis[variant]}</span>}
      {children}
    </span>
  )
}
