import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  FileText,
  ListChecks,
} from 'lucide-react'
import { fetchJobs, fetchTracker } from '../lib/api'
import {
  APPLICATION_STATUSES,
  formatApplicationDate,
  getDocumentReadiness,
  getNextAction,
  getStatusStyle,
  isTerminalStatus,
} from '../lib/application'

const pageStyle = { padding: '36px 40px', maxWidth: '1180px' }
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '620px' }
const panelStyle = {
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}
const primaryLinkStyle = {
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '0 16px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
}
const secondaryLinkStyle = {
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
}

function Panel({ title, eyebrow, children, action }) {
  return (
    <section style={{ ...panelStyle, padding: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          {eyebrow && (
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0', marginBottom: '5px' }}>
              {eyebrow}
            </p>
          )}
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
            {title}
          </h2>
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
      minHeight: 24,
      padding: '0 8px',
      borderRadius: '6px',
      border: `1px solid ${style.border}`,
      background: style.bg,
      color: style.color,
      fontSize: '12px',
      fontWeight: '700',
    }}>
      {status}
    </span>
  )
}

function EmptyState({ icon: Icon, title, copy, action }) {
  return (
    <div style={{
      minHeight: 180,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '12px',
      color: 'var(--color-text-secondary)',
    }}>
      <span style={{
        width: 42,
        height: 42,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#edf7f7',
        color: 'var(--color-applied-teal)',
      }}>
        <Icon size={20} strokeWidth={2.4} />
      </span>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '14px', lineHeight: '1.55', maxWidth: '360px' }}>{copy}</p>
      </div>
      {action}
    </div>
  )
}

function sortByDeadline(applications) {
  return [...applications].sort((a, b) => {
    const aTime = a.deadline_date ? new Date(a.deadline_date).getTime() : Number.MAX_SAFE_INTEGER
    const bTime = b.deadline_date ? new Date(b.deadline_date).getTime() : Number.MAX_SAFE_INTEGER
    return aTime - bTime
  })
}

export default function Home() {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadHome() {
      setLoading(true)
      setError('')
      try {
        const [trackerData, jobsData] = await Promise.all([
          fetchTracker('All'),
          fetchJobs({}),
        ])
        if (cancelled) return
        setApplications(trackerData)
        setJobs(jobsData.slice(0, 4))
      } catch {
        if (!cancelled) setError('Could not load Home. Make sure the local server is running.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadHome()
    return () => { cancelled = true }
  }, [])

  const activeApplications = useMemo(
    () => applications.filter(app => !isTerminalStatus(app.status)).slice(0, 5),
    [applications],
  )
  const upcomingDeadlines = useMemo(
    () => sortByDeadline(applications.filter(app => app.deadline_date && !isTerminalStatus(app.status))).slice(0, 4),
    [applications],
  )
  const nextActions = useMemo(
    () => activeApplications.slice(0, 3).map(app => ({ app, action: getNextAction(app) })),
    [activeApplications],
  )
  const counts = useMemo(() => {
    const next = Object.fromEntries(APPLICATION_STATUSES.map(status => [status, 0]))
    applications.forEach(app => {
      if (next[app.status] !== undefined) next[app.status] += 1
    })
    return next
  }, [applications])

  return (
    <div style={pageStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', marginBottom: '28px' }}>
        <div>
          <h1 style={titleStyle}>Here is your next best step.</h1>
          <p style={subtitleStyle}>ApplyWise keeps your jobs, applications, documents, reminders, and CV work in one private workspace.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link to="/jobs" style={primaryLinkStyle}>
            <Briefcase size={16} strokeWidth={2.4} />
            Find jobs
          </Link>
          <Link to="/tracker" style={secondaryLinkStyle}>Open tracker</Link>
        </div>
      </header>

      {error && (
        <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', background: '#fef2f2', color: 'var(--color-danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '18px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Panel
            eyebrow="Today"
            title="Application work waiting for action"
            action={<Link to="/reminders" style={{ ...secondaryLinkStyle, minHeight: 36, padding: '0 12px', fontSize: '13px' }}>View reminders</Link>}
          >
            {loading ? (
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Loading your next actions...</p>
            ) : nextActions.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="Save your first job to start tracking applications."
                copy="Jobs you save will appear here with next actions, deadlines, and document prompts."
                action={<Link to="/jobs" style={primaryLinkStyle}>Find or add a job</Link>}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {nextActions.map(({ app, action }) => (
                  <article key={app.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px', background: '#fbfdff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '2px' }}>{app.title}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{app.company}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{action}</p>
                  </article>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            eyebrow="Active applications"
            title="Pipeline summary"
            action={<Link to="/tracker" style={{ color: 'var(--color-applied-teal)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: '800', textDecoration: 'none' }}>Open <ArrowRight size={14} /></Link>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))', gap: '10px' }}>
              {APPLICATION_STATUSES.map(status => {
                const style = getStatusStyle(status)
                return (
                  <div key={status} style={{ border: `1px solid ${style.border}`, background: style.bg, borderRadius: 'var(--radius-md)', padding: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: '800', color: style.color, lineHeight: '1' }}>{counts[status]}</div>
                    <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>{status}</div>
                  </div>
                )
              })}
            </div>
          </Panel>

          <Panel eyebrow="Suggested jobs" title="Roles to review next">
            {jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="Find or add a job to start building your application list."
                copy="The Jobs screen is where relevant roles become tracked applications."
                action={<Link to="/jobs" style={primaryLinkStyle}>Open Jobs</Link>}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {jobs.map(job => (
                  <article key={job.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px', background: '#ffffff' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: '1.35', marginBottom: '5px' }}>{job.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>{job.company}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {job.location && <span>{job.location}</span>}
                      {job.sector && <span>{job.sector}</span>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Panel eyebrow="Upcoming" title="Deadlines and reminders">
            {upcomingDeadlines.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No deadlines yet. Add one if the posting includes it."
                copy="Deadlines and follow-ups stay visible until they are resolved."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingDeadlines.map(app => (
                  <article key={app.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                    <CalendarDays size={16} strokeWidth={2.3} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-warning)', fontWeight: '800', marginBottom: '3px' }}>{formatApplicationDate(app.deadline_date)}</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '800' }}>{app.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{app.company}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>

          <Panel eyebrow="Documents" title="CV readiness">
            {activeApplications.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Upload a CV before tailoring applications."
                copy="CV suggestions stay editable and user-approved."
                action={<Link to="/documents" style={secondaryLinkStyle}>Open Documents</Link>}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeApplications.slice(0, 4).map(app => (
                  <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{app.company}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{app.title}</p>
                    </div>
                    <span style={{ minHeight: 24, padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: '700' }}>
                      {getDocumentReadiness(app)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel eyebrow="Coach" title="Specific help, not generic advice">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} strokeWidth={2.4} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>
                Choose an application before asking for fit, CV, cover letter, or next-step support.
              </p>
            </div>
            <Link to="/coach" style={{ ...secondaryLinkStyle, marginTop: '14px' }}>Open Coach</Link>
          </Panel>

          {applications.some(app => !isTerminalStatus(app.status) && !app.deadline_date) && (
            <div style={{ ...panelStyle, padding: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#fffaf0', borderColor: '#fed7aa' }}>
              <AlertCircle size={18} strokeWidth={2.3} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '13px', color: '#7c4a03', lineHeight: '1.5' }}>
                You have applications without deadlines or next actions. Add one before marking them as applied.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
