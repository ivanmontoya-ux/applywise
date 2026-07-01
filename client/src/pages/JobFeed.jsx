import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Search, ChevronDown, X, Plus } from 'lucide-react'
import { fetchJobs, refreshJobs } from '../lib/api'
import { classifyJob } from '../lib/classifier'
import JobCard from '../components/JobCard'

// ── Filter data ──────────────────────────────────────────────────────────────

const LOCATION_GROUPS = [
  { title: null, items: ['Madrid', 'London', 'Milan', 'New York', 'Amsterdam'] },
]

const SECTOR_GROUPS = [
  { title: 'Banking',          items: ['Investment Banking', 'Commercial Banking', 'Private Banking', 'Corporate Finance'] },
  { title: 'Markets',          items: ['Sales & Trading', 'Brokerage & Market Making', 'Equity Research', 'Quantitative Analysis'] },
  { title: 'Investments',      items: ['Asset Management', 'Wealth Management', 'Private Equity', 'Venture Capital'] },
  { title: 'Advisory & Other', items: ['M&A', 'Financial Advisory', 'Risk Management', 'Treasury', 'Compliance & Regulatory', 'Financial Technology (FinTech)'] },
]

const JOB_TYPE_GROUPS = [
  { title: 'Graduate Program', items: ['Graduate', 'Trainee', 'Junior', 'Apprentice'] },
  { title: 'Internship',       items: ['Internship', 'Placement', 'Work Experience'] },
  { title: 'Analyst Role',     items: ['Analyst', 'Research', 'Quantitative'] },
  { title: 'Associate',        items: ['Associate', 'Assistant'] },
  { title: 'Entry-Level',      items: ['General'] },
  { title: 'Other',            items: ['Consultant', 'Specialist', 'Officer', 'Coordinator'] },
]

// ── Styles ───────────────────────────────────────────────────────────────────

const pageStyle        = { padding: '36px 40px', maxWidth: '1140px' }
const headerRowStyle   = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }
const titleStyle       = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle    = { fontSize: '16px', color: 'var(--color-text-secondary)', fontWeight: '400' }
const refreshBtnStyle  = {
  display: 'flex', alignItems: 'center', gap: '7px',
  minHeight: 44, padding: '0 16px', background: 'var(--color-applied-teal)', color: '#ffffff',
  border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '700',
  cursor: 'pointer', transition: 'background 0.15s ease', flexShrink: 0,
}
const secondaryLinkStyle = {
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
}
const filterBarStyle   = {
  display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
  marginBottom: '28px', padding: '14px 18px',
  background: '#ffffff',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
  position: 'relative', zIndex: 10,
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
const gridStyle          = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }

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
    <div style={{
      background: 'var(--color-bg)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '14px',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-bg-secondary)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, background: 'var(--color-bg-secondary)', borderRadius: 4, marginBottom: 8, width: '70%' }} />
          <div style={{ height: 12, background: 'var(--color-bg-secondary)', borderRadius: 4, width: '45%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ height: 20, width: 80, background: 'var(--color-bg-secondary)', borderRadius: 999 }} />
        <div style={{ height: 20, width: 100, background: 'var(--color-bg-secondary)', borderRadius: 999 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ height: 12, width: 60, background: 'var(--color-bg-secondary)', borderRadius: 4 }} />
        <div style={{ height: 28, width: 120, background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }} />
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
  const debounceTimer = useRef(null)

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
    try {
      const data = await fetchJobs({
        locations: [...selectedLocations],
        sectors:   [...selectedSectors],
        days:      datePosted,
        q:         debouncedKeyword,
      })
      setJobs(data)
    } catch (err) {
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
      const { grandCategory: gc, subType: st } = job.grand_category
        ? { grandCategory: job.grand_category, subType: job.sub_type }
        : classifyJob(job.title)

      if (selectedSubTypes.size === 0) {
        // Default: hide "Other" category
        return gc !== 'Other'
      }
      return selectedSubTypes.has(st)
    })
  }, [jobs, selectedSubTypes])

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerRowStyle}>
        <div>
          <h1 style={titleStyle}>Jobs</h1>
          <p style={subtitleStyle}>Search stored graduate roles, save strong matches, and keep source URLs attached.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link to="/tracker" style={secondaryLinkStyle}>
            <Plus size={15} strokeWidth={2.5} />
            Add manual job
          </Link>
          <button
            style={refreshBtnStyle}
            onClick={handleRefresh}
            disabled={refreshing}
            onMouseEnter={e => { if (!refreshing) e.currentTarget.style.background = 'var(--color-navy-hover)' }}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-applied-teal)'}
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
