import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AuthProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { SoundProvider } from '@/components/providers/sound-provider'
import { Sidebar } from '@/components/layout/sidebar'
import { AdminContent } from '@/components/layout/admin-content'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <SoundProvider>
          <div className="min-h-screen mario-main-bg flex">
            <Sidebar />
            <AdminContent>{children}</AdminContent>
          </div>
        </SoundProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
