import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Search, ChevronDown, X, Plus, Sparkles } from 'lucide-react'
import { fetchJobs, fetchPersonalInformation, recommendJobs, refreshJobs } from '../lib/api'
import { classifyJob } from '../lib/classifier'
import JobCard from '../components/JobCard'

// ── Filter data ──────────────────────────────────────────────────────────────

const LOCATION_GROUPS = [
  { title: null, items: ['Madrid', 'Barcelona', 'London', 'Manchester', 'Milan', 'New York', 'Amsterdam', 'Paris', 'Dublin', 'Berlin', 'Munich', 'Stockholm', 'Copenhagen'] },
]

const SECTOR_GROUPS = [
  { title: 'Business',         items: ['Business & Strategy', 'Business Analysis', 'Strategy & Consulting', 'Operations', 'Project Management', 'Product Management'] },
  { title: 'Commercial',       items: ['Marketing', 'Sales & Business Development', 'Customer Success', 'Supply Chain', 'Human Resources', 'Data & Analytics'] },
  { title: 'Banking',          items: ['Investment Banking', 'Commercial Banking', 'Private Banking', 'Corporate Finance'] },
  { title: 'Markets',          items: ['Sales & Trading', 'Brokerage & Market Making', 'Equity Research', 'Quantitative Analysis'] },
  { title: 'Investments',      items: ['Asset Management', 'Wealth Management', 'Private Equity', 'Venture Capital'] },
  { title: 'Finance & Risk',   items: ['M&A', 'Financial Advisory', 'Risk Management', 'Treasury', 'Compliance & Regulatory', 'Financial Technology (FinTech)'] },
]

const JOB_TYPE_GROUPS = [
  { title: 'Graduate Program', items: ['Graduate', 'Trainee', 'Junior', 'Apprentice'] },
  { title: 'Internship',       items: ['Internship', 'Placement', 'Work Experience'] },
  { title: 'Analyst Role',     items: ['Analyst', 'Research', 'Quantitative'] },
  { title: 'Associate',        items: ['Associate', 'Assistant'] },
  { title: 'Business Role',    items: ['Consultant', 'Specialist', 'Officer', 'Coordinator', 'Executive', 'Product', 'Operations'] },
  { title: 'Entry-Level',      items: ['General'] },
]

// ── Styles ───────────────────────────────────────────────────────────────────

const pageStyle        = { padding: '36px 40px', maxWidth: '1140px' }
const headerRowStyle   = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }
const titleStyle       = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle    = { fontSize: '16px', color: 'var(--color-text-secondary)', fontWeight: '400' }
const refreshBtnStyle  = {
  display: 'flex', alignItems: 'center', gap: '9px',
  minHeight: 44, padding: '0 16px', background: 'var(--color-applied-teal)', color: '#ffffff',
  border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '800',
  cursor: 'pointer', transition: 'background 0.15s ease, transform 0.14s ease, box-shadow 0.14s ease', flexShrink: 0,
  boxShadow: 'var(--shadow-primary)',
}
const secondaryLinkStyle = {
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
  boxShadow: 'var(--shadow-sm)',
}
const filterBarStyle   = {
  display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
  marginBottom: '30px', padding: '18px 20px',
  background: '#ffffff',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
  position: 'relative', zIndex: 50,
}
const selectStyle      = {
  appearance: 'none', WebkitAppearance: 'none',
  background: '#ffffff',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '8px 32px 8px 12px',
  fontSize: '13px', color: 'var(--color-text-primary)', cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  outline: 'none', transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  fontWeight: '400', flexShrink: 0,
}
const searchWrapperStyle = {
  display: 'flex', alignItems: 'center', gap: '8px',
  background: '#ffffff',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', padding: '8px 12px',
  flex: '1', minWidth: '160px',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
}
const searchInputStyle   = { border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--color-text-primary)', width: '100%' }
const gridStyle          = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }
const recommendationsBandStyle = {
  marginTop: '-8px',
  marginBottom: '20px',
  padding: '16px 20px',
  background: '#ffffff',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
  position: 'relative',
  zIndex: 1,
}

function fitLabel(value) {
  if (value === 'strong_fit') return 'Strong fit'
  if (value === 'stretch') return 'Stretch'
  return 'Potential fit'
}

