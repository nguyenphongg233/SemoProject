import type { ReactNode } from 'react'
import { Zap, ShieldCheck, Activity } from 'lucide-react'
import SemoIcon from '@/assets/semo-icon.svg?react';

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <div className="relative grid min-h-screen grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)]
      overflow-hidden max-[980px]:grid-cols-1 bg-bg-accent theme-transition
      before:content-[''] before:absolute before:inset-0 before:bg-gradient-hero before:pointer-events-none before:z-0
    ">
      
      {/* Cột giới thiệu bên trái - Tự động đổi màu nền theo Theme */}
      <aside className="
        relative z-10 flex flex-col justify-between p-12 overflow-hidden theme-transition
        max-[980px]:min-h-80 max-[980px]:p-8 max-[640px]:p-6
        
        /* Cấu hình màu nền linh hoạt: Light mode dùng kính trắng mờ, Dark mode dùng dải tối sâu */
        text-text bg-surface/40 border-r border-border backdrop-blur-xl
        dark:text-white dark:bg-[linear-gradient(180deg,rgba(6,10,22,0.95),rgba(11,17,32,0.95))]
        
        /* Khối cầu phát sáng bên phải (Tự điều chỉnh độ mờ theo Theme) */
        after:content-[''] after:absolute after:w-130 after:h-130 after:rounded-full 
        after:-right-40 after:top-[20%] 
        after:bg-[radial-gradient(circle,var(--border-glow),transparent_70%)] 
        after:opacity-40 dark:after:opacity-100
        after:blur-2xl after:-z-10 after:animate-[floatOrb_14s_ease-in-out_infinite] 

        /* Khối cầu phát sáng bên trái */
        before:content-[''] before:absolute before:w-90 before:h-90 before:rounded-full 
        before:-left-30 before:bottom-[10%] 
        before:bg-[radial-gradient(circle,var(--color-brand-soft),transparent_70%)] 
        before:opacity-50 dark:before:opacity-100
        before:blur-xl before:-z-10 before:animate-[floatOrb_18s_ease-in-out_infinite_reverse]
      ">
        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-4">
          <SemoIcon className="w-16 h-16 text-brand" />
          <div>
            <p className="tracking-[0.18em] uppercase text-xs font-extrabold text-brand">
              {eyebrow || 'Semo • Tech Mobility'}
            </p>
            <h1 className="mt-0.5 text-2xl font-black text-text-strong">SemoProject</h1>
          </div>
        </div>

        {/* Khối nội dung giới thiệu */}
        <div className="relative z-10 grid gap-4 max-w-135 pt-8">
          <p className="tracking-[0.18em] uppercase text-xs font-bold text-brand">
            Smart E-Mobility Operations
          </p>

          {/* Tiêu đề lớn thích ứng (Light: Xám sẫm -> Xanh thương hiệu; Dark: Trắng -> Cyan) */}
          <h2 className="
            text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.05] tracking-[-0.045em] font-extrabold
            bg-clip-text text-transparent max-sm:text-[clamp(2rem,11vw,3rem)]
            bg-linear-to-br from-text-strong to-brand
            dark:bg-linear-to-br dark:from-white dark:to-accent
          ">
            {title}
          </h2>

          <p className="max-w-120 text-base text-text-muted leading-relaxed">
            {description}
          </p>

          {/* Danh sách tính năng đạt chuẩn tương phản */}
          <ul className="grid gap-3.5 list-none mt-4 text-text font-medium">
            
            {/* Tính năng 1 */}
            <li className="flex items-center gap-[0.7rem] text-[0.95rem] 
              before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand before:shrink-0
              dark:before:bg-accent dark:before:shadow-[0_0_12px_var(--border-glow)]">
              <ShieldCheck size={18} strokeWidth={1.8} className="text-brand dark:text-accent" />
              <span>JWT secured, enterprise-grade RBAC</span>
            </li>
            
            {/* Tính năng 2 */}
            <li className="flex items-center gap-[0.7rem] text-[0.95rem] 
              before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand before:shrink-0
              dark:before:bg-accent dark:before:shadow-[0_0_12px_var(--border-glow)]">
              <Activity size={18} strokeWidth={1.8} className="text-brand dark:text-accent" />
              <span>Real-time fleet monitoring on map</span>
            </li>
            
            {/* Tính năng 3 */}
            <li className="flex items-center gap-[0.7rem] text-[0.95rem] 
              before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand before:shrink-0
              dark:before:bg-accent dark:before:shadow-[0_0_12px_var(--border-glow)]">
              <Zap size={18} strokeWidth={1.8} className="text-brand dark:text-accent" />
              <span>Instant wallet top-up, 1-tap ride booking</span>
            </li>

          </ul>
        </div>

        {/* Footer Bản quyền */}
        <p className="relative z-1 text-text-muted text-xs m-0" >
          &copy; {new Date().getFullYear()} SEMO &mdash; Smart e-mobility platform.
        </p>
      </aside>

      {/* Vùng chứa Form chính bên phải */}
      <main className="relative z-10 grid place-items-center p-10 bg-transparent max-[640px]:p-6">
        <div className="w-[min(100%,440px)]">{children}</div>
      </main>
    </div>
  )
}