import { Outlet } from 'react-router-dom'
import { AppNavbar } from '@/components/layout'

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-brand-soft selection:text-brand-dark flex flex-col relative overflow-hidden">
      {/* Background radial gradient similar to writora.xyz */}
      <div className="absolute top-0 z-0 h-[100vh] w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.15),rgba(255,255,255,0))] bg-[length:150%_150%] animate-[aurora_20s_linear_infinite] pointer-events-none fixed"></div>
      
      <AppNavbar />
      
      <main className="flex-1 relative z-10 w-full">
        <Outlet />
      </main>
      
      {/* Basic Footer Placeholder */}
      <footer className="w-full py-6 text-center text-text-muted text-sm border-t border-border mt-20 relative z-10">
        &copy; {new Date().getFullYear()} Semo App. All rights reserved.
      </footer>
    </div>
  )
}
