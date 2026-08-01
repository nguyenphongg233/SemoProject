import type { ReactNode } from 'react'
import { AppNavbar } from '@/components/layout'
import { useAuth } from '@/hooks/useAuth'

interface AppShellProps {
  mode?: 'user' | 'admin'
  children: ReactNode
}

export default function AppShell({ mode = 'user', children }: AppShellProps) {
  const { user } = useAuth()
  
  const isAdminMode = mode === 'admin'
  const topbarEyebrow = isAdminMode ? 'Fleet operations' : 'E-mobility experience'
  const topbarTitle = isAdminMode ? 'Admin console' : 'Personal Console'

  return (
    <div className="min-h-screen bg-midnight-2 text-text font-sans flex flex-col relative overflow-hidden">
      {/* Background dot matrix */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none fixed"></div>
      {/* Subtle Aurora */}
      <div className="absolute top-[-20%] left-[-10%] z-0 h-[70vh] w-[70vw] bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_70%)] animate-[pulse_10s_ease-in-out_infinite] pointer-events-none fixed blur-3xl"></div>
      
      {/* Top Navigation */}
      <AppNavbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 flex flex-col items-center">
        {/* Optional Page Header if we want a title below the navbar */}
        <header className="w-full max-w-[1400px] px-8 pt-24 pb-4 max-sm:px-4">
          <p className="mb-2 text-cyan-soft text-xs uppercase tracking-[0.18em] font-bold">
            {topbarEyebrow}
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl text-text-strong">
              {topbarTitle}
            </h1>
            <span className="inline-flex items-center justify-center min-h-8 px-4
              rounded-full text-sm font-semibold tracking-wider
              bg-brand-soft border border-brand/30 text-cyan-soft"
            >
              {user?.email || 'guest@example.com'}
            </span>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="w-full max-w-[1400px] px-8 pb-12 max-sm:px-4">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-text-muted text-sm border-t border-border/40 mt-10 relative z-10">
        &copy; {new Date().getFullYear()} Semo App. All rights reserved.
      </footer>
    </div>
  )
}