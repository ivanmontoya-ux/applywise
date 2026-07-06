import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  Check,
  ExternalLink,
  Inbox,
  Link2Off,
  Lock,
  Mail,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { APPLICATION_STATUSES } from '../lib/application'
import {
  approveGmailSuggestion,
  deleteImportedGmailEmail,
  disconnectGmail,
  fetchGmailStatus,
  fetchGmailSuggestions,
  fetchTracker,
  rejectGmailSuggestion,
  startGmailConnect,
  syncGmail,
  updateGmailSuggestion,
} from '../lib/api'

const pageStyle = { padding: '36px 40px', maxWidth: '1160px' }
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '760px' }
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
  gap: '9px',
  padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-applied-teal)',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '800',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-primary)',
  transition: 'background 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease',
}
const secondaryButtonStyle = {
  minHeight: 42,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-sm)',
}
const inputStyle = {
  width: '100%',
  minHeight: 38,
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  padding: '8px 10px',
  fontSize: '13px',
}
const labelStyle = {
  display: 'block',
  fontSize: '11px',
  color: 'var(--color-text-muted)',
  fontWeight: '800',
  textTransform: 'uppercase',
  marginBottom: '5px',
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
    application_submitted: 'Application submitted',
    application_confirmation: 'Application confirmation',
    interview_invitation: 'Interview invitation',
    assessment_invitation: 'Assessment or test',
    rejection: 'Rejection',
    offer: 'Offer',
    follow_up_needed: 'Follow-up needed',
    recruiter_communication: 'Recruiter communication',
    general_application_update: 'Application update',
    user_sent_application_email: 'Sent application email',
  }
  return labels[type] || 'Application email'
}

function confidenceLabel(value) {
  const score = Math.round(Number(value || 0) * 100)
  if (score >= 82) return `${score}% high confidence`
  if (score >= 65) return `${score}% medium confidence`
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
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55', maxWidth: 470 }}>
          {connected
            ? 'Scan Gmail to review recent Inbox and Sent messages that look like real application activity.'
            : 'Connect Gmail to bring application emails into your ApplyWise workspace for review.'}
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  )
}

function DirectionBadge({ direction }) {
  const outbound = direction === 'outbound'
  const Icon = outbound ? Send : Inbox
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      minHeight: 24,
      padding: '0 8px',
      borderRadius: '999px',
      background: outbound ? '#f8fafc' : '#edf7f7',
      border: outbound ? '1px solid var(--color-border)' : '1px solid #cfe7e8',
      color: outbound ? 'var(--color-info)' : 'var(--color-applied-teal)',
      fontSize: '11px',
      fontWeight: '800',
    }}>
      <Icon size={12} strokeWidth={2.4} />
      {outbound ? 'Sent' : 'Inbox'}
    </span>
  )
}

