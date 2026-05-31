import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '../../constants/routes'
import { ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { Alert, Button, Card, TextField } from '../../components/ui'
import { AuthShell } from '../../components/layout'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await login({ email, password })
      navigate(ROUTES.HOME, { replace: true })
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Member access"
      title="Welcome back."
      description="Sign in to manage scooters, rentals, maintenance logs, and analytics from one place."
    >
      <Card>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__header">
            <h2 className="auth-form__title">Sign in</h2>
            <p className="auth-form__subtitle">
              Use your registered email address and password to continue.
            </p>
          </div>

          {error && <Alert>{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <TextField
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <div className="auth-form__actions">
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
            <p className="auth-form__hint">
              New here? <Link className="auth-form__link" to={ROUTES.REGISTER}>Create an account</Link>
            </p>
          </div>
        </form>
      </Card>
    </AuthShell>
  )
}
