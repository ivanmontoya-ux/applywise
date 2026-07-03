import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  Check,
  Inbox,
  Link2Off,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import {
  approveGmailSuggestion,
  disconnectGmail,
  fetchGmailStatus,
  fetchGmailSuggestions,
  rejectGmailSuggestion,
  startGmailConnect,
  syncGmail,
} from '../lib/api'

const pageStyle = { padding: '36px 40px', maxWidth: '1120px' }
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '720px' }
const panelStyle = {
  background: '#ffffff',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}
const primaryButtonStyle = {
  minHeight: 42,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-applied-teal)',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '800',
  cursor: 'pointer',
}
const secondaryButtonStyle = {
  minHeight: 42,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
}
const subtleButtonStyle = {
  ...secondaryButtonStyle,
  color: 'var(--color-text-secondary)',
  fontWeight: '700',
}
const noticeStyle = {
  padding: '12px 14px',
  borderRadius: 'var(--radius-md)',
  fontSize: '14px',
  lineHeight: '1.45',
}

function formatDate(value) {
  if (!value) return 'Date unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unknown'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function typeLabel(type) {
  const labels = {
    application_received: 'Application confirmation',
    interview_invite: 'Interview',
    assessment_invite: 'Assessment',
    rejection: 'Rejection',
    offer: 'Offer',
  }
  return labels[type] || 'Application email'
}

function confidenceLabel(value) {
  const score = Math.round(Number(value || 0) * 100)
  if (score >= 80) return `${score}% high confidence`
  if (score >= 60) return `${score}% medium confidence`
  return `${score}% needs review`
}

function Notice({ tone = 'info', children }) {
  const styles = {
    info: { border: '1px solid #cbd5e1', background: '#f8fafc', color: 'var(--color-info)' },
    success: { border: '1px solid #bbf7d0', background: '#f0fdf4', color: 'var(--color-success)' },
    warning: { border: '1px solid #fed7aa', background: '#fff7ed', color: 'var(--color-warning)' },
    error: { border: '1px solid #fecaca', background: '#fef2f2', color: 'var(--color-danger)' },
  }

  return <div style={{ ...noticeStyle, ...styles[tone] }}>{children}</div>
}

function EmptyState({ connected }) {
  return (
    <div style={{
      ...panelStyle,
      minHeight: 300,
      padding: '34px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '12px',
    }}>
      <span style={{
        width: 50,
        height: 50,
        borderRadius: 'var(--radius-md)',
        background: '#edf7f7',
        color: 'var(--color-applied-teal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Inbox size={23} strokeWidth={2.4} />
      </span>
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '5px' }}>
          {connected ? 'No email suggestions waiting.' : 'Gmail is not connected yet.'}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55', maxWidth: 440 }}>
          {connected
            ? 'Scan Gmail when you want ApplyWise to look for recent application confirmations, interviews, assessments, offers, and rejections.'
            : 'Connect Gmail to bring application emails into your ApplyWise workspace for review.'}
        </p>
      </div>
    </div>
  )
}

function SuggestionCard({ suggestion, busy, onApprove, onReject }) {
  const hasLinkedApplication = Boolean(suggestion.application)
  const statusColor = suggestion.suggested_status === 'Rejected'
    ? 'var(--color-danger)'
    : suggestion.suggested_status === 'Offer'
      ? 'var(--color-success)'
      : 'var(--color-applied-teal)'

  return (
    <article style={{ ...panelStyle, padding: '18px', display: 'grid', gap: '14px' }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 24,
              padding: '0 8px',
              borderRadius: '999px',
              background: '#edf7f7',
              color: 'var(--color-applied-teal)',
              fontSize: '11px',
              fontWeight: '800',
            }}>
              {typeLabel(suggestion.email?.detected_type)}
            </span>
            {suggestion.suggested_status && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 24,
                padding: '0 8px',
                borderRadius: '999px',
                background: '#f8fafc',
                border: '1px solid var(--color-border)',
                color: statusColor,
                fontSize: '11px',
                fontWeight: '800',
              }}>
                Move to {suggestion.suggested_status}
              </span>
            )}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 24,
              padding: '0 8px',
              borderRadius: '999px',
              background: '#f8fafc',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              fontSize: '11px',
              fontWeight: '700',
            }}>
              {confidenceLabel(suggestion.confidence)}
            </span>
          </div>

          <h3 style={{ fontSize: '16px', lineHeight: '1.35', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', overflowWrap: 'anywhere' }}>
            {suggestion.suggested_title}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55', maxWidth: 760 }}>
            {suggestion.suggested_body}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '10px' }}>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', background: '#fbfdff' }}>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Source email</p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '700', marginBottom: '3px', overflowWrap: 'anywhere' }}>
            {suggestion.email?.subject || 'No subject'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.45', overflowWrap: 'anywhere' }}>
            {suggestion.email?.from_email || 'Sender unknown'} - {formatDate(suggestion.email?.received_at)}
          </p>
        </div>

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', background: '#fbfdff' }}>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Application match</p>
          {hasLinkedApplication ? (
            <>
              <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '700', marginBottom: '3px' }}>
                {suggestion.application.title}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {suggestion.application.company} - Currently {suggestion.application.status}
              </p>
            </>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>
              No tracker item matched. Review the email before creating or linking an application.
            </p>
          )}
        </div>
      </div>

      {suggestion.email?.snippet && (
        <p style={{
          borderLeft: '3px solid #cfe7e8',
          paddingLeft: '12px',
          color: 'var(--color-text-secondary)',
          fontSize: '13px',
          lineHeight: '1.5',
          overflowWrap: 'anywhere',
        }}>
          {suggestion.email.snippet}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => onReject(suggestion.id)}
          disabled={busy}
          style={{ ...subtleButtonStyle, opacity: busy ? 0.65 : 1 }}
        >
          <X size={15} strokeWidth={2.5} />
          Dismiss
        </button>
        <button
          type="button"
          onClick={() => onApprove(suggestion.id)}
          disabled={busy}
          style={{ ...primaryButtonStyle, opacity: busy ? 0.65 : 1 }}
        >
          <Check size={15} strokeWidth={2.5} />
          {hasLinkedApplication ? 'Apply to tracker' : 'Mark reviewed'}
        </button>
      </div>
    </article>
  )
}