function fitStyle(value) {
  if (value === 'strong_fit') return { bg: '#f0fdf4', color: 'var(--color-success)', border: '#bbf7d0' }
  if (value === 'stretch') return { bg: '#fff7ed', color: 'var(--color-warning)', border: '#fed7aa' }
  return { bg: '#edf7f7', color: 'var(--color-applied-teal)', border: '#b9dada' }
}

function recommendationErrorMessage(err) {
  const status = err?.response?.status
  const serverMessage = String(err?.response?.data?.error || err?.message || '')
  const lower = serverMessage.toLowerCase()

  if (status === 400 && lower.includes('personal information')) return ''
  if (status === 400 && lower.includes('no jobs')) return ''
  if (status === 503) return 'AI job recommendations are unavailable until Gemini is configured in server/.env.'
  if (lower.includes('api key') || lower.includes('permission') || lower.includes('authentication') || lower.includes('unauthorized')) {
    return 'Gemini could not authenticate. Check that GEMINI_API_KEY in server/.env is a valid Google AI Studio key, then restart the app.'
  }
  if (lower.includes('model')) {
    return 'Gemini could not use the configured model. Check GEMINI_MODEL in server/.env, then restart the app.'
  }

  return 'AI job recommendations could not be loaded yet. Check the Gemini key/model in server/.env and restart the app.'
}

// ── MultiSelect dropdown ─────────────────────────────────────────────────────

