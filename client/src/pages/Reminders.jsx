import React, { useEffect, useMemo, useState } from 'react'
import { Bell, CalendarDays, FileText, ListChecks } from 'lucide-react'
import { fetchTracker } from '../lib/api'
import { formatApplicationDate, getNextAction, isTerminalStatus } from '../lib/application'

const pageStyle = { padding: '36px 40px', maxWidth: '1040px' }
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '650px' }
const panelStyle = {
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}

function ReminderRow({ icon: Icon, label, title, copy, tone = 'neutral' }) {
  const toneColor = tone === 'warning' ? 'var(--color-warning)' : tone === 'success' ? 'var(--color-success)' : 'var(--color-applied-teal)'
  return (
    <article style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#ffffff' }}>
      <span style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: toneColor, flexShrink: 0 }}>
        <Icon size={17} strokeWidth={2.4} />
      </span>
      <div>
        <p style={{ fontSize: '12px', fontWeight: '800', color: toneColor, marginBottom: '3px' }}>{label}</p>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{copy}</p>
      </div>
    </article>
  )
}

export default function Reminders() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadApplications() {
      try {
        const data = await fetchTracker('All')
        if (!cancelled) setApplications(data)
      } catch {
        if (!cancelled) setError('Could not load reminders.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadApplications()
    return () => { cancelled = true }
  }, [])

  const generatedReminders = useMemo(() => {
    const active = applications.filter(app => !isTerminalStatus(app.status))
    return [
      ...active
        .filter(app => app.deadline_date)
        .sort((a, b) => new Date(a.deadline_date) - new Date(b.deadline_date))
        .slice(0, 5)
        .map(app => ({
          id: `deadline-${app.id}`,
          icon: CalendarDays,
          label: `Deadline ${formatApplicationDate(app.deadline_date)}`,
          title: `${app.title} at ${app.company}`,
          copy: 'Keep this visible until the application is submitted or the deadline changes.',
          tone: 'warning',
        })),
      ...active
        .filter(app => !app.deadline_date)
        .slice(0, 4)
        .map(app => ({
          id: `next-${app.id}`,
          icon: ListChecks,
          label: 'Next action needed',
          title: `${app.title} at ${app.company}`,
          copy: getNextAction(app),
          tone: 'neutral',
        })),
      ...active
        .slice(0, 3)
        .map(app => ({
          id: `document-${app.id}`,
          icon: FileText,
          label: 'Missing documents',
          title: `${app.title} at ${app.company}`,
          copy: 'Review CV evidence before generating application material.',
          tone: 'neutral',
        })),
    ]
  }, [applications])

  return (
    <div style={pageStyle}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={titleStyle}>Reminders</h1>
        <p style={subtitleStyle}>Deadlines, follow-ups, missing documents, and next actions stay visible until resolved.</p>
      </header>

      {error && (
        <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', background: '#fef2f2', color: 'var(--color-danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <section style={{ ...panelStyle, padding: '20px' }}>
        {loading ? (
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Loading reminders...</p>
        ) : generatedReminders.length === 0 ? (
          <div style={{ minHeight: 240, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#edf7f7', color: 'var(--color-applied-teal)' }}>
              <Bell size={20} strokeWidth={2.4} />
            </span>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '5px' }}>No reminders yet.</h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5', maxWidth: '420px' }}>
                Add a deadline or follow-up from an application when there is something important to remember.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {generatedReminders.map(reminder => (
              <ReminderRow
                key={reminder.id}
                icon={reminder.icon}
                label={reminder.label}
                title={reminder.title}
                copy={reminder.copy}
                tone={reminder.tone}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
