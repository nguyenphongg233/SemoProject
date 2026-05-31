import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../constants/routes'
import { Alert, Button, Card, TextField } from '../../components/ui'
import { AuthShell } from '../../components/layout'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await register({ fullName, email, password, phoneNumber })
      // After successful registration, navigate to login page.
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) {
      // Server validation errors come back as a map of field->message or an ErrorResponse
      const resp = err?.response?.data
      if (resp && typeof resp === 'object') {
        // If it's a map of field errors, join their messages
        const messages = Object.values(resp).filter(Boolean)
        setError(messages.join('; ') || 'Registration failed')
      } else {
        setError(err?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Start managing the fleet."
      description="Register to access rentals, scooters, and maintenance in a secure, role-based workspace."
    >
      <Card>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__header">
            <h2 className="auth-form__title">Create account</h2>
            <p className="auth-form__subtitle">
              Fill in your details to create a customer account.
            </p>
          </div>

          {error && <Alert>{error}</Alert>}

          <TextField
            label="Full name"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyen Van A"
            autoComplete="name"
            required
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
          />

          <TextField
            label="Phone number"
            name="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="09xxxxxxxx"
            autoComplete="tel"
            required
          />

          <TextField
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            helpText="Use at least 8 characters."
            required
          />

          <TextField
            label="Confirm password"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />

          <div className="auth-form__actions">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </Button>
            <p className="auth-form__hint">
              Already have an account? <Link className="auth-form__link" to={ROUTES.LOGIN}>Sign in</Link>
            </p>
          </div>
        </form>
      </Card>
    </AuthShell>
  )
}
