'use client'

import { ReactNode } from 'react'

interface AdminContentProps {
  children: ReactNode
}

export function AdminContent({ children }: AdminContentProps) {
  return (
    <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8 overflow-auto">
      {/* Floating clouds decoration */}
      <div
        className="fixed top-20 right-10 text-4xl opacity-30 pointer-events-none animate-float-cloud"
      >
        ☁️
      </div>
      <div
        className="fixed top-40 right-40 text-3xl opacity-20 pointer-events-none"
        style={{ animation: 'float-cloud 10s ease-in-out infinite 2s' }}
      >
        ☁️
      </div>
      <div
        className="fixed bottom-40 right-20 text-5xl opacity-25 pointer-events-none"
        style={{ animation: 'float-cloud 12s ease-in-out infinite 4s' }}
      >
        ☁️
      </div>

      {children}
    </main>
  )
}
