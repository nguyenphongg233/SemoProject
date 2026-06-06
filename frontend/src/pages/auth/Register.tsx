// Trang Đăng ký — Tech Blue Luxury (tiếng Việt).
// Gọi POST /api/auth/register qua features/auth.
import { useState } from 'react'
// FIX 1: Import type-only chống lỗi verbatimModuleSyntax
import type { SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'
import { Alert, Button, Card, TextField, AuthShell } from '@/components'
import { getApiErrorMessage } from '@/utils'

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

  // FIX 3: Định nghĩa SyntheticEvent cho e
  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)
    try {
      await register({ fullName, email, password, phoneNumber })
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please check your information.'))
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
      className="bg-transparent border-0 text-text-muted cursor-pointer grid place-items-center p-0"
    >
      {togglePwdIcon(visible)}
    </button>
  )

  return (
    <AuthShell
      eyebrow="Create Account"
      title="Start Your Journey."
      description="Sign up to access the smart e-scooter network, manage your wallet, and rent history — all in one place."
    >
      <Card variant="glow">
        <form className="grid gap-[1.1rem]" onSubmit={handleSubmit}>
          <div className="grid gap-2 mb-2">
            <h2 className="m-0 text-[2.1rem] tracking-[-0.03em] bg-linear-to-br from-white to-cyan-soft bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="m-0 text-(--text-muted) leading-[1.6]">
              Fill in your information to create a new customer account.
            </p>
          </div>

          {error && <Alert tone="error">{error}</Alert>}

          <TextField
            label="Full Name"
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
            placeholder="you@example.com"
            autoComplete="email"
            required
            leadingIcon={<Mail size={18} strokeWidth={1.7} />}
          />

          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="09xxxxxxxx"
            autoComplete="tel"
            required
            leadingIcon={<Phone size={18} strokeWidth={1.7} />}
          />

          <TextField
            label="Password"
            type={showPwd ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters, with uppercase, lowercase, and numbers"
            autoComplete="new-password"
            helpText="At least 8 characters, with uppercase, lowercase, and numbers."
            required
            leadingIcon={<Lock size={18} strokeWidth={1.7} />}
            trailingAction={eyeButton(showPwd, setShowPwd, 'Show/Hide password')}
          />

          <TextField
            label="Confirm Password"
            type={showConfirmPwd ? 'text' : 'password'}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Enter password again for confirmation"
            autoComplete="new-password"
            required
            leadingIcon={<Lock size={18} strokeWidth={1.7} />}
            trailingAction={eyeButton(showConfirmPwd, setShowConfirmPwd, 'Show/Hide confirm password')}
          />

          <div className="flex flex-col gap-[0.8rem]">
            <Button
              type="submit"
              disabled={loading}
              leadingIcon={<UserPlus size={18} strokeWidth={1.8} />}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <p className="m-0 text-(--text-muted) text-[0.92rem] leading-[1.6] text-center">
              Already have an account?{' '}
              <Link className="text-cyan-soft font-bold relative transition-colors duration-200 ease-in-out hover:text-white hover:[text-shadow:0_0_12px_var(--color-cyan)]" to={ROUTES.LOGIN}>
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </AuthShell>
  )
}