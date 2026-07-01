import React, { useEffect, useMemo, useState } from 'react'
import { FileText, Lightbulb, MessageSquareText, PenLine, SearchCheck } from 'lucide-react'
import { fetchTracker } from '../lib/api'
import { getNextAction, getStatusStyle } from '../lib/application'

const pageStyle = { padding: '36px 40px', maxWidth: '1120px' }
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '650px' }
const panelStyle = {
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '6px' }
const inputStyle = {
  width: '100%',
  minHeight: 44,
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '0 12px',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
  outline: 'none',
}

const coachModes = {
  fit: {
    label: 'Check Job Fit',
    icon: SearchCheck,
    title: 'Review fit against the selected application.',
    copy: 'Paste the job requirements and CV evidence in Documents to get a stronger fit assessment. The coach should separate confirmed evidence from assumptions.',
  },
  cv: {
    label: 'Improve CV',
    icon: FileText,
    title: 'Your CV could be stronger for this role.',
    copy: 'Use the Documents page to generate evidence gaps, unsupported-claim warnings, and suggested CV bullets. Approve changes before using them.',
  },
  letter: {
    label: 'Draft Cover Letter',
    icon: PenLine,
    title: 'Cover letters should be specific before they are saved.',
    copy: 'A useful draft needs the role title, company, job requirements, and two or three truthful evidence points from your CV.',
  },
  next: {
    label: 'What Should I Do Next?',
    icon: Lightbulb,
    title: 'Here is the next practical action.',
    copy: 'Keep every active application tied to a deadline, follow-up, document task, or interview preparation step.',
  },
}

function TaskButton({ mode, selected, onClick }) {
  const Icon = coachModes[mode].icon
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 76,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        border: selected ? '1.5px solid #b9dada' : '1px solid var(--color-border)',
        background: selected ? '#edf7f7' : '#ffffff',
        color: selected ? 'var(--color-applied-teal)' : 'var(--color-text-primary)',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <Icon size={18} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: '14px', fontWeight: '800', lineHeight: '1.25' }}>{coachModes[mode].label}</span>
    </button>
  )
}

export default function Coach() {
  const [applications, setApplications] = useState([])
  const [selectedApplicationId, setSelectedApplicationId] = useState('')
  const [selectedMode, setSelectedMode] = useState('fit')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadApplications() {
      try {
        const data = await fetchTracker('All')
        if (cancelled) return
        setApplications(data)
        if (data[0]?.id) setSelectedApplicationId(String(data[0].id))
      } catch {
        if (!cancelled) setError('Could not load applications for Coach.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadApplications()
    return () => { cancelled = true }
  }, [])

  const selectedApplication = useMemo(
    () => applications.find(app => String(app.id) === selectedApplicationId) || null,
    [applications, selectedApplicationId],
  )
  const mode = coachModes[selectedMode]
  const statusStyle = getStatusStyle(selectedApplication?.status)

  return (
    <div style={pageStyle}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={titleStyle}>Coach</h1>
        <p style={subtitleStyle}>Task-specific help for one application at a time. The coach asks for missing evidence instead of giving generic advice.</p>
      </header>

      {error && (
        <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', background: '#fef2f2', color: 'var(--color-danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <section style={{ ...panelStyle, padding: '22px', marginBottom: '18px' }}>
        <label style={labelStyle}>Selected application</label>
        <select
          value={selectedApplicationId}
          onChange={event => setSelectedApplicationId(event.target.value)}
          disabled={loading || applications.length === 0}
          style={inputStyle}
        >
          {applications.length === 0 ? (
            <option value="">No saved applications yet</option>
          ) : applications.map(app => (
            <option key={app.id} value={app.id}>{app.title} at {app.company}</option>
          ))}
        </select>

        {selectedApplication ? (
          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{selectedApplication.title}</h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{selectedApplication.company}</p>
            </div>
            <span style={{ minHeight: 26, display: 'inline-flex', alignItems: 'center', borderRadius: '6px', border: `1px solid ${statusStyle.border}`, background: statusStyle.bg, color: statusStyle.color, padding: '0 9px', fontSize: '12px', fontWeight: '800' }}>
              {selectedApplication.status}
            </span>
          </div>
        ) : (
          <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Choose or create an application so the coach can give specific advice.</p>
        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '18px', alignItems: 'start' }}>
        <section style={{ ...panelStyle, padding: '16px', display: 'grid', gap: '10px' }} aria-label="Coach task modes">
          {Object.keys(coachModes).map(key => (
            <TaskButton key={key} mode={key} selected={selectedMode === key} onClick={() => setSelectedMode(key)} />
          ))}
        </section>

        <section style={{ ...panelStyle, padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#edf7f7', color: 'var(--color-applied-teal)' }}>
              <MessageSquareText size={18} strokeWidth={2.4} />
            </span>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0' }}>{mode.label}</p>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '2px' }}>{mode.title}</h2>
            </div>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', maxWidth: '680px' }}>{mode.copy}</p>
          {selectedApplication && (
            <div style={{ marginTop: '22px', padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fbfdff' }}>
              <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0', marginBottom: '6px' }}>Next action</p>
              <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.55' }}>{getNextAction(selectedApplication)}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
