// Trang Đăng ký — Tech Blue Luxury (tiếng Việt).
// Gọi POST /api/auth/register qua features/auth.
import { useState } from 'react'
// FIX 1: Import type-only chống lỗi verbatimModuleSyntax
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../constants/routes'
import { Alert, Button, Card, TextField } from '../../components/ui'
import { AuthShell } from '../../components/layout'
import { getApiErrorMessage } from '../../utils/apiError'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  // FIX 2: Khai báo rõ ràng state error được phép nhận chuỗi string
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // FIX 3: Định nghĩa FormEvent cho e
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.')
      return
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.')
      return
    }

    setLoading(true)
    try {
      await register({ fullName, email, password, phoneNumber })
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'))
    } finally {
      setLoading(false)
    }
  }

  // FIX 4: Định nghĩa boolean cho visible
  const togglePwdIcon = (visible: boolean) =>
    visible ? <EyeOff size={18} strokeWidth={1.7} /> : <Eye size={18} strokeWidth={1.7} />

  // FIX 5: Định nghĩa chính xác kiểu dữ liệu cho hàm tạo eyeButton
  const eyeButton = (
    visible: boolean, 
    setter: React.Dispatch<React.SetStateAction<boolean>>, 
    label: string
  ) => (
    <button
      type="button"
      aria-label={label}
      onClick={() => setter((v) => !v)}
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
      {togglePwdIcon(visible)}
    </button>
  )

  return (
    <AuthShell
      eyebrow="Tạo tài khoản"
      title="Bắt đầu hành trình."
      description="Đăng ký để truy cập mạng lưới xe điện thông minh, quản lý ví và lịch sử thuê — tất cả trong một nơi."
    >
      <Card variant="glow">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__header">
            <h2 className="auth-form__title">Tạo tài khoản</h2>
            <p className="auth-form__subtitle">
              Điền thông tin của bạn để mở tài khoản khách hàng.
            </p>
          </div>

          {error && <Alert>{error}</Alert>}

          <TextField
            label="Họ và tên"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            required
            leadingIcon={<User size={18} strokeWidth={1.7} />}
          />

          <TextField
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@vidu.com"
            autoComplete="email"
            required
            leadingIcon={<Mail size={18} strokeWidth={1.7} />}
          />

          <TextField
            label="Số điện thoại"
            name="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="09xxxxxxxx"
            autoComplete="tel"
            required
            leadingIcon={<Phone size={18} strokeWidth={1.7} />}
          />

          <TextField
            label="Mật khẩu"
            type={showPwd ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự"
            autoComplete="new-password"
            helpText="Nên dùng ít nhất 8 ký tự, có chữ hoa, chữ thường và số."
            required
            leadingIcon={<Lock size={18} strokeWidth={1.7} />}
            trailingAction={eyeButton(showPwd, setShowPwd, 'Hiện/ẩn mật khẩu')}
          />

          <TextField
            label="Xác nhận mật khẩu"
            type={showConfirmPwd ? 'text' : 'password'}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            required
            leadingIcon={<Lock size={18} strokeWidth={1.7} />}
            trailingAction={eyeButton(showConfirmPwd, setShowConfirmPwd, 'Hiện/ẩn mật khẩu xác nhận')}
          />

          <div className="auth-form__actions">
            <Button
              type="submit"
              disabled={loading}
              leadingIcon={<UserPlus size={18} strokeWidth={1.8} />}
            >
              {loading ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
            </Button>
            <p className="auth-form__hint">
              Đã có tài khoản?{' '}
              <Link className="auth-form__link" to={ROUTES.LOGIN}>
                Đăng nhập
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </AuthShell>
  )
}