function FilterDropdown({ label, unit, groups, selected, onChange, minWidth = '190px' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handle = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const selCount = selected.size
  const isActive = selCount > 0
  const btnLabel = selCount === 0
    ? label
    : selCount === 1
      ? [...selected][0]
      : `${selCount} ${unit}`

  function toggle(item) {
    const n = new Set(selected)
    n.has(item) ? n.delete(item) : n.add(item)
    onChange(n)
  }

  function toggleGroup(items) {
    const allOn = items.every(i => selected.has(i))
    const n = new Set(selected)
    if (allOn) items.forEach(i => n.delete(i))
    else items.forEach(i => n.add(i))
    onChange(n)
  }

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: isActive ? '#edf7f7' : '#ffffff',
          border: `1.5px solid ${isActive ? '#b9dada' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          fontSize: '13px',
          color: isActive ? 'var(--color-applied-teal)' : 'var(--color-text-primary)',
          fontWeight: isActive ? '500' : '400',
          cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-applied-teal)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-border)' }}
      >
        {btnLabel}
        <ChevronDown
          size={11} strokeWidth={2.5}
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
        />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: '#fff', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 300, minWidth, width: 'max-content', maxWidth: '260px',
          maxHeight: '340px', overflowY: 'auto',
        }}>
          {isActive && (
            <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--color-border)' }}>
              <button
                onClick={() => onChange(new Set())}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--color-applied-teal)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: '700' }}
              >
                <X size={11} strokeWidth={2.5} />
                Clear selection
              </button>
            </div>
          )}

          <div style={{ padding: '6px' }}>
            {groups.map(({ title, items }, gi) => {
              const allOn  = items.every(i => selected.has(i))
              const someOn = items.some(i => selected.has(i))
              return (
                <div key={gi}>
                  {title && (
                    <>
                      <div
                        onClick={() => toggleGroup(items)}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '6px 8px', borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer', userSelect: 'none',
                          fontWeight: '700', fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}
                      >
                        <span style={{
                          width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                          border: `1.5px solid ${allOn ? 'var(--color-applied-teal)' : someOn ? '#b9dada' : '#cbd5e1'}`,
                          background: allOn ? 'var(--color-applied-teal)' : someOn ? '#edf7f7' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, color: allOn ? '#fff' : 'var(--color-applied-teal)', lineHeight: 1,
                        }}>
                          {allOn ? '✓' : someOn ? '–' : ''}
                        </span>
                        {title}
                      </div>
                      {gi < groups.length - 1 && gi > 0 && <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />}
                    </>
                  )}
                  {items.map(item => {
                    const checked = selected.has(item)
                    return (
                      <label
                        key={item}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: title ? '5px 8px 5px 24px' : '6px 8px',
                          borderRadius: 'var(--radius-sm)', cursor: 'pointer', userSelect: 'none',
                          fontSize: '13px',
                          color: checked ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          fontWeight: checked ? '500' : '400',
                        }}
                      >
                        <input
                          type="checkbox" checked={checked} onChange={() => toggle(item)}
                          style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--color-applied-teal)', flexShrink: 0 }}
                        />
                        {item}
                      </label>
                    )
                  })}
                  {title && gi < groups.length - 1 && (
                    <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Skeleton / Toast ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="skeleton-card" style={{
      background: 'var(--color-bg)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '16px',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div className="skeleton-block" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton-block" style={{ height: 14, borderRadius: 6, marginBottom: 10, width: '70%' }} />
          <div className="skeleton-block" style={{ height: 12, borderRadius: 6, width: '45%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton-block" style={{ height: 22, width: 80, borderRadius: 999 }} />
        <div className="skeleton-block" style={{ height: 22, width: 100, borderRadius: 999 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton-block" style={{ height: 12, width: 60, borderRadius: 6 }} />
        <div className="skeleton-block" style={{ height: 32, width: 120, borderRadius: 'var(--radius-md)' }} />
      </div>
    </div>
  )
}

function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2200)
    return () => clearTimeout(t)
  }, [onDismiss])
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28,
      background: '#0f172a', color: '#fff',
      padding: '10px 18px', borderRadius: 'var(--radius-md)',
      fontSize: '13px', fontWeight: '500',
      boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      zIndex: 9999, animation: 'fadeInUp 0.2s ease',
    }}>
      {message}
    </div>
  )
}

function RecommendedJobsBand({ enabled, onEnabledChange, recommendations, loading, error, warning }) {
  const hasContent = enabled && (loading || error || warning || recommendations.length > 0)
  return (
    <section style={recommendationsBandStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', marginBottom: hasContent ? '14px' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <span style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: '#edf7f7', color: 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={17} strokeWidth={2.4} />
          </span>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '2px' }}>Recommended for your CV</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>Based on the Personal Information extracted from your CV.</p>
          </div>
        </div>
        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          minHeight: 34,
          padding: '0 10px',
          border: `1px solid ${enabled ? '#b9dada' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          background: enabled ? '#edf7f7' : '#ffffff',
          color: enabled ? 'var(--color-applied-teal)' : 'var(--color-text-secondary)',
          fontSize: '12px',
          fontWeight: '800',
          cursor: 'pointer',
          userSelect: 'none',
        }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={event => onEnabledChange(event.target.checked)}
            style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--color-applied-teal)' }}
          />
          Show AI recommendations
        </label>
        {enabled && loading && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '700' }}>
            <RefreshCw size={14} strokeWidth={2.4} />
            Matching jobs...
          </span>
        )}
      </div>

      {!enabled ? (
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.45' }}>
          Turn this on when you want ApplyWise to compare the visible job list with your saved CV profile.
        </p>
      ) : error ? (
        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: '#fff7ed', color: '#9a3412', fontSize: '13px', lineHeight: '1.45' }}>
          {error}
        </div>
      ) : recommendations.length > 0 ? (
        <>
          {warning && (
            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: '#fff7ed', color: '#9a3412', fontSize: '13px', lineHeight: '1.45' }}>
              {warning}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', alignItems: 'start' }}>
          {recommendations.map(({ job, recommendation }) => {
            const style = fitStyle(recommendation.fit_label)
            return (
              <article key={job.id} className="interactive-card" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fbfdff', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', alignSelf: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '3px', lineHeight: '1.35' }}>{job.title}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>{job.company}</p>
                  </div>
                  <span style={{ minWidth: 72, textAlign: 'center', border: `1px solid ${style.border}`, background: style.bg, color: style.color, borderRadius: '6px', padding: '6px 8px', fontSize: '11px', fontWeight: '800' }}>
                    {recommendation.fit_score}/100
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{recommendation.reason}</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ border: `1px solid ${style.border}`, background: style.bg, color: style.color, borderRadius: '999px', padding: '4px 8px', fontSize: '11px', fontWeight: '800' }}>
                    {fitLabel(recommendation.fit_label)}
                  </span>
                  {job.location && (
                    <span style={{ border: '1px solid var(--color-border)', background: '#ffffff', color: 'var(--color-text-secondary)', borderRadius: '999px', padding: '4px 8px', fontSize: '11px', fontWeight: '700' }}>
                      {job.location}
                    </span>
                  )}
                  {job.sector && (
                    <span style={{ border: '1px solid var(--color-border)', background: '#ffffff', color: 'var(--color-text-secondary)', borderRadius: '999px', padding: '4px 8px', fontSize: '11px', fontWeight: '700' }}>
                      {job.sector}
                    </span>
                  )}
                </div>
                {recommendation.matching_evidence?.length ? (
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Why it fits</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {recommendation.matching_evidence.slice(0, 2).map((item, index) => (
                        <li key={index} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {recommendation.concerns?.length ? (
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--color-warning)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Check before applying</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {recommendation.concerns.slice(0, 2).map((item, index) => (
                        <li key={index} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {recommendation.next_step && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-primary)', lineHeight: '1.45', fontWeight: '700' }}>{recommendation.next_step}</p>
                )}
              </article>
            )
          })}
          </div>
        </>
      ) : null}
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function JobFeed() {
  const [selectedLocations, setSelectedLocations] = useState(new Set())
  const [selectedSectors,   setSelectedSectors]   = useState(new Set())
  const [selectedSubTypes,  setSelectedSubTypes]  = useState(new Set())
  const [datePosted,        setDatePosted]         = useState('any')
  const [keyword,           setKeyword]            = useState('')
  const [debouncedKeyword,  setDebouncedKeyword]   = useState('')
  const [refreshing,        setRefreshing]         = useState(false)
  const [jobs,              setJobs]               = useState([])
  const [loading,           setLoading]            = useState(true)
  const [error,             setError]              = useState(null)
  const [toast,             setToast]              = useState(null)
  const [recommendations,   setRecommendations]    = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [recommendationError, setRecommendationError] = useState('')
  const [recommendationWarning, setRecommendationWarning] = useState('')
  const [recommendationsEnabled, setRecommendationsEnabled] = useState(false)
  const debounceTimer = useRef(null)
  const recommendationsRequest = useRef(0)

  // Debounce keyword
  useEffect(() => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setDebouncedKeyword(keyword), 400)
    return () => clearTimeout(debounceTimer.current)
  }, [keyword])

  // Stable keys for Set deps (Sets aren't compared by value in hooks)
  const locKey = [...selectedLocations].sort().join(',')
  const secKey = [...selectedSectors].sort().join(',')

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    recommendationsRequest.current += 1
    setRecommendations([])
    setRecommendationError('')
    setRecommendationWarning('')
    setRecommendationsLoading(false)
    try {
      const data = await fetchJobs({
        locations: [...selectedLocations],
        sectors:   [...selectedSectors],
        days:      datePosted,
        q:         debouncedKeyword,
      })
      setJobs(data)
    } catch (err) {
      recommendationsRequest.current += 1
      setJobs([])
      setRecommendations([])
      setRecommendationError('')
      setRecommendationWarning('')
      setRecommendationsLoading(false)
      setError('Could not load jobs. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locKey, secKey, datePosted, debouncedKeyword])

  useEffect(() => { loadJobs() }, [loadJobs])

  async function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    try {
      await refreshJobs()
      await loadJobs()
    } catch (err) {
      setError(err?.response?.status === 401
        ? 'Log in or sign up to refresh the shared job list.'
        : 'Refresh failed. Check your Adzuna API key in server/.env')
    } finally {
      setRefreshing(false)
    }
  }

  // Client-side sub-type filter (no extra API round-trip for type changes)
  const displayedJobs = useMemo(() => {
    return jobs.filter(job => {
      const { subType: st } = job.grand_category
        ? { subType: job.sub_type }
        : classifyJob(job.title)

      if (selectedSubTypes.size === 0) {
        return true
      }
      return selectedSubTypes.has(st)
    })
  }, [jobs, selectedSubTypes])

  const loadRecommendations = useCallback(async candidateJobs => {
    const requestId = recommendationsRequest.current + 1
    recommendationsRequest.current = requestId

    setRecommendations([])
    setRecommendationError('')
    setRecommendationWarning('')
    setRecommendationsLoading(false)

    const jobData = Array.isArray(candidateJobs) ? candidateJobs.filter(Boolean) : []
    if (jobData.length === 0) return

    let profile = null
    try {
      const personalData = await fetchPersonalInformation()
      profile = personalData?.profile || null
    } catch {
      return
    }

    if (recommendationsRequest.current !== requestId || !profile) return

    setRecommendationsLoading(true)
    try {
      const result = await recommendJobs({
        personal_information: profile,
        jobs: jobData.slice(0, 60),
      })
      if (recommendationsRequest.current !== requestId) return
      setRecommendations(Array.isArray(result?.recommendations) ? result.recommendations : [])
      setRecommendationWarning(result?.warning || '')
    } catch (err) {
      if (recommendationsRequest.current !== requestId) return
      setRecommendationError(recommendationErrorMessage(err))
    } finally {
      if (recommendationsRequest.current === requestId) {
        setRecommendationsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!recommendationsEnabled) {
      recommendationsRequest.current += 1
      setRecommendations([])
      setRecommendationError('')
      setRecommendationWarning('')
      setRecommendationsLoading(false)
      return
    }
    if (loading || error) return
    loadRecommendations(displayedJobs)
  }, [displayedJobs, error, loading, loadRecommendations, recommendationsEnabled])

  const recommendedJobs = useMemo(() => {
    const jobsById = new Map(jobs.map(job => [String(job.id), job]))
    return recommendations
      .map(recommendation => {
        const job = jobsById.get(String(recommendation.job_id))
        return job ? { job, recommendation } : null
      })
      .filter(Boolean)
  }, [jobs, recommendations])

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerRowStyle}>
        <div>
          <h1 style={titleStyle}>Jobs</h1>
          <p style={subtitleStyle}>Search stored graduate roles, save strong matches, and keep source URLs attached.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link to="/tracker" className="secondary-action pressable" style={secondaryLinkStyle}>
            <Plus size={15} strokeWidth={2.5} />
            Add manual job
          </Link>
          <button
            className="primary-action"
            style={refreshBtnStyle}
            onClick={handleRefresh}
            disabled={refreshing}
            onMouseEnter={e => {
              if (!refreshing) {
                e.currentTarget.style.background = 'var(--color-navy-hover)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--color-applied-teal)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <RefreshCw size={14} strokeWidth={2.2} />
            {refreshing ? 'Refreshing...' : 'Refresh list'}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={filterBarStyle}>
        <FilterDropdown
          label="All Locations"
          unit="locations"
          groups={LOCATION_GROUPS}
          selected={selectedLocations}
          onChange={setSelectedLocations}
          minWidth="170px"
        />
        <FilterDropdown
          label="All Types"
          unit="types"
          groups={JOB_TYPE_GROUPS}
          selected={selectedSubTypes}
          onChange={setSelectedSubTypes}
          minWidth="210px"
        />
        <FilterDropdown
          label="All Sectors"
          unit="sectors"
          groups={SECTOR_GROUPS}
          selected={selectedSectors}
          onChange={setSelectedSectors}
          minWidth="220px"
        />

        {/* Date — single-select */}
        <select
          style={selectStyle}
          value={datePosted}
          onChange={e => setDatePosted(e.target.value)}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-applied-teal)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(47,111,115,0.14)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <option value="any">Any Time</option>
          <option value="24h">Last 24h</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>

        {/* Keyword search */}
        <div style={searchWrapperStyle}>
          <Search size={14} color="var(--color-text-muted)" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search jobs..."
            style={searchInputStyle}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onFocus={e => {
              e.currentTarget.parentElement.style.borderColor = 'var(--color-applied-teal)'
              e.currentTarget.parentElement.style.boxShadow = '0 0 0 3px rgba(47,111,115,0.14)'
            }}
            onBlur={e => {
              e.currentTarget.parentElement.style.borderColor = 'var(--color-border)'
              e.currentTarget.parentElement.style.boxShadow = 'none'
            }}
          />
        </div>
      </div>

      <RecommendedJobsBand
        enabled={recommendationsEnabled}
        onEnabledChange={setRecommendationsEnabled}
        recommendations={recommendedJobs}
        loading={recommendationsLoading}
        error={recommendationError}
        warning={recommendationWarning}
      />

      {/* Error Banner */}
      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', fontSize: '14px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Job Grid */}
      {loading ? (
        <div style={gridStyle}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayedJobs.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', gap: '8px' }}>
          <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Find or add a job to start building your application list.</p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Try adjusting the filters or add a manual job from Tracker.</p>
        </div>
      ) : (
        <div style={gridStyle}>
          {displayedJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onSave={result => {
                if (result?.authRequired) {
                  setToast('Log in or sign up to save jobs.')
                } else if (result?.error) {
                  setToast('Could not save this job yet.')
                } else {
                  setToast(result?.existing ? 'This application already exists in Tracker.' : 'Job saved to Tracker.')
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
