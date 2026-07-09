import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import {
  deleteImportedGmailEmails,
  deletePersonalInformation,
  disconnectGmail,
  fetchConfigStatus,
  fetchGmailStatus,
} from '../lib/api'

const pageStyle = { padding: '36px 40px', maxWidth: '1180px' }
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '760px' }
const panelStyle = {
  background: '#ffffff',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}
const secondaryButtonStyle = {
  minHeight: 40,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  padding: '0 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-sm)',
}
const dangerButtonStyle = {
  ...secondaryButtonStyle,
  color: 'var(--color-danger)',
}

function StatusCard({ title, copy, configured, missing = [], detail }) {
  return (
    <article style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px', background: '#fbfdff' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '3px' }}>{title}</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>{copy}</p>
        </div>
        <span style={{
          minHeight: 26,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 9px',
          borderRadius: '999px',
          border: `1px solid ${configured ? '#bbf7d0' : '#fed7aa'}`,
          background: configured ? '#f0fdf4' : '#fff7ed',
          color: configured ? 'var(--color-success)' : 'var(--color-warning)',
          fontSize: '12px',
          fontWeight: '800',
          whiteSpace: 'nowrap',
        }}>
          {configured ? <CheckCircle2 size={13} strokeWidth={2.5} /> : <AlertCircle size={13} strokeWidth={2.5} />}
          {configured ? 'Ready' : 'Needs setup'}
        </span>
      </div>
      {missing.length > 0 && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.45' }}>
          Add to local env: <strong>{missing.join(', ')}</strong>
        </p>
      )}
      {detail && (
        <p style={{ marginTop: '7px', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.45' }}>{detail}</p>
      )}
    </article>
  )
}

function PrivacyAction({ icon: Icon, title, copy, action, disabled, onClick, busy }) {
  return (
    <article style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px', background: '#fbfdff' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--color-applied-teal-soft)', color: 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={17} strokeWidth={2.4} />
          </span>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>{copy}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled || busy}
          style={{
            ...dangerButtonStyle,
            opacity: disabled || busy ? 0.55 : 1,
            cursor: disabled || busy ? 'default' : 'pointer',
            flexShrink: 0,
          }}
        >
          {busy ? <RefreshCw size={14} strokeWidth={2.4} /> : <Trash2 size={14} strokeWidth={2.4} />}
          {busy ? 'Working...' : action}
        </button>
      </div>
    </article>
  )
}

