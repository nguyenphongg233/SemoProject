import { Compass, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'

export default function NotFoundPage() {
    return (
        <main className="not-found">
            <section className="hero-card">
        <span className="auth-card__eyebrow">
          <Compass size={16} />
          404
        </span>
                <h1>Không tìm thấy trang này.</h1>
                <p>Route bạn vừa truy cập không tồn tại trong customer portal.</p>
                <div className="hero-actions">
                    <Link to="/">
                        <Button icon={Home}>Về trang chính</Button>
                    </Link>
                </div>
            </section>
        </main>
    )
}
