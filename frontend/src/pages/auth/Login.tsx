// Trang Đăng nhập — Tech Blue Luxury (tiếng Việt).
// Sử dụng `useAuth().login()` → gọi POST /api/auth/login qua features/auth.
import { useState } from 'react'
// FIX 1: Thêm type-only import cho FormEvent chống lỗi verbatimModuleSyntax
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react'

import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { Alert, Button, Card, TextField } from '../../components/ui'
import { AuthShell } from '../../components/layout'
import { getApiErrorMessage } from '../../utils/apiError'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  // FIX 2: Định nghĩa rõ state error có thể là string hoặc null
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // FIX 3: Thêm kiểu dữ liệu FormEvent cho tham số e
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      navigate(ROUTES.HOME, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Semo • Tech Mobility"
      title="Chào mừng trở lại."
      description="Đăng nhập để quản lý xe điện, chuyến đi và ví của bạn trên một giao diện thông minh, an toàn và sang trọng."
    >
      <Card variant="glow">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__header">
            <h2 className="auth-form__title">Đăng nhập</h2>
            <p className="auth-form__subtitle">
              Sử dụng email và mật khẩu đã đăng ký để tiếp tục.
            </p>
          </div>

          {error && <Alert>{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            name="email"
            value={email}
            // TypeScript có khả năng tự suy luận inline event (e) ở đây nên không cần gán type thủ công
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@vidu.com"
            autoComplete="email"
            required
            leadingIcon={<Mail size={18} strokeWidth={1.7} />}
          />

          <TextField
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu của bạn"
            autoComplete="current-password"
            required
            leadingIcon={<Lock size={18} strokeWidth={1.7} />}
            trailingAction={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                style={{
                  background: 'transparent',
                  border: 0,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.7} /> : <Eye size={18} strokeWidth={1.7} />}
              </button>
            }
          />

          <div className="auth-form__actions">
            <Button
              type="submit"
              disabled={loading}
              leadingIcon={<LogIn size={18} strokeWidth={1.8} />}
              trailingIcon={!loading ? <ArrowRight size={18} strokeWidth={1.8} /> : null}
            >
              {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </Button>
            <p className="auth-form__hint">
              Chưa có tài khoản?{' '}
              <Link className="auth-form__link" to={ROUTES.REGISTER}>
                Tạo tài khoản mới
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </AuthShell>
  )
}