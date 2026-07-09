import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle, FileText, ListChecks, Search, Sparkles } from 'lucide-react'

const defaultSteps = [
  { id: 'profile', title: 'Extract CV profile', copy: 'Turn the current CV into reusable Personal Information.', to: '/documents', icon: FileText },
  { id: 'jobs', title: 'Review jobs', copy: 'Use job search and AI fit notes to find a strong role.', to: '/jobs', icon: Search },
  { id: 'tracker', title: 'Save application', copy: 'Move a role into Tracker with status and deadline.', to: '/tracker', icon: ListChecks },
  { id: 'documents', title: 'Tailor documents', copy: 'Generate CV recommendations and a cover letter for the role.', to: '/documents', icon: FileText },
  { id: 'coach', title: 'Use Coach', copy: 'Get next steps, follow-ups, interview prep, and weekly focus.', to: '/coach', icon: Sparkles },
]

export default function WorkflowGuide({ steps = defaultSteps, title = 'Recommended workflow', copy = 'Follow this order for the strongest ApplyWise demo and user experience.', compact = false }) {
  return (
    <section style={{
      background: '#ffffff',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: compact ? '20px' : '24px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: compact ? '14px' : '18px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0, marginBottom: '6px' }}>Workflow</p>
          <h2 style={{ fontSize: compact ? '16px' : '17px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: compact ? '5px' : '7px' }}>{title}</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', maxWidth: '720px' }}>{copy}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${compact ? '148px' : '180px'}), 1fr))`, gap: compact ? '10px' : '12px' }}>
        {steps.map((step, index) => {
          const Icon = step.icon || FileText
          const done = Boolean(step.done)
          const active = Boolean(step.active)
          const stateLabel = done ? 'Done' : active ? 'Current' : `Step ${index + 1}`
          const showCopy = !compact || active
          return (
            <Link
              key={step.id || step.title}
              to={step.to}
              className={`workflow-step-card ${done ? 'is-done' : ''} ${active ? 'is-active' : ''}`}
              style={{
                minHeight: compact ? 54 : 146,
                display: 'flex',
                flexDirection: compact ? 'row' : 'column',
                justifyContent: compact ? 'flex-start' : 'space-between',
                alignItems: compact ? 'center' : undefined,
                flex: compact ? '1 1 160px' : undefined,
                gap: compact ? '10px' : '14px',
                padding: compact ? '10px 12px' : '16px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${active ? 'var(--color-applied-teal)' : 'var(--color-border)'}`,
                background: active ? '#ffffff' : done ? '#f8fafc' : '#fbfdff',
                boxShadow: active ? 'var(--shadow-card)' : undefined,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {compact ? (
                <>
                  <span style={{ width: 30, height: 30, borderRadius: 'var(--radius-md)', background: active ? 'var(--color-applied-teal)' : 'var(--color-applied-teal-soft)', color: active ? '#ffffff' : 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} strokeWidth={2.4} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: '1.25' }}>
                    {step.title}
                  </span>
                  <span className="workflow-step-state" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: active ? 'var(--color-applied-teal)' : 'var(--color-text-muted)', fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap' }}>
                    {done ? <CheckCircle2 size={14} strokeWidth={2.5} /> : active ? <ArrowRight size={14} strokeWidth={2.5} /> : <Circle size={13} strokeWidth={2.3} />}
                    {stateLabel}
                  </span>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: active ? 'var(--color-applied-teal)' : 'var(--color-applied-teal-soft)', color: active ? '#ffffff' : 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={17} strokeWidth={2.4} />
                    </span>
                    <span className="workflow-step-state" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: active ? 'var(--color-applied-teal)' : done ? 'var(--color-text-muted)' : 'var(--color-text-muted)', fontSize: '12px', fontWeight: '800' }}>
                      {done ? <CheckCircle2 size={14} strokeWidth={2.5} /> : active ? <ArrowRight size={14} strokeWidth={2.5} /> : <Circle size={13} strokeWidth={2.3} />}
                      {stateLabel}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: '1.35', marginBottom: showCopy ? '7px' : 0 }}>{step.title}</h3>
                    {showCopy && (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{step.copy}</p>
                    )}
                  </div>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
