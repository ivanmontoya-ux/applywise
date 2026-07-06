import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  ListChecks,
  Mail,
  RefreshCw,
  Save,
  Sparkles,
} from 'lucide-react'
import { downloadCoverLetterDoc } from '../lib/documentExport'
import { fetchApplication, updateApplication } from '../lib/api'
import {
  APPLICATION_STATUSES,
  formatApplicationDate,
  getDocumentReadiness,
  getNextAction,
  getStatusStyle,
  isTerminalStatus,
} from '../lib/application'

const pageStyle = { padding: '36px 40px', maxWidth: '1180px' }
const panelStyle = {
  background: '#ffffff',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }
const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0',
  marginBottom: '6px',
}
const inputStyle = {
  width: '100%',
  minHeight: 44,
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '9px 12px',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '13px',
  outline: 'none',
}
const primaryButtonStyle = {
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  padding: '0 16px',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '800',
  textDecoration: 'none',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-primary)',
}
const secondaryButtonStyle = {
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
  cursor: 'pointer',
  boxShadow: 'var(--shadow-sm)',
}

function applicationLabel(application) {
  return [application?.title, application?.company].filter(Boolean).join(' at ') || 'this application'
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  const target = new Date(dateStr)
  if (Number.isNaN(target.getTime())) return null
  const ms = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

function Section({ icon: Icon, eyebrow, title, children, action }) {
  return (
    <section className="interactive-card" style={{ ...panelStyle, padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: '#edf7f7', color: 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={19} strokeWidth={2.4} />
          </span>
          <div>
            {eyebrow && <p style={labelStyle}>{eyebrow}</p>}
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>{title}</h2>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function StatusBadge({ status }) {
  const style = getStatusStyle(status)
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: 28,
      padding: '0 10px',
      borderRadius: '999px',
      border: `1px solid ${style.border}`,
      background: style.bg,
      color: style.color,
      fontSize: '12px',
      fontWeight: '800',
    }}>
      {status}
    </span>
  )
}

function SkeletonPanel() {
  return (
    <div style={{ ...panelStyle, padding: '28px', display: 'grid', gap: '12px' }}>
      <div className="skeleton-block" style={{ width: '35%', height: 18, borderRadius: 8 }} />
      <div className="skeleton-block" style={{ width: '70%', height: 12, borderRadius: 8 }} />
      <div className="skeleton-block" style={{ width: '55%', height: 12, borderRadius: 8 }} />
    </div>
  )
}

function buildTimeline(application) {
  const items = [
    application.date_saved && {
      label: 'Saved to tracker',
      date: formatApplicationDate(application.date_saved),
      copy: 'The role was added to ApplyWise.',
      icon: Briefcase,
    },
    application.cv_review && {
      label: 'CV fit analysis saved',
      date: application.cv_review.saved_at ? formatApplicationDate(application.cv_review.saved_at) : null,
      copy: 'Role-specific CV recommendations are attached to this application.',
      icon: FileText,
    },
    application.cover_letter && {
      label: 'Cover letter saved',
      date: application.cover_letter.saved_at ? formatApplicationDate(application.cover_letter.saved_at) : null,
      copy: 'A tailored cover letter draft is attached to this application.',
      icon: Mail,
    },
    application.date_applied && {
      label: 'Marked as applied',
      date: formatApplicationDate(application.date_applied),
      copy: 'The application moved beyond saved preparation.',
      icon: CheckCircle2,
    },
    application.deadline_date && {
      label: 'Application deadline',
      date: formatApplicationDate(application.deadline_date),
      copy: 'Use this date for reminders and planning.',
      icon: CalendarDays,
    },
    {
      label: `Current status: ${application.status || 'Saved'}`,
      date: null,
      copy: getNextAction(application),
      icon: ListChecks,
    },
  ].filter(Boolean)

  return items
}

function buildChecklist(application) {
  const readiness = getDocumentReadiness(application)
  return [
    { label: 'CV fit analysis', done: Boolean(application.cv_review), copy: application.cv_review ? 'Saved to this application.' : 'Generate role-specific CV recommendations.' },
    { label: 'Cover letter draft', done: Boolean(application.cover_letter), copy: application.cover_letter ? 'Saved and ready to export.' : 'Draft a cover letter for this role.' },
    { label: 'Deadline captured', done: Boolean(application.deadline_date || application.deadline_type === 'rolling'), copy: application.deadline_type === 'rolling' ? 'Rolling application noted.' : application.deadline_date ? `Apply by ${formatApplicationDate(application.deadline_date)}.` : 'Add a deadline or mark as rolling.' },
    { label: 'Tracker status reviewed', done: Boolean(application.status && application.status !== 'Saved'), copy: application.status === 'Saved' ? 'Update once you apply or receive a reply.' : `Current status is ${application.status}.` },
    { label: 'Document readiness', done: readiness === 'Complete', copy: `Readiness is ${readiness}.` },
  ]
}

function buildReminderSuggestions(application) {
  const deadlineDays = daysUntil(application.deadline_date)
  const suggestions = []

  if (!application.deadline_date && application.deadline_type !== 'rolling' && !isTerminalStatus(application.status)) {
    suggestions.push({
      title: 'Add missing deadline',
      copy: 'Recommended because reminders work best when ApplyWise knows the application deadline.',
      tone: 'warning',
    })
  }

  if (deadlineDays !== null && deadlineDays >= 0 && deadlineDays <= 7 && !isTerminalStatus(application.status)) {
    suggestions.push({
      title: `Deadline in ${deadlineDays === 0 ? 'today' : `${deadlineDays} day${deadlineDays === 1 ? '' : 's'}`}`,
      copy: 'Prepare the final CV, cover letter, and submission checklist before this date.',
      tone: 'warning',
    })
  }

  if (application.status === 'Applied') {
    suggestions.push({
      title: 'Follow-up reminder',
      copy: 'Recommended because applied roles should have a planned follow-up if no update arrives.',
      tone: 'neutral',
    })
  }

  if (application.status === 'Interview') {
    suggestions.push({
      title: 'Interview preparation reminder',
      copy: 'Recommended because this application is in the interview stage.',
      tone: 'neutral',
    })
  }

  if (!suggestions.length) {
    suggestions.push({
      title: 'No urgent reminder needed',
      copy: 'This application has no obvious deadline or follow-up risk right now.',
      tone: 'calm',
    })
  }

  return suggestions
}

function buildCoachSuggestions(application) {
  const suggestions = []
  const readiness = getDocumentReadiness(application)

  if (readiness !== 'Complete') {
    suggestions.push({
      title: 'Tailor documents before moving forward',
      copy: `Recommended because document readiness is ${readiness}.`,
      to: '/documents',
      label: 'Open Documents',
    })
  }
  if (application.status === 'Saved') {
    suggestions.push({
      title: 'Decide whether to apply',
      copy: 'Use the CV fit analysis and job description to decide if this role is worth preparing.',
      to: '/documents',
      label: 'Review fit',
    })
  }
  if (application.status === 'Applied') {
    suggestions.push({
      title: 'Prepare a follow-up email',
      copy: 'Recommended because the application has been submitted and may need a recruiter follow-up.',
      to: '/coach',
      label: 'Open Coach',
    })
  }
  if (application.status === 'Interview') {
    suggestions.push({
      title: 'Prepare STAR answer notes',
      copy: 'Use the role, CV evidence, and saved cover letter to prepare interview answers.',
      to: '/coach',
      label: 'Open Coach',
    })
  }
  if (!suggestions.length) {
    suggestions.push({
      title: 'Review this application weekly',
      copy: 'Keep the status, documents, and next action current as the application changes.',
      to: '/coach',
      label: 'Open Coach',
    })
  }

  return suggestions.slice(0, 3)
}

export default function ApplicationDetail() {
  const { id } = useParams()
  const [application, setApplication] = useState(null)
  const [draft, setDraft] = useState({ notes: '', deadline_type: '', deadline_date: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadApplication() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchApplication(id)
        if (cancelled) return
        setApplication(data)
        setDraft({
          notes: data.notes || '',
          deadline_type: data.deadline_type || '',
          deadline_date: data.deadline_date || '',
        })
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.error || 'Could not load this application.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadApplication()
    return () => { cancelled = true }
  }, [id])

  const timeline = useMemo(() => application ? buildTimeline(application) : [], [application])
  const checklist = useMemo(() => application ? buildChecklist(application) : [], [application])
  const reminders = useMemo(() => application ? buildReminderSuggestions(application) : [], [application])
  const coachSuggestions = useMemo(() => application ? buildCoachSuggestions(application) : [], [application])

  async function saveDraft(event) {
    event?.preventDefault()
    if (!application || saving) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const updated = await updateApplication(application.id, {
        notes: draft.notes,
        deadline_type: draft.deadline_type || null,
        deadline_date: draft.deadline_type === 'date' ? draft.deadline_date || null : null,
      })
      setApplication(updated)
      setNotice('Application details saved.')
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not save application details.')
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(status) {
    if (!application || status === application.status || saving) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const patch = { status }
      if (status === 'Applied' && !application.date_applied) {
        patch.date_applied = new Date().toISOString()
      }
      const updated = await updateApplication(application.id, patch)
      setApplication(updated)
      setNotice(`Status updated to ${status}.`)
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not update status.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <SkeletonPanel />
      </div>
    )
  }

  if (error && !application) {
    return (
      <div style={pageStyle}>
        <Link to="/tracker" style={{ ...secondaryButtonStyle, marginBottom: '18px' }}>
          <ArrowLeft size={15} strokeWidth={2.4} />
          Back to tracker
        </Link>
        <div style={{ ...panelStyle, padding: '28px', color: 'var(--color-danger)' }}>
          {error}
        </div>
      </div>
    )
  }

  if (!application) return null

  const statusStyle = getStatusStyle(application.status)
  const readiness = getDocumentReadiness(application)

  return (
    <div style={pageStyle}>
      <Link to="/tracker" className="secondary-action pressable" style={{ ...secondaryButtonStyle, marginBottom: '18px' }}>
        <ArrowLeft size={15} strokeWidth={2.4} />
        Back to tracker
      </Link>

      <header style={{ ...panelStyle, padding: '30px', marginBottom: '24px', borderTop: `4px solid ${statusStyle.accent}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '22px', flexWrap: 'wrap' }}>
          <div>
            <p style={labelStyle}>Application detail</p>
            <h1 style={titleStyle}>{application.title}</h1>
            <p style={subtitleStyle}>
              {[application.company, application.location, application.sector].filter(Boolean).join(' - ')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <StatusBadge status={application.status} />
            {application.url && (
              <a href={application.url} target="_blank" rel="noopener noreferrer" className="secondary-action pressable" style={secondaryButtonStyle}>
                <ExternalLink size={15} strokeWidth={2.4} />
                Source
              </a>
            )}
            <Link to="/documents" className="primary-action pressable" style={primaryButtonStyle}>
              <FileText size={15} strokeWidth={2.4} />
              Tailor documents
            </Link>
          </div>
        </div>
      </header>

      {(error || notice) && (
        <div style={{
          marginBottom: '18px',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? '#fecaca' : '#bbf7d0'}`,
          background: error ? '#fef2f2' : '#f0fdf4',
          color: error ? 'var(--color-danger)' : 'var(--color-success)',
          fontSize: '13px',
          fontWeight: '700',
        }}>
          {error || notice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.75fr)', gap: '22px', alignItems: 'start' }}>
        <main style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <Section icon={ListChecks} eyebrow="Current step" title="Status and application basics">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '22px' }}>
              {APPLICATION_STATUSES.map(status => {
                const active = status === application.status
                const style = getStatusStyle(status)
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => changeStatus(status)}
                    disabled={saving}
                    className="status-choice pressable"
                    style={{
                      minHeight: 34,
                      padding: '0 12px',
                      borderRadius: '999px',
                      border: active ? `1.5px solid ${style.border}` : '1.5px solid var(--color-border)',
                      background: active ? style.bg : '#ffffff',
                      color: active ? style.color : 'var(--color-text-secondary)',
                      fontSize: '12px',
                      fontWeight: active ? '800' : '700',
                      cursor: saving ? 'default' : 'pointer',
                    }}
                  >
                    {status}
                  </button>
                )
              })}
            </div>

            <form onSubmit={saveDraft} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Deadline type</label>
                  <select
                    value={draft.deadline_type}
                    onChange={event => setDraft(prev => ({ ...prev, deadline_type: event.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">No deadline yet</option>
                    <option value="date">Fixed date</option>
                    <option value="rolling">Rolling</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Deadline date</label>
                  <input
                    type="date"
                    value={draft.deadline_date}
                    disabled={draft.deadline_type !== 'date'}
                    onChange={event => setDraft(prev => ({ ...prev, deadline_date: event.target.value }))}
                    style={{ ...inputStyle, opacity: draft.deadline_type === 'date' ? 1 : 0.55 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Application notes</label>
                <textarea
                  value={draft.notes}
                  onChange={event => setDraft(prev => ({ ...prev, notes: event.target.value }))}
                  rows={5}
                  placeholder="Recruiter name, role details, interview notes, follow-up ideas..."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.55' }}
                />
              </div>
              <div>
                <button type="submit" disabled={saving} className="primary-action pressable" style={{ ...primaryButtonStyle, opacity: saving ? 0.65 : 1 }}>
                  {saving ? <RefreshCw size={15} strokeWidth={2.4} /> : <Save size={15} strokeWidth={2.4} />}
                  {saving ? 'Saving...' : 'Save details'}
                </button>
              </div>
            </form>
          </Section>

          <Section
            icon={FileText}
            eyebrow="Documents"
            title="Tailored materials"
            action={<span style={{ minHeight: 28, display: 'inline-flex', alignItems: 'center', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '999px', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: '800' }}>{readiness}</span>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px' }}>
              {[
                {
                  title: 'CV fit analysis',
                  done: Boolean(application.cv_review),
                  copy: application.cv_review?.summary || 'Generate and save role-specific CV recommendations.',
                  action: <Link to="/documents" style={{ ...secondaryButtonStyle, minHeight: 36, fontSize: '13px' }}>Review CV</Link>,
                },
                {
                  title: 'Cover letter draft',
                  done: Boolean(application.cover_letter),
                  copy: application.cover_letter?.opening_strategy || 'Create an editable cover letter for this job.',
                  action: application.cover_letter
                    ? (
                      <button type="button" onClick={() => downloadCoverLetterDoc(application.cover_letter, application)} className="secondary-action pressable" style={{ ...secondaryButtonStyle, minHeight: 36, fontSize: '13px' }}>
                        <Download size={14} strokeWidth={2.4} />
                        Create doc
                      </button>
                    )
                    : <Link to="/documents" style={{ ...secondaryButtonStyle, minHeight: 36, fontSize: '13px' }}>Draft letter</Link>,
                },
              ].map(item => (
                <article key={item.title} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', background: item.done ? '#f8fafc' : '#fffaf0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{item.title}</h3>
                    {item.done ? <CheckCircle2 size={16} strokeWidth={2.5} style={{ color: 'var(--color-success)' }} /> : <AlertCircle size={16} strokeWidth={2.5} style={{ color: 'var(--color-warning)' }} />}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>{item.copy}</p>
                  {item.action}
                </article>
              ))}
            </div>
          </Section>

          <Section icon={CalendarDays} eyebrow="History" title="Timeline">
            <div style={{ display: 'grid', gap: '12px' }}>
              {timeline.map((item, index) => {
                const Icon = item.icon
                return (
                  <article key={`${item.label}-${index}`} style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: '12px', alignItems: 'start' }}>
                    <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#edf7f7', color: 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} strokeWidth={2.4} />
                    </span>
                    <div style={{ paddingBottom: '12px', borderBottom: index === timeline.length - 1 ? 'none' : '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '3px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{item.label}</h3>
                        {item.date && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '700' }}>{item.date}</span>}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{item.copy}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </Section>
        </main>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <Section icon={Sparkles} eyebrow="Coach" title="Suggested next moves">
            <div style={{ display: 'grid', gap: '12px' }}>
              {coachSuggestions.map(item => (
                <article key={item.title} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '15px', background: '#fbfdff' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>{item.copy}</p>
                  <Link to={item.to} style={{ color: 'var(--color-applied-teal)', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '800', textDecoration: 'none' }}>
                    {item.label}
                    <ArrowRight size={14} strokeWidth={2.4} />
                  </Link>
                </article>
              ))}
            </div>
          </Section>

          <Section icon={Bell} eyebrow="Reminders" title="Reminder needs">
            <div style={{ display: 'grid', gap: '10px' }}>
              {reminders.map(item => (
                <article key={item.title} style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  background: item.tone === 'warning' ? '#fff7ed' : '#fbfdff',
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '5px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{item.copy}</p>
                </article>
              ))}
            </div>
            <Link to="/reminders" className="secondary-action pressable" style={{ ...secondaryButtonStyle, marginTop: '14px' }}>Open reminders</Link>
          </Section>

          <Section icon={ListChecks} eyebrow="Checklist" title="Application checklist">
            <div style={{ display: 'grid', gap: '10px' }}>
              {checklist.map(item => (
                <article key={item.label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  {item.done
                    ? <CheckCircle2 size={17} strokeWidth={2.5} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />
                    : <AlertCircle size={17} strokeWidth={2.5} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />}
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '3px' }}>{item.label}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>{item.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </Section>
        </aside>
      </div>
    </div>
  )
}
