import { Bike, ShieldCheck, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthLayout({ title, description, children, footer, asideTitle, asideText }) {
    return (
        <div className="auth-layout">
            <section className="auth-panel">
                <div className="auth-panel__top">
                    <Link to="/" className="brand">
            <span className="brand__mark">
              <Bike size={20} />
            </span>
                        <span className="brand__meta">
              <span className="brand__title">SEMO</span>
              <span className="brand__subtitle">Smart E-Scooter Customer Portal</span>
            </span>
                    </Link>

                    <div className="auth-card">
                        <div className="auth-card__header">
              <span className="auth-card__eyebrow">
                <ShieldCheck size={16} />
                Customer Portal &amp; Authentication
              </span>
                            <h1>{title}</h1>
                            <p>{description}</p>
                        </div>
                        {children}
                    </div>
                </div>
                <div className="auth-footer-note">{footer}</div>
            </section>

            <aside className="auth-aside">
                <div className="auth-aside__hero">
                    <h2>{asideTitle}</h2>
                    <p>{asideText}</p>
                </div>

                <div className="feature-grid">
                    <article className="feature-card">
                        <Zap size={22} />
                        <h3>Mở khóa nhanh</h3>
                        <p>Từ tìm xe đến mở khóa chỉ trong một luồng thao tác rõ ràng, ngắn gọn.</p>
                    </article>
                    <article className="feature-card">
                        <ShieldCheck size={22} />
                        <h3>An toàn theo thời gian thực</h3>
                        <p>Geofence warning và auto-decommission phản ánh ngay trên giao diện.</p>
                    </article>
                    <article className="feature-card">
                        <Bike size={22} />
                        <h3>Trạng thái xe trực quan</h3>
                        <p>Phân biệt rõ xe khả dụng, đang dùng, bảo trì, hoặc đang bị khóa an toàn.</p>
                    </article>
                    <article className="feature-card">
                        <Zap size={22} />
                        <h3>Sẵn sàng nối backend thật</h3>
                        <p>Service layer tách riêng để thay mock bằng API thật mà không phải viết lại UI.</p>
                    </article>
                </div>

                <div className="demo-credentials">
                    <h4>Tài khoản demo</h4>
                    <p>User: <strong>user@semo.app</strong> / <strong>User@123</strong></p>
                    <p>Admin: <strong>admin@semo.app</strong> / <strong>Admin@123</strong></p>
                </div>
            </aside>
        </div>
    )
}
