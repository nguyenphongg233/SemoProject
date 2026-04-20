import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import Button from '../components/Button'

export default function AdminDashboardPage() {
    return (
        <div className="page-shell">
            <AppHeader />
            <main className="admin-placeholder">
                <section className="hero-card">
          <span className="auth-card__eyebrow">
            <ShieldCheck size={16} />
            Admin route placeholder
          </span>
                    <h1>Admin dashboard chưa nằm trong phạm vi phần này.</h1>
                    <p>
                        Route <strong>/admin/dashboard</strong> đã được giữ chỗ đúng yêu cầu. Luồng redirect sau login vẫn
                        hoạt động theo role, nhưng giao diện admin không được code trong phạm vi customer portal.
                    </p>
                    <div className="hero-actions">
                        <Link to="/user/booking">
                            <Button variant="secondary" icon={ArrowRight}>Xem user booking page</Button>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    )
}
