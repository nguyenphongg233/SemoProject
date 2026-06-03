import { Zap, ShieldCheck, Activity } from 'lucide-react'

export default function AuthShell({ eyebrow, title, description, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-shell__panel">
        <div className="auth-shell__brand">
          <span className="auth-shell__logo">S</span>
          <div>
            <p className="auth-shell__eyebrow">{eyebrow || 'Semo • Smart Mobility'}</p>
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
              <span>Bảo mật dữ liệu, phân quyền cấp doanh nghiệp</span>
            </li>
            <li>
              <Activity size={18} strokeWidth={1.6} style={{ color: 'var(--color-cyan-soft)' }} />
              <span>Giám sát đội xe theo thời gian thực</span>
            </li>
            <li>
              <Zap size={18} strokeWidth={1.6} style={{ color: 'var(--color-cyan-soft)' }} />
              <span>Thanh toán ví nhanh, thuê xe chỉ với một chạm</span>
            </li>
          </ul>
        </div>

        <p className="auth-shell__hint" style={{ position: 'relative', zIndex: 1, color: 'rgba(230,238,255,0.55)', fontSize: '0.82rem', margin: 0 }}>
          © {new Date().getFullYear()} SemoProject — Hệ thống quản lý xe điện thông minh.
        </p>
      </aside>

      <main className="auth-shell__main">
        <div className="auth-shell__form-wrap">{children}</div>
      </main>
    </div>
  )
}