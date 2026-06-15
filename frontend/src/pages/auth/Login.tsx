// Trang Đăng nhập — Tech Blue Luxury (tiếng Việt).
// Sử dụng `useAuth().login()` → gọi POST /api/auth/login qua features/auth.
import { useState } from 'react'
// FIX 1: Thêm type-only import cho SyntheticEvent chống lỗi verbatimModuleSyntax
import type { SyntheticEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react'

import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { Alert, Button, Card, TextField, AuthShell } from '@/components'
import { getApiErrorMessage } from '@/utils'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  // FIX 2: Định nghĩa rõ state error có thể là string hoặc null
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // FIX 3: Thêm kiểu dữ liệu SyntheticEvent cho tham số e
  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      navigate(ROUTES.HOME, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your email and password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Semo • Tech Mobility"
      title="Welcome back."
      description="Log in to manage your electric scooter, trips, and wallet on a smart, safe, and luxurious interface."
    >
      <Card variant="glow">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2 mb-2">
            <h2 className="text-3xl tracking-[-0.03em] bg-linear-to-br from-white to-cyan-soft bg-clip-text text-transparent">
              Log in
            </h2>
            <p className="text-text-muted leading-[1.6]">
              Use your registered email and password to continue.
            </p>
          </div>

          {error && <Alert tone="error">{error}</Alert>}

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
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            leadingIcon={<Lock size={18} strokeWidth={1.7} />}
            trailingAction={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="bg-transparent border-0 text-(--text-muted) cursor-pointer grid place-items-center p-0"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.7} /> : <Eye size={18} strokeWidth={1.7} />}
              </button>
            }
          />

          <div className="flex flex-col gap-[0.8rem]">
            <Button
              type="submit"
              disabled={loading}
              leadingIcon={<LogIn size={18} strokeWidth={1.8} />}
              trailingIcon={!loading ? <ArrowRight size={18} strokeWidth={1.8} /> : null}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
            <p className="text-(--text-muted) text-[0.92rem] leading-[1.6] text-center">
              Don't have an account?{' '}
              <Link className="text-cyan-soft font-bold relative transition-colors duration-200 ease-in-out hover:text-white hover:[text-shadow:0_0_12px_var(--color-cyan)]" to={ROUTES.REGISTER}>
                Create a new account
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </AuthShell>
  )
}