export default function EmailImport() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [gmailStatus, setGmailStatus] = useState({ connected: false, pending_suggestions: 0 })
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [busySuggestionId, setBusySuggestionId] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const connected = Boolean(gmailStatus.connected)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const status = await fetchGmailStatus()
      setGmailStatus(status || { connected: false, pending_suggestions: 0 })
      if (auth.session) {
        const rows = await fetchGmailSuggestions('pending')
        setSuggestions(Array.isArray(rows) ? rows : [])
      } else {
        setSuggestions([])
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not load Gmail integration.')
    } finally {
      setLoading(false)
    }
  }, [auth.session])

  useEffect(() => {
    if (!auth.loading) loadData()
  }, [auth.loading, loadData])

  useEffect(() => {
    const result = searchParams.get('gmail')
    if (result === 'connected') {
      setNotice('Gmail is connected. You can scan recent application emails now.')
      setSearchParams({}, { replace: true })
    }
    if (result === 'error') {
      setError(searchParams.get('message') || 'Gmail connection failed.')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const pendingLabel = useMemo(() => {
    const count = Number(gmailStatus.pending_suggestions || suggestions.length || 0)
    if (count === 1) return '1 pending suggestion'
    return `${count} pending suggestions`
  }, [gmailStatus.pending_suggestions, suggestions.length])

  async function handleConnect() {
    if (!auth.session) {
      navigate('/login')
      return
    }

    setError('')
    try {
      const data = await startGmailConnect()
      if (data?.url) window.location.href = data.url
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not start Gmail connection.')
    }
  }

  async function handleSync() {
    setSyncing(true)
    setError('')
    setNotice('')
    try {
      const result = await syncGmail()
      setNotice(`Scan complete: ${result.imported || 0} new emails imported and ${result.suggestions_created || 0} suggestions created.`)
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not scan Gmail.')
    } finally {
      setSyncing(false)
    }
  }

  async function handleDisconnect() {
    setError('')
    setNotice('')
    try {
      await disconnectGmail()
      setNotice('Gmail has been disconnected from ApplyWise.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not disconnect Gmail.')
    }
  }

  async function handleApprove(id) {
    setBusySuggestionId(id)
    setError('')
    try {
      await approveGmailSuggestion(id)
      setNotice('Email suggestion reviewed.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not approve this suggestion.')
    } finally {
      setBusySuggestionId(null)
    }
  }

  async function handleReject(id) {
    setBusySuggestionId(id)
    setError('')
    try {
      await rejectGmailSuggestion(id)
      setNotice('Email suggestion dismissed.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not dismiss this suggestion.')
    } finally {
      setBusySuggestionId(null)
    }
  }

  return (
    <div style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '18px', marginBottom: '26px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={titleStyle}>Email</h1>
          <p style={subtitleStyle}>
            Bring application confirmations, interviews, assessments, offers, and rejections from Gmail into ApplyWise.
          </p>
        </div>

        {auth.session && connected && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              style={{ ...primaryButtonStyle, opacity: syncing ? 0.72 : 1 }}
            >
              <RefreshCw size={15} strokeWidth={2.5} />
              {syncing ? 'Scanning...' : 'Scan Gmail'}
            </button>
            <button type="button" onClick={handleDisconnect} style={secondaryButtonStyle}>
              <Link2Off size={15} strokeWidth={2.4} />
              Disconnect
            </button>
          </div>
        )}
      </header>

      <div style={{ display: 'grid', gap: '16px' }}>
        {!auth.session && (
          <Notice tone="warning">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={15} strokeWidth={2.4} />
              Gmail import requires an account because emails and tracker updates must stay connected to one private workspace.
            </span>
            <span style={{ display: 'inline-flex', gap: '10px', marginLeft: '12px', flexWrap: 'wrap' }}>
              <Link to="/login" style={{ color: 'var(--color-text-primary)', fontWeight: '800' }}>Login</Link>
              <Link to="/signup" style={{ color: 'var(--color-text-primary)', fontWeight: '800' }}>Sign Up</Link>
            </span>
          </Notice>
        )}

        {notice && <Notice tone="success">{notice}</Notice>}
        {error && (
          <Notice tone="error">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={15} strokeWidth={2.4} />
              {error}
            </span>
          </Notice>
        )}

        <section style={{ ...panelStyle, padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <span style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#edf7f7',
                color: 'var(--color-applied-teal)',
                flexShrink: 0,
              }}>
                {connected ? <ShieldCheck size={20} strokeWidth={2.5} /> : <Mail size={20} strokeWidth={2.5} />}
              </span>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '3px' }}>
                  {connected ? 'Gmail connected' : 'Connect Gmail'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', overflowWrap: 'anywhere' }}>
                  {connected
                    ? `${gmailStatus.gmail_email || 'Connected account'} - ${pendingLabel}`
                    : 'Use read-only Gmail access to find application-related emails.'}
                </p>
              </div>
            </div>

            {auth.session && !connected && (
              <button type="button" onClick={handleConnect} style={primaryButtonStyle}>
                <Mail size={15} strokeWidth={2.5} />
                Connect Gmail
              </button>
            )}
          </div>
        </section>

        {loading ? (
          <section style={{ ...panelStyle, padding: '20px' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Loading email workspace...</p>
          </section>
        ) : suggestions.length === 0 ? (
          <EmptyState connected={connected} />
        ) : (
          <section style={{ display: 'grid', gap: '12px' }} aria-label="Email suggestions">
            {suggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                busy={busySuggestionId === suggestion.id}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
