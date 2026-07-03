import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { addApplication } from '../lib/api'

const SECTORS = [
  'Business & Strategy',
  'Business Analysis',
  'Strategy & Consulting',
  'Operations',
  'Project Management',
  'Product Management',
  'Marketing',
  'Sales & Business Development',
  'Customer Success',
  'Supply Chain',
  'Human Resources',
  'Data & Analytics',
  'Investment Banking',
  'Asset Management',
  'Wealth Management',
  'M&A',
  'Private Equity',
  'Venture Capital',
  'Commercial Banking',
  'Private Banking',
  'Corporate Finance',
  'Risk Management',
  'Compliance & Regulatory',
  'Financial Technology (FinTech)',
]

export default function AddApplicationModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', company: '', location: '', url: '', sector: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = 'Required'
    if (!form.company.trim()) errs.company = 'Required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await addApplication(form)
      onSaved?.()
      onClose()
    } catch (err) {
      setErrors({
        form: err?.response?.status === 401
          ? 'Log in or sign up to save applications.'
          : 'Could not save this application yet.',
      })
      setSaving(false)
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%', minHeight: 44, padding: '8px 12px', fontSize: '13px',
    border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)', outline: 'none',
    color: 'var(--color-text-primary)', background: 'var(--color-bg)',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.12s',
  })

  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '5px' }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000 }} />
      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)',
        width: '480px', maxWidth: 'calc(100vw - 32px)',
        padding: '28px', zIndex: 1001,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>Add Application</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-muted)', display: 'flex', borderRadius: 'var(--radius-sm)' }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Row: Title + Company */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Job Title *</label>
              <input style={inputStyle(errors.title)} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Analyst, Consultant, Coordinator..." onFocus={e => e.target.style.borderColor = 'var(--color-applied-teal)'} onBlur={e => e.target.style.borderColor = errors.title ? 'var(--color-danger)' : 'var(--color-border)'} />
              {errors.title && <p style={{ fontSize: '11px', color: 'var(--color-danger)', margin: '3px 0 0' }}>{errors.title}</p>}
            </div>
            <div>
              <label style={labelStyle}>Company *</label>
              <input style={inputStyle(errors.company)} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Deloitte, Unilever, Goldman Sachs..." onFocus={e => e.target.style.borderColor = 'var(--color-applied-teal)'} onBlur={e => e.target.style.borderColor = errors.company ? 'var(--color-danger)' : 'var(--color-border)'} />
              {errors.company && <p style={{ fontSize: '11px', color: 'var(--color-danger)', margin: '3px 0 0' }}>{errors.company}</p>}
            </div>
          </div>

          {/* Row: Location + Sector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle(false)} value={form.location} onChange={e => set('location', e.target.value)} placeholder="London, Madrid…" onFocus={e => e.target.style.borderColor = 'var(--color-applied-teal)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label style={labelStyle}>Sector</label>
              <select value={form.sector} onChange={e => set('sector', e.target.value)}
                style={{
                  ...inputStyle(false),
                  appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
                  paddingRight: '30px',
                }}
              >
                <option value="">Select sector</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* URL */}
          <div>
            <label style={labelStyle}>Job Posting URL</label>
            <input type="url" style={inputStyle(false)} value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://…" onFocus={e => e.target.style.borderColor = 'var(--color-applied-teal)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Referral, deadline, any other notes…"
              rows={3}
              style={{ ...inputStyle(false), resize: 'vertical', lineHeight: '1.5' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-applied-teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {errors.form && (
            <div style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: '#fff7ed',
              color: '#9a3412',
              fontSize: '13px',
              lineHeight: '1.45',
            }}>
              {errors.form}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '8px 18px', fontSize: '13px', fontWeight: '500', background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ minHeight: 44, padding: '0 18px', fontSize: '13px', fontWeight: '700', background: 'var(--color-applied-teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
