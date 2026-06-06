import type { ReactNode } from 'react'
import { Zap, ShieldCheck, Activity } from 'lucide-react'
import SemoIcon from '@/assets/semo-icon.svg?react';

// 1. Định nghĩa kiểu dữ liệu cho Props
interface AuthShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
}

// 2. Gắn AuthShellProps vào function
export default function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <div className="relative grid min-h-screen grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)]
      overflow-hidden max-[980px]:grid-cols-1 before:content-['']
      before:absolute before:inset-0 before:bg-(--gradient-hero) before:pointer-events-none before:z-0
    ">
      <aside className="
        relative z-10 flex flex-col justify-between p-12 text-white overflow-hidden 
        max-[980px]:min-h-80 max-[980px]:p-8 max-[640px]:p-6
        
        /* Pseudo-element ::after */
        after:content-[''] after:absolute after:w-130 after:h-130 after:rounded-full 
        after:-right-40 after:top-[20%] 
        after:bg-[radial-gradient(circle,rgba(0,209,255,0.35),transparent_70%)] 
        after:blur-2xl after:-z-10 after:animate-[floatOrb_14s_ease-in-out_infinite] 

        /* Pseudo-element ::before */
        before:content-[''] before:absolute before:w-90 before:h-90 before:rounded-full 
        before:-left-30 before:bottom-[10%] 
        before:bg-[radial-gradient(circle,rgba(0,82,255,0.45),transparent_70%)] 
        before:blur-12 before:-z-10 before:animate-[floatOrb_18s_ease-in-out_infinite_reverse]
      ">
        <div className="relative z-10 flex items-center gap-4">
          <SemoIcon className="w-20 h-20" />
          <div>
            <p className="tracking-[0.18em] uppercase text-xs font-bold text-cyan-soft">{eyebrow || 'Semo • Tech Mobility'}</p>
            <h1 className="mt-0.5 text-2xl font-extrabold">SemoProject</h1>
          </div>
        </div>

        <div className="relative z-10 grid gap-5 max-w-135 pt-8">
          <p className="tracking-[0.18em] uppercase text-xs font-bold text-cyan-soft">
            Smart E-Mobility Operations
          </p>

          <h2 className="
            text-[clamp(2.6rem,5.5vw,4.4rem)] leading-[1.02] tracking-[-0.045em] 
            bg-linear-to-br from-white to-cyan-soft bg-clip-text text-transparent
            max-sm:text-[clamp(2rem,11vw,3rem)]
          ">
            {title}
          </h2>

          <p className="max-w-120 text-lg text-text/78">
            {description}
          </p>

          <ul className="grid gap-3 list-none mt-5 text-text/88">

            {/* Tính năng 1 */}
            <li className="flex items-center gap-[0.7rem] text-[0.98rem] before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-cyan before:shadow-[0_0_12px_var(--color-cyan)] before:shrink-0">
              <ShieldCheck size={18} strokeWidth={1.6} className="text-cyan-soft" />
              <span>JWT secured, enterprise-grade RBAC</span>
            </li>

            <li className="flex items-center gap-[0.7rem] text-[0.98rem] before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-cyan before:shadow-[0_0_12px_var(--color-cyan)] before:shrink-0">
              <Activity size={18} strokeWidth={1.6} className="text-cyan-soft" />
              <span>Real-time fleet monitoring on map</span>
            </li>

            <li className="flex items-center gap-[0.7rem] text-[0.98rem] before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-cyan before:shadow-[0_0_12px_var(--color-cyan)] before:shrink-0">
              <Zap size={18} strokeWidth={1.6} className="text-cyan-soft" />
              <span>Instant wallet top-up, 1-tap ride booking</span>
            </li>

          </ul>
        </div>

        <p className="relative z-1 text-[#e6eeff]/55 text-[0.82rem] m-0" >
          © {new Date().getFullYear()} SEMO — Smart e-mobility platform.
        </p>
      </aside>

      <main className="relative z-10 grid place-items-center p-10 max-[640px]:p-6">
        <div className="w-[min(100%,480px)]">{children}</div>
      </main>
    </div>
  )
}