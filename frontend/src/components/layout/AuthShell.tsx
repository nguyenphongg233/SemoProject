import type { ReactNode } from 'react'
import AppNavbar from './AppNavbar'

// 1. Định nghĩa kiểu dữ liệu cho Props
interface AuthShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
}

// 2. Gắn AuthShellProps vào function
export default function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-midnight-3 text-text font-sans flex flex-col relative overflow-hidden">
      {/* Background radial gradient similar to writora.xyz */}
      <div className="absolute top-0 z-0 h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.15),rgba(255,255,255,0))] bg-[length:150%_150%] animate-[aurora_20s_linear_infinite] pointer-events-none fixed"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwem0xIDEyaDIydjFIMXptMTIgMHYxMmgtMXYtMTJ6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wNCIvPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] fixed"></div>

      {/* Floating Particles (CSS only approach) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-cyan-soft/40 shadow-[0_0_15px_var(--color-cyan)] animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute top-[60%] right-[15%] w-3 h-3 rounded-full bg-brand-soft/40 shadow-[0_0_20px_var(--color-brand)] animate-[ping_6s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
        <div className="absolute bottom-[20%] left-[20%] w-1.5 h-1.5 rounded-full bg-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-[ping_5s_cubic-bezier(0,0,0.2,1)_infinite_2s]"></div>
      </div>
      
      <AppNavbar />

      <main className="flex-1 w-full relative z-10 flex flex-col items-center justify-center p-6 pt-24 pb-12">
        <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-strong mb-4">
              {title}
            </h1>
            <p className="text-text-muted text-base md:text-lg text-balance">
              {description}
            </p>
          </div>
          
          <div className="relative z-10 w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-text-muted text-sm border-t border-border/40 relative z-10 mt-auto">
        &copy; {new Date().getFullYear()} SEMO — Smart e-mobility platform.
      </footer>
    </div>
  )
}