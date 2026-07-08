import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, LogIn } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import BrandLogo from '../components/BrandLogo'
import SocialAuthButtons from '../components/SocialAuthButtons'

const pageStyle = {
  minHeight: '100dvh',
  display: 'grid',
  placeItems: 'center',
  background: 'var(--color-bg-page)',
  padding: '32px',
}
const panelStyle = {
  width: '100%',
  maxWidth: 430,
  background: '#ffffff',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
  padding: '28px',
}
const inputStyle = {
  width: '100%',
  minHeight: 44,
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '9px 12px',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
  lineHeight: '1.5',
  outline: 'none',
}
const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '800',
  color: 'var(--color-text-secondary)',
  marginBottom: '6px',
}
const buttonStyle = {
  width: '100%',
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '800',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-primary)',
  transition: 'background 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease',
}

export default function Login() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/dashboard'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!auth.configured) {
      setError('Supabase is not configured. Add the public Supabase URL and publishable key to client/.env.')
      return
    }

    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    setLoading(true)
    try {
      const result = await auth.login({ email: email.trim().toLowerCase(), password })
      if (!result.session) {
        throw new Error('Login did not return a session. Check your email confirmation settings in Supabase.')
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={pageStyle}>
      <section style={panelStyle}>
        <BrandLogo as={Link} to="/waitlist" width={158} style={{ marginBottom: '28px' }} />

        <div style={{ marginBottom: '22px' }}>
          <h1 style={{ fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: 0 }}>
            Log in
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>
            Continue to your job-search dashboard.
          </p>
        </div>

        <SocialAuthButtons mode="login" redirectTo={redirectTo} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '10px', margin: '18px 0', color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: '800' }}>
          <span style={{ height: 1, background: 'var(--color-border)' }} />
          <span>or use email</span>
          <span style={{ height: 1, background: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Your password"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '11px 12px', borderRadius: 'var(--radius-md)', background: '#fff1f2', color: '#b91c1c', fontSize: '13px', lineHeight: '1.45' }}>
              <AlertCircle size={16} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 2 }} />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.65 : 1 }}>
            <LogIn size={15} strokeWidth={2.5} />
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p style={{ marginTop: '18px', fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          New to ApplyWise?{' '}
          <Link to="/signup" style={{ color: 'var(--color-applied-teal)', fontWeight: '800', textDecoration: 'none' }}>
            Create an account
          </Link>
        </p>
      </section>
    </main>
  )
}