function SuggestionCard({ suggestion, applications, busy, onApprove, onReject, onSave, onDelete }) {
  const initialDraft = useMemo(() => ({
    application_id: suggestion.application ? suggestion.application_id || '' : '',
    suggested_company: suggestion.suggested_company || suggestion.email?.company || '',
    suggested_role: suggestion.suggested_role || suggestion.email?.job_title || '',
    suggested_status: suggestion.suggested_status || '',
    suggested_action_required: suggestion.suggested_action_required || suggestion.email?.action_required || '',
  }), [suggestion])
  const [draft, setDraft] = useState(initialDraft)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setDraft(initialDraft)
  }, [initialDraft])

  const hasLinkedApplication = Boolean(draft.application_id || suggestion.application)
  const canCreateApplication = !hasLinkedApplication
  const statusColor = draft.suggested_status === 'Rejected'
    ? 'var(--color-danger)'
    : draft.suggested_status === 'Offer'
      ? 'var(--color-success)'
      : 'var(--color-applied-teal)'
  const recipients = suggestion.email?.recipient_emails || []
  const sourceLine = suggestion.email?.direction === 'outbound'
    ? `To ${recipients.map(item => item.email).filter(Boolean).slice(0, 2).join(', ') || 'recipient unknown'}`
    : `${suggestion.email?.sender_name || suggestion.email?.sender_email || suggestion.email?.from_email || 'Sender unknown'}`

  function updateDraft(field, value) {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  return (
    <article style={{ ...panelStyle, padding: '18px', display: 'grid', gap: '15px' }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 520px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <DirectionBadge direction={suggestion.email?.direction} />
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
            {draft.suggested_status && (
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
                Suggest {draft.suggested_status}
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
              {confidenceLabel(suggestion.confidence || suggestion.email?.confidence)}
            </span>
          </div>

          <h3 style={{ fontSize: '16px', lineHeight: '1.35', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', overflowWrap: 'anywhere' }}>
            {suggestion.suggested_title}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55', maxWidth: 780 }}>
            {suggestion.suggested_body}
          </p>
        </div>

        {suggestion.email?.gmail_url && (
          <a
            href={suggestion.email.gmail_url}
            target="_blank"
            rel="noreferrer"
            style={{ ...secondaryButtonStyle, minHeight: 34, textDecoration: 'none' }}
          >
            <ExternalLink size={14} strokeWidth={2.4} />
            Gmail
          </a>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '12px' }}>
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
          <p style={labelStyle}>Source email</p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '700', marginBottom: '3px', overflowWrap: 'anywhere' }}>
            {suggestion.email?.subject || 'No subject'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.45', overflowWrap: 'anywhere' }}>
            {sourceLine} - {formatDate(suggestion.email?.received_at)}
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
          <p style={labelStyle}>Application match</p>
          {suggestion.application ? (
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
              No certain tracker match. Create a new manual application from this email, or choose an existing application in Edit if you know it fits.
            </p>
          )}
        </div>
      </div>

      {!suggestion.application && (
        <Notice tone="warning">
          ApplyWise did not connect this email to a current application because the match was not certain enough.
        </Notice>
      )}

      {(suggestion.email?.deadline_or_event_date || suggestion.email?.action_required) && (
        <div style={{ borderLeft: '3px solid #cfe7e8', paddingLeft: '12px' }}>
          {suggestion.email?.deadline_or_event_date && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '800', marginBottom: '4px' }}>
              Date/detail: {suggestion.email.deadline_or_event_date}
            </p>
          )}
          {suggestion.email?.action_required && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
              {suggestion.email.action_required}
            </p>
          )}
        </div>
      )}

      {suggestion.email?.detection_reasons?.length > 0 && (
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
          <p style={labelStyle}>Detected because</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {suggestion.email.detection_reasons.slice(0, 6).map((reason, index) => (
              <span
                key={`${reason}-${index}`}
                style={{
                  border: '1px solid #cfe7e8',
                  background: '#edf7f7',
                  color: 'var(--color-applied-teal)',
                  borderRadius: '999px',
                  padding: '5px 8px',
                  fontSize: '12px',
                  fontWeight: '700',
                }}
              >
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {suggestion.email?.snippet && (
        <p style={{
          borderLeft: '3px solid var(--color-border)',
          paddingLeft: '12px',
          color: 'var(--color-text-secondary)',
          fontSize: '13px',
          lineHeight: '1.5',
          overflowWrap: 'anywhere',
        }}>
          {suggestion.email.snippet}
        </p>
      )}

      {editing && (
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px', display: 'grid', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }}>
            <Field label="Tracked application">
              <select
                value={draft.application_id}
                onChange={event => updateDraft('application_id', event.target.value)}
                style={inputStyle}
              >
                <option value="">Create new application from email</option>
                {applications.map(application => (
                  <option key={application.id} value={application.id}>
                    {application.title} at {application.company}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Suggested status">
              <select
                value={draft.suggested_status}
                onChange={event => updateDraft('suggested_status', event.target.value)}
                style={inputStyle}
              >
                <option value="">No status change</option>
                {APPLICATION_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </Field>
            <Field label="Company">
              <input
                value={draft.suggested_company}
                onChange={event => updateDraft('suggested_company', event.target.value)}
                style={inputStyle}
                placeholder="Company name"
              />
            </Field>
            <Field label="Role">
              <input
                value={draft.suggested_role}
                onChange={event => updateDraft('suggested_role', event.target.value)}
                style={inputStyle}
                placeholder="Role title"
              />
            </Field>
          </div>
          <Field label="Action required">
            <textarea
              value={draft.suggested_action_required}
              onChange={event => updateDraft('suggested_action_required', event.target.value)}
              style={{ ...inputStyle, minHeight: 74, resize: 'vertical' }}
              placeholder="What should happen next?"
            />
          </Field>
          <button type="button" onClick={() => onSave(suggestion.id, draft)} disabled={busy} style={{ ...secondaryButtonStyle, justifySelf: 'start' }}>
            <Save size={15} strokeWidth={2.4} />
            Save edits
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => onDelete(suggestion.email_import_event_id)}
          disabled={busy}
          style={{ ...secondaryButtonStyle, color: 'var(--color-danger)', opacity: busy ? 0.65 : 1 }}
        >
          <Trash2 size={15} strokeWidth={2.4} />
          Delete record
        </button>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setEditing(prev => !prev)}
            disabled={busy}
            style={{ ...secondaryButtonStyle, opacity: busy ? 0.65 : 1 }}
          >
            {editing ? 'Close edits' : 'Edit'}
          </button>
          <button
            type="button"
            onClick={() => onReject(suggestion.id)}
            disabled={busy}
            style={{ ...secondaryButtonStyle, color: 'var(--color-text-secondary)', opacity: busy ? 0.65 : 1 }}
          >
            <X size={15} strokeWidth={2.5} />
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => onApprove(suggestion.id, {
              ...draft,
              application_id: draft.application_id || null,
              create_if_missing: canCreateApplication,
            })}
            disabled={busy}
            style={{ ...primaryButtonStyle, opacity: busy ? 0.65 : 1 }}
          >
            <Check size={15} strokeWidth={2.5} />
            {hasLinkedApplication ? 'Apply update' : 'Create application from email'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function EmailImport() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [gmailStatus, setGmailStatus] = useState({ connected: false, pending_suggestions: 0, imported_emails: 0 })
  const [suggestions, setSuggestions] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const connected = Boolean(gmailStatus.connected)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const status = await fetchGmailStatus()
      setGmailStatus(status || { connected: false, pending_suggestions: 0, imported_emails: 0 })
      if (auth.session) {
        const [rows, trackerRows] = await Promise.all([
          fetchGmailSuggestions('pending'),
          fetchTracker('All'),
        ])
        setSuggestions(Array.isArray(rows) ? rows : [])
        setApplications(Array.isArray(trackerRows) ? trackerRows : [])
      } else {
        setSuggestions([])
        setApplications([])
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
      setNotice('Gmail is connected. You can scan Inbox and Sent emails now.')
      setSearchParams({}, { replace: true })
    }
    if (result === 'error') {
      setError(searchParams.get('message') || 'Gmail connection failed.')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const pendingLabel = useMemo(() => {
    const pending = Number(gmailStatus.pending_suggestions || suggestions.length || 0)
    const imported = Number(gmailStatus.imported_emails || 0)
    const pendingText = pending === 1 ? '1 pending suggestion' : `${pending} pending suggestions`
    const importedText = imported === 1 ? '1 imported email' : `${imported} imported emails`
    return `${pendingText} - ${importedText}`
  }, [gmailStatus.pending_suggestions, gmailStatus.imported_emails, suggestions.length])

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
      setNotice(`Scan complete: ${result.imported || 0} new emails imported, ${result.suggestions_created || 0} suggestions created, ${result.suppressed || 0} weak matches ignored.`)
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

  async function handleSave(id, patch) {
    setBusyId(`save-${id}`)
    setError('')
    try {
      await updateGmailSuggestion(id, patch)
      setNotice('Suggested update saved.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not save this suggestion.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleApprove(id, payload) {
    setBusyId(`approve-${id}`)
    setError('')
    try {
      const result = await approveGmailSuggestion(id, payload)
      setNotice(result.created ? 'New tracked application created from Gmail.' : 'Tracker updated from Gmail suggestion.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not approve this suggestion.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(id) {
    setBusyId(`reject-${id}`)
    setError('')
    try {
      await rejectGmailSuggestion(id)
      setNotice('Email suggestion dismissed.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not dismiss this suggestion.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(emailImportEventId) {
    setBusyId(`delete-${emailImportEventId}`)
    setError('')
    try {
      await deleteImportedGmailEmail(emailImportEventId)
      setNotice('Imported email record deleted from ApplyWise.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not delete this imported email.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '18px', marginBottom: '26px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={titleStyle}>Email</h1>
          <p style={subtitleStyle}>
            Review Gmail messages that look like real job application activity across Inbox and Sent.
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

          {connected && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                ApplyWise uses read-only Gmail access for application tracking only. Gmail data stays in your workspace, is not shared with recruiters or companies, and can be disconnected or deleted from this page.
              </p>
            </div>
          )}
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
                applications={applications}
                busy={Boolean(busyId)}
                onApprove={handleApprove}
                onReject={handleReject}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
