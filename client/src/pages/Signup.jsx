import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Briefcase, CheckCircle2, UserPlus } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const pageStyle = {
  minHeight: '100dvh',
  display: 'grid',
  placeItems: 'center',
  background: 'var(--color-bg-page)',
  padding: '32px',
}
const panelStyle = {
  width: '100%',
  maxWidth: 460,
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
  gap: '8px',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '800',
  cursor: 'pointer',
}

export default function Signup() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!auth.configured) {
      setError('Supabase is not configured. Add the public Supabase URL and publishable key to client/.env.')
      return
    }

    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    if (password.length < 6) {
      setError('Use a password with at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const result = await auth.signup({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      })

      if (result.session) {
        navigate('/dashboard', { replace: true })
        return
      }

      setNotice('Account created. Check your email to confirm your login.')
    } catch (err) {
      setError(err?.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={pageStyle}>
      <section style={panelStyle}>
        <Link to="/waitlist" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', textDecoration: 'none', color: 'var(--color-text-primary)', fontWeight: '800', fontSize: '18px', marginBottom: '28px' }}>
          <Briefcase size={20} strokeWidth={2.5} color="var(--color-applied-teal)" />
          ApplyWise
        </Link>

        <div style={{ marginBottom: '22px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: 0 }}>
            Create your account
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>
            Save your applications, CV profile, and document work privately.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={event => setFullName(event.target.value)}
              placeholder="Your name"
              style={inputStyle}
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '11px 12px', borderRadius: 'var(--radius-md)', background: '#fff1f2', color: '#b91c1c', fontSize: '13px', lineHeight: '1.45' }}>
              <AlertCircle size={16} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 2 }} />
              {error}
            </div>
          )}

          {notice && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '11px 12px', borderRadius: 'var(--radius-md)', background: '#f0fdf4', color: '#15803d', fontSize: '13px', lineHeight: '1.45' }}>
              <CheckCircle2 size={16} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 2 }} />
              {notice}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.65 : 1 }}>
            <UserPlus size={15} strokeWidth={2.5} />
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: '18px', fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-applied-teal)', fontWeight: '800', textDecoration: 'none' }}>
            Log in
          </Link>
        </p>
      </section>
    </main>
  )
}
