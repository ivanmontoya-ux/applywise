import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, FileText, ListChecks, Search, Sparkles } from 'lucide-react'

const defaultSteps = [
  { id: 'profile', title: 'Extract CV profile', copy: 'Turn the current CV into reusable Personal Information.', to: '/documents', icon: FileText },
  { id: 'jobs', title: 'Review jobs', copy: 'Use job search and AI fit notes to find a strong role.', to: '/jobs', icon: Search },
  { id: 'tracker', title: 'Save application', copy: 'Move a role into Tracker with status and deadline.', to: '/tracker', icon: ListChecks },
  { id: 'documents', title: 'Tailor documents', copy: 'Generate CV recommendations and a cover letter for the role.', to: '/documents', icon: FileText },
  { id: 'coach', title: 'Use Coach', copy: 'Get next steps, follow-ups, interview prep, and weekly focus.', to: '/coach', icon: Sparkles },
]

export default function WorkflowGuide({ steps = defaultSteps, title = 'Recommended workflow', copy = 'Follow this order for the strongest ApplyWise demo and user experience.' }) {
  return (
    <section style={{
      background: '#ffffff',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: '24px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0, marginBottom: '6px' }}>Workflow</p>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '7px' }}>{title}</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.58', maxWidth: '720px' }}>{copy}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
        {steps.map((step, index) => {
          const Icon = step.icon || FileText
          const done = Boolean(step.done)
          return (
            <Link
              key={step.id || step.title}
              to={step.to}
              className={`workflow-step-card ${done ? 'is-done' : ''}`}
              style={{
                minHeight: 146,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${done ? '#bbf7d0' : 'var(--color-border)'}`,
                background: done ? '#f0fdf4' : '#fbfdff',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: '#edf7f7', color: 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} strokeWidth={2.4} />
                </span>
                <span className="workflow-step-state" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: done ? 'var(--color-success)' : 'var(--color-text-muted)', fontSize: '12px', fontWeight: '800' }}>
                  {done ? <CheckCircle2 size={14} strokeWidth={2.5} /> : <Circle size={13} strokeWidth={2.3} />}
                  {done ? 'Done' : `Step ${index + 1}`}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: '1.35', marginBottom: '7px' }}>{step.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.58' }}>{step.copy}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