export default function Settings() {
  const auth = useAuth()
  const [config, setConfig] = useState(null)
  const [gmailStatus, setGmailStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function loadSettings() {
    setLoading(true)
    setError('')
    try {
      const [configData, gmailData] = await Promise.all([
        fetchConfigStatus(),
        auth.session ? fetchGmailStatus().catch(() => null) : Promise.resolve(null),
      ])
      setConfig(configData)
      setGmailStatus(gmailData)
    } catch {
      setError('Could not load setup status. Make sure the local server is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.session])

  const requiredItems = useMemo(() => {
    if (!config) return []
    return [
      {
        key: 'client_supabase',
        title: 'Client Supabase',
        copy: 'Lets the browser handle signup, login, and session refresh.',
        configured: auth.configured,
        missing: auth.configured ? [] : ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'],
      },
      ...Object.entries(config.required || {}).map(([key, item]) => ({ key, title: item.label, copy: key === 'gemini' ? 'Powers CV extraction, CV recommendations, cover letters, and job matching.' : 'Lets the server verify sessions and store user-scoped records.', ...item })),
    ]
  }, [auth.configured, config])

  const optionalItems = useMemo(() => (
    Object.entries(config?.optional || {}).map(([key, item]) => ({
      key,
      title: item.label,
      copy: key === 'adzuna'
        ? 'Refreshes the shared job list from live job data.'
        : key === 'gmail'
          ? 'Connects read-only Gmail scanning for application updates.'
          : 'Sends scheduled application overview emails.',
      detail: key === 'gmail' && !item.token_encryption_configured ? 'Also add GMAIL_TOKEN_ENCRYPTION_KEY for safer token storage.' : '',
      ...item,
    }))
  ), [config])

  async function runAction(actionName, fn, success) {
    setBusy(actionName)
    setNotice('')
    setError('')
    try {
      const result = await fn()
      setNotice(typeof success === 'function' ? success(result) : success)
      await loadSettings()
    } catch (err) {
      setError(err?.response?.data?.error || 'That action could not be completed yet.')
    } finally {
      setBusy('')
    }
  }

  function clearCoachingHistory() {
    try { localStorage.removeItem('applywise-coach-history') } catch {}
    setNotice('Coaching history cleared from this browser.')
  }

  return (
    <div style={pageStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div>
          <h1 style={titleStyle}>Settings</h1>
          <p style={subtitleStyle}>Setup checks, privacy controls, and local demo diagnostics for ApplyWise.</p>
        </div>
        <Link to="/documents" style={{ ...secondaryButtonStyle, textDecoration: 'none' }}>
          <ExternalLink size={14} strokeWidth={2.4} />
          Continue workflow
        </Link>
      </header>

      {error && (
        <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', background: '#fef2f2', color: 'var(--color-danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}
      {notice && (
        <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', background: '#f0fdf4', color: 'var(--color-success)', fontSize: '14px', fontWeight: '700' }}>
          {notice}
        </div>
      )}

      <div style={{ display: 'grid', gap: '18px' }}>
        <section style={{ ...panelStyle, padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-applied-teal-soft)', color: 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound size={18} strokeWidth={2.4} />
            </span>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '3px' }}>Demo setup checklist</h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>No secret values are shown here. This only checks whether each local variable exists.</p>
            </div>
          </div>

          {loading ? (
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Checking local setup...</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '12px' }}>
                {requiredItems.map(item => <StatusCard key={item.key} {...item} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '12px' }}>
                {optionalItems.map(item => <StatusCard key={item.key} {...item} />)}
              </div>
            </div>
          )}

          <div style={{ marginTop: '16px', padding: '12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fbfdff' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
              Teammates should copy `server/.env.example` to `server/.env`, copy `client/.env.example` to `client/.env`, fill the values, and restart `npm run dev`. Full steps are in <strong>SETUP.md</strong>.
            </p>
          </div>
        </section>

        <section style={{ ...panelStyle, padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-applied-teal-soft)', color: 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} strokeWidth={2.4} />
            </span>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '3px' }}>Privacy controls</h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>Delete private profile, Gmail, and coaching data when you do not want ApplyWise to reuse it.</p>
            </div>
          </div>

          {!auth.session && (
            <div style={{ marginBottom: '14px', padding: '12px', border: '1px solid #fed7aa', borderRadius: 'var(--radius-md)', background: '#fff7ed', color: '#9a3412', fontSize: '13px', lineHeight: '1.45' }}>
              Log in to manage server-stored data. Coaching history can still be cleared from this browser.
            </div>
          )}

          <div style={{ display: 'grid', gap: '12px' }}>
            <PrivacyAction
              icon={UserRound}
              title="Clear Personal Information"
              copy="Deletes the saved CV profile used for job recommendations, cover letters, and coaching."
              action="Clear profile"
              disabled={!auth.session}
              busy={busy === 'profile'}
              onClick={() => {
                if (!window.confirm('Clear saved Personal Information from ApplyWise?')) return
                runAction('profile', deletePersonalInformation, 'Personal Information cleared.')
              }}
            />
            <PrivacyAction
              icon={Mail}
              title="Delete imported Gmail records"
              copy={`Deletes imported email records and email suggestions. Gmail connection: ${gmailStatus?.connected ? gmailStatus.gmail_email || 'connected' : 'not connected'}.`}
              action="Delete emails"
              disabled={!auth.session}
              busy={busy === 'gmail-records'}
              onClick={() => {
                if (!window.confirm('Delete all imported Gmail records and suggestions from ApplyWise?')) return
                runAction('gmail-records', deleteImportedGmailEmails, result => `${result.deleted || 0} imported Gmail record${result.deleted === 1 ? '' : 's'} deleted.`)
              }}
            />
            <PrivacyAction
              icon={Mail}
              title="Disconnect Gmail"
              copy="Removes the stored Gmail refresh token. Existing imported email records stay unless you delete them above."
              action="Disconnect"
              disabled={!auth.session || !gmailStatus?.connected}
              busy={busy === 'gmail-disconnect'}
              onClick={() => {
                if (!window.confirm('Disconnect Gmail from ApplyWise?')) return
                runAction('gmail-disconnect', disconnectGmail, 'Gmail disconnected.')
              }}
            />
            <PrivacyAction
              icon={ShieldCheck}
              title="Clear coaching history"
              copy="Clears the local coaching recommendation history stored in this browser."
              action="Clear history"
              busy={false}
              onClick={() => {
                if (!window.confirm('Clear coaching history from this browser?')) return
                clearCoachingHistory()
              }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
