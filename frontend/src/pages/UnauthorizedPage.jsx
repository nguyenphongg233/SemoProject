import { ArrowLeft, ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'

export default function UnauthorizedPage() {
    return (
        <main className="unauthorized">
            <section className="hero-card">
        <span className="auth-card__eyebrow">
          <ShieldX size={16} />
          Unauthorized
        </span>
                <h1>Bạn không có quyền truy cập route này.</h1>
                <p>Hãy đăng nhập bằng đúng vai trò hoặc quay về trang phù hợp với quyền hiện tại.</p>
                <div className="hero-actions">
                    <Link to="/">
                        <Button icon={ArrowLeft}>Quay về</Button>
                    </Link>
                </div>
            </section>
        </main>
    )
}
