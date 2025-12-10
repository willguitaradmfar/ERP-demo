import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'question' | 'brick' | 'pipe'
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-gradient-to-b from-yellow-100 to-yellow-200 dark:from-gray-800 dark:to-gray-900 border-4 border-yellow-600 dark:border-yellow-700 shadow-[4px_4px_0_rgba(0,0,0,0.3)]',
    question: 'bg-gradient-to-b from-yellow-400 to-yellow-600 border-4 border-yellow-700 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2),4px_4px_0_rgba(0,0,0,0.3)]',
    brick: 'bg-orange-700 border-4 border-orange-900 shadow-[4px_4px_0_rgba(0,0,0,0.3)]',
    pipe: 'bg-gradient-to-r from-green-500 via-green-400 to-green-500 border-4 border-green-700 shadow-[4px_4px_0_rgba(0,0,0,0.3)]',
  }

  return (
    <div className={`rounded-xl ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-b-4 border-yellow-600/30 dark:border-yellow-700/30 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-bold text-yellow-900 dark:text-yellow-400 drop-shadow-[1px_1px_0_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t-4 border-yellow-600/30 dark:border-yellow-700/30 ${className}`}>
      {children}
    </div>
  )
}
