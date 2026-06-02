import type { ReactNode } from 'react'
import { Zap, ShieldCheck, Activity } from 'lucide-react'

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
    <div className="auth-shell">
      <aside className="auth-shell__panel">
        <div className="auth-shell__brand">
          <span className="auth-shell__logo">S</span>
          <div>
            <p className="auth-shell__eyebrow">{eyebrow || 'Semo • Tech Mobility'}</p>
            <h1 className="auth-shell__brand-title">SemoProject</h1>
          </div>
        </div>

        <div className="auth-shell__content">
          <p className="auth-shell__kicker">Vận hành xe điện thông minh</p>
          <h2 className="auth-shell__title">{title}</h2>
          <p className="auth-shell__description">{description}</p>

          <ul className="auth-shell__list">
            <li>
              <ShieldCheck size={18} strokeWidth={1.6} style={{ color: 'var(--color-cyan-soft)' }} />
              <span>Bảo mật JWT, phân quyền chuẩn doanh nghiệp</span>
            </li>
            <li>
              <Activity size={18} strokeWidth={1.6} style={{ color: 'var(--color-cyan-soft)' }} />
              <span>Giám sát đội xe theo thời gian thực trên bản đồ</span>
            </li>
            <li>
              <Zap size={18} strokeWidth={1.6} style={{ color: 'var(--color-cyan-soft)' }} />
              <span>Nạp ví nhanh, thuê xe chỉ với một chạm</span>
            </li>
          </ul>
        </div>

        <p className="auth-shell__hint" style={{ position: 'relative', zIndex: 1, color: 'rgba(230,238,255,0.55)', fontSize: '0.82rem', margin: 0 }}>
          © {new Date().getFullYear()} SemoProject — Smart e-mobility platform.
        </p>
      </aside>

      <main className="auth-shell__main">
        <div className="auth-shell__form-wrap">{children}</div>
      </main>
    </div>
  )
}