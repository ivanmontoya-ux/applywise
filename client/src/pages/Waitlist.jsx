import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  FileText,
  LockKeyhole,
  Mail,
} from 'lucide-react'
import BrandLogo from '../components/BrandLogo'
import { fetchWaitlistStats, joinWaitlist } from '../lib/api'
import { createWaitlistSignup, isSupabaseConfigured } from '../lib/supabase'

const roleOptions = [
  'Business analyst',
  'Finance analyst',
  'Junior consultant',
  'Marketing associate',
  'Product or operations',
  'Graduate scheme',
  'Early-career tech role',
]

const needOptions = [
  'Tracking applications',
  'Finding better-fit jobs',
  'Tailoring CVs',
  'Cover letters',
  'Deadlines and follow-ups',
]

const pageStyle = {
  minHeight: '100dvh',
  background: 'var(--color-bg-page)',
  color: 'var(--color-text-primary)',
}
const shellStyle = {
  maxWidth: 1180,
  margin: '0 auto',
  padding: '28px 32px 46px',
}
const navStyle = {
  minHeight: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '18px',
  marginBottom: '54px',
}
const primaryButtonStyle = {
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  padding: '0 16px',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '800',
  cursor: 'pointer',
  textDecoration: 'none',
  boxShadow: 'var(--shadow-primary)',
  transition: 'background 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease',
}
const secondaryLinkStyle = {
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  boxShadow: 'var(--shadow-sm)',
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

function ProductPreview() {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      background: '#ffffff',
      boxShadow: 'var(--shadow-md)',
      padding: '18px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0 }}>Today</p>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '3px' }}>3 applications need action</h2>
        </div>
        <span style={{ minHeight: 28, display: 'inline-flex', alignItems: 'center', padding: '0 9px', borderRadius: '6px', background: '#edf7f7', color: 'var(--color-applied-teal)', fontSize: '12px', fontWeight: '800' }}>
          Private beta
        </span>
      </div>

      <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
        {[
          ['Follow up', 'BCG Graduate Consultant', 'Applied'],
          ['Review CV evidence', 'Revolut Analyst', 'Saved'],
          ['Add deadline', 'Deloitte Graduate Scheme', 'Assessment'],
        ].map(([action, role, status]) => (
          <article key={role} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', background: '#fbfdff' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-applied-teal)', marginBottom: '3px' }}>{action}</p>
              <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{role}</p>
            </div>
            <span style={{ minHeight: 24, display: 'inline-flex', alignItems: 'center', padding: '0 8px', border: '1px solid var(--color-border)', borderRadius: '6px', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: '800' }}>
              {status}
            </span>
          </article>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
        {[
          ['Saved', '4'],
          ['Applied', '7'],
          ['Interview', '2'],
        ].map(([label, value]) => (
          <div key={label} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', background: '#ffffff' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: 1 }}>{value}</p>
            <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Benefit({ icon: Icon, title, copy }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <span style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: '#edf7f7', color: 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} strokeWidth={2.4} />
      </span>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>{copy}</p>
      </div>
    </div>
  )
}

export default function Waitlist() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    location: '',
    targetRole: roleOptions[0],
    strongestNeed: needOptions[0],
    consent: false,
  })
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [stats, setStats] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchWaitlistStats()
      .then(data => { if (!cancelled) setStats(data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (status.type === 'error') setStatus({ type: 'idle', message: '' })
  }

  async function syncToSupabase(signup) {
    if (!isSupabaseConfigured) return { skipped: true }
    try {
      await createWaitlistSignup({
        ...signup,
        source: 'react_waitlist',
        metadata: { app: 'applywise-react' },
      })
      return { synced: true }
    } catch (error) {
      const message = String(error?.message || '').toLowerCase()
      if (message.includes('duplicate') || message.includes('unique') || message.includes('23505')) {
        return { duplicate: true }
      }
      return { error }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const email = form.email.trim().toLowerCase()

    if (!email) {
      setStatus({ type: 'error', message: 'Add a valid email to join the waitlist.' })
      return
    }

    if (!form.consent) {
      setStatus({ type: 'error', message: 'Confirm consent before joining the waitlist.' })
      return
    }

    setSaving(true)
    setStatus({ type: 'idle', message: '' })

    const signup = {
      email,
      full_name: form.fullName.trim(),
      fullName: form.fullName.trim(),
      location: form.location.trim(),
      target_role: form.targetRole,
      targetRole: form.targetRole,
      strongest_need: form.strongestNeed,
      strongestNeed: form.strongestNeed,
      source: 'react_waitlist',
      consent: true,
    }

    try {
      const result = await joinWaitlist(signup)
      const cloud = result?.existing ? { skipped: true } : await syncToSupabase(signup)
      const nextStats = await fetchWaitlistStats().catch(() => null)
      if (nextStats) setStats(nextStats)

      if (result?.existing || cloud.duplicate) {
        setStatus({ type: 'info', message: 'This email is already on the waitlist.' })
      } else if (cloud.error) {
        setStatus({ type: 'success', message: 'You are on the local waitlist. Supabase sync needs checking.' })
      } else {
        setStatus({ type: 'success', message: 'You are on the waitlist.' })
        setForm(prev => ({ ...prev, fullName: '', email: '', location: '', consent: false }))
      }
    } catch (error) {
      if (isSupabaseConfigured) {
        const cloud = await syncToSupabase(signup)
        if (cloud.synced || cloud.duplicate) {
          setStatus({ type: cloud.duplicate ? 'info' : 'success', message: cloud.duplicate ? 'This email is already on the waitlist.' : 'You are on the waitlist.' })
        } else {
          setStatus({ type: 'error', message: error?.response?.data?.error || 'Waitlist signup failed. Try again.' })
        }
      } else {
        setStatus({ type: 'error', message: error?.response?.data?.error || 'Waitlist signup failed. Try again.' })
      }
    } finally {
      setSaving(false)
    }
  }

  const feedbackColor = status.type === 'error'
    ? { bg: '#fef2f2', color: 'var(--color-danger)', border: '#fecaca' }
    : status.type === 'success'
      ? { bg: '#f0fdf4', color: 'var(--color-success)', border: '#bbf7d0' }
      : { bg: '#f8fafc', color: 'var(--color-info)', border: 'var(--color-border)' }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <nav style={navStyle}>
          <BrandLogo as={Link} to="/waitlist" width={168} />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link to="/login" style={secondaryLinkStyle}>Login</Link>
            <Link to="/signup" style={primaryButtonStyle}>Sign Up</Link>
          </div>
        </nav>

        <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '32px', alignItems: 'start' }}>
          <section>
            <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-applied-teal)', marginBottom: '14px' }}>
              ApplyWise waitlist
            </p>
            <h1 style={{ fontSize: 'clamp(2.75rem, 7vw, 5.5rem)', lineHeight: '1', fontWeight: '900', letterSpacing: '0', color: 'var(--color-text-primary)', maxWidth: '680px', marginBottom: '20px' }}>
              Find and track better job applications with less chaos.
            </h1>
            <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'var(--color-text-secondary)', maxWidth: '620px', marginBottom: '30px' }}>
              ApplyWise helps graduates find better-fit jobs, tailor applications, and track every opportunity in one private workspace.
            </p>

            <div style={{ display: 'grid', gap: '18px', marginBottom: '30px' }}>
              <Benefit icon={Briefcase} title="Find better-fit starting jobs" copy="Keep relevant roles and source links in one place instead of scattering them across tabs and spreadsheets." />
              <Benefit icon={ClipboardList} title="Track every application" copy="Move each opportunity from saved role to final outcome with status, deadlines, and next actions visible." />
              <Benefit icon={FileText} title="Tailor documents faster" copy="Use evidence-based CV and cover letter help without inventing experience." />
              <Benefit icon={LockKeyhole} title="Keep career data private" copy="CVs, notes, and application materials stay treated as private job-search data." />
            </div>

            <ProductPreview />
          </section>

          <aside style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            boxShadow: 'var(--shadow-md)',
            padding: '24px',
            position: 'sticky',
            top: 24,
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Join the Waitlist</h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>
                Tell us what you are applying for. This helps shape the private beta.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  value={form.fullName}
                  onChange={event => set('fullName', event.target.value)}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Email required</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={event => set('email', event.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Location</label>
                <input
                  value={form.location}
                  onChange={event => set('location', event.target.value)}
                  placeholder="Madrid, Spain"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Target role</label>
                  <select value={form.targetRole} onChange={event => set('targetRole', event.target.value)} style={inputStyle}>
                    {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Main need</label>
                  <select value={form.strongestNeed} onChange={event => set('strongestNeed', event.target.value)} style={inputStyle}>
                    {needOptions.map(need => <option key={need} value={need}>{need}</option>)}
                  </select>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: '1.45' }}>
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={event => set('consent', event.target.checked)}
                  style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--color-applied-teal)' }}
                />
                I agree to be contacted about ApplyWise beta access. ApplyWise will use this information only for beta and product research.
              </label>

              {status.type !== 'idle' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '11px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${feedbackColor.border}`, background: feedbackColor.bg, color: feedbackColor.color, fontSize: '13px', lineHeight: '1.45' }}>
                  {status.type === 'success' ? <CheckCircle2 size={16} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 2 }} /> : <Mail size={16} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 2 }} />}
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                style={{ ...primaryButtonStyle, width: '100%', opacity: saving ? 0.65 : 1, cursor: saving ? 'default' : 'pointer' }}
              >
                {saving ? 'Joining...' : 'Join the Waitlist'}
                {!saving && <ArrowRight size={16} strokeWidth={2.5} />}
              </button>
            </form>

            <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid var(--color-border)', display: 'grid', gap: '8px' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                <LockKeyhole size={14} strokeWidth={2.4} color="var(--color-applied-teal)" />
                Private beta list. No application auto-submission.
              </p>
              {stats?.total > 0 && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Current local waitlist signups: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', fontWeight: '800' }}>{stats.total}</span>
                </p>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}
