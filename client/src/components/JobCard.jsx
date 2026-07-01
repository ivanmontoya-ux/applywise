import React, { useState } from 'react'
import { MapPin, ExternalLink, Bookmark, BookmarkCheck, Calendar, RefreshCcw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { saveJob } from '../lib/api'
import { buildDirectUrl, isKnownEmployer } from '../lib/careers'

const SECTOR_COLORS = {
  // Original sectors
  'Investment Banking':    { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  'Asset Management':      { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  'Wealth Management':     { bg: '#f3e8ff', color: '#6b21a8', dot: '#a855f7' },
  'M&A':                   { bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
  'Private Equity':        { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
  'Venture Capital':       { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  'Commercial Banking':    { bg: '#e0f2fe', color: '#0c4a6e', dot: '#0ea5e9' },
  'Private Banking':       { bg: '#fce7f3', color: '#831843', dot: '#ec4899' },
  // New sectors
  'Sales & Trading':              { bg: '#ccfbf1', color: '#115e59', dot: '#14b8a6' },
  'Brokerage & Market Making':    { bg: '#ffe4e6', color: '#9f1239', dot: '#f43f5e' },
  'Equity Research':              { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
  'Risk Management':              { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626' },
  'Quantitative Analysis':        { bg: '#f5f3ff', color: '#4c1d95', dot: '#8b5cf6' },
  'Financial Advisory':           { bg: '#f7fee7', color: '#3f6212', dot: '#84cc16' },
  'Corporate Finance':            { bg: '#cffafe', color: '#155e75', dot: '#0891b2' },
  'Treasury':                     { bg: '#fefce8', color: '#713f12', dot: '#ca8a04' },
  'Compliance & Regulatory':      { bg: '#fdf4ff', color: '#86198f', dot: '#c026d3' },
  'Financial Technology (FinTech)': { bg: '#f0fdfa', color: '#134e4a', dot: '#0d9488' },
}

const LEVEL_STYLES = {
  'Graduate':    { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  'Internship':  { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  'Analyst':     { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
  'Associate':   { bg: '#f3e8ff', color: '#7e22ce', dot: '#a855f7' },
  'Entry Level': { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  'Mid Level':   { bg: '#f0f9ff', color: '#0369a1', dot: '#0ea5e9' },
  'Senior':      { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
}

const DOMAIN_MAP = {
  'goldman sachs': 'goldmansachs.com',
  'blackrock': 'blackrock.com',
  'morgan stanley': 'morganstanley.com',
  'ubs': 'ubs.com',
  'kkr': 'kkr.com',
  'sequoia capital': 'sequoiacap.com',
  'ing group': 'ing.com',
  'santander': 'santander.com',
  'jpmorgan': 'jpmorgan.com',
  'jp morgan': 'jpmorgan.com',
  'jpmorgan chase': 'jpmorganchase.com',
  'jp morgan chase': 'jpmorganchase.com',
  'pimco': 'pimco.com',
  'barclays': 'barclays.com',
  'hsbc': 'hsbc.com',
  'bnp paribas': 'bnpparibas.com',
  'deutsche bank': 'db.com',
  'nomura': 'nomura.com',
  'citi': 'citi.com',
  'citigroup': 'citi.com',
  'société générale': 'societegenerale.com',
  'societe generale': 'societegenerale.com',
  'lazard': 'lazard.com',
  'rothschild & co': 'rothschildandco.com',
  'rothschild': 'rothschildandco.com',
  'two sigma': 'twosigma.com',
  'aqr capital': 'aqr.com',
  'shell': 'shell.com',
  'kpmg': 'kpmg.com',
  'pwc': 'pwc.com',
  'deloitte': 'deloitte.com',
  'ey': 'ey.com',
  'ernst & young': 'ey.com',
  'mckinsey': 'mckinsey.com',
  'bain': 'bain.com',
  'bcg': 'bcg.com',
  'boston consulting group': 'bcg.com',
  'unilever': 'unilever.com',
  'philips': 'philips.com',
  'bbva': 'bbva.com',
  'revolut': 'revolut.com',
  'n26': 'n26.com',
  'virtu financial': 'virtu.com',
  'imc trading': 'imc.com',
  'willis towers watson': 'willistowerswatson.com',
  'q energy': 'q-energy.com',
  'credit suisse': 'credit-suisse.com',
  'bank of america': 'bankofamerica.com',
  'wells fargo': 'wellsfargo.com',
  'blackstone': 'blackstone.com',
  'apollo global management': 'apollo.com',
  'carlyle': 'carlyle.com',
  'citadel': 'citadel.com',
  'man group': 'man.com',
  'schroders': 'schroders.com',
  'fidelity': 'fidelity.com',
  'vanguard': 'vanguard.com',
  'ubs group': 'ubs.com',
  'credit agricole': 'credit-agricole.com',
}

function guessDomain(company) {
  return (company || '')
    .toLowerCase()
    .trim()
    .replace(/\s*&\s*co\.?\s*$/i, '')
    .replace(/\s+(group|capital|management|partners|associates|advisory|holdings?|inc\.?|ltd\.?|llc|plc|ag|sa|bv|se|nv|limited|corporation|corp\.?|gmbh|spa|srl)\s*$/i, '')
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    + '.com'
}

function CompanyAvatar({ company }) {
  const [stage, setStage] = useState(0) // 0=clearbit, 1=google-favicon, 2=initials
  const initial = (company || '?').charAt(0).toUpperCase()

  const domain = DOMAIN_MAP[(company || '').toLowerCase().trim()] || guessDomain(company)

  const containerStyle = {
    width: 44, height: 44,
    borderRadius: '50%',
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    flexShrink: 0,
    overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  }

  if (stage >= 2) {
    return (
      <div style={{ ...containerStyle, background: '#f1f5f9', border: '1.5px solid #e2e8f0' }}>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#64748b', lineHeight: 1 }}>
          {initial}
        </span>
      </div>
    )
  }

  const imgSrc = stage === 0
    ? `https://logo.clearbit.com/${domain}`
    : `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  const imgSize = stage === 0 ? 36 : 28

  return (
    <div style={containerStyle}>
      <img
        key={imgSrc}
        src={imgSrc}
        alt={company}
        style={{ width: imgSize, height: imgSize, objectFit: 'contain' }}
        onError={() => setStage(s => s + 1)}
      />
    </div>
  )
}

function formatSalary(min, max, currency) {
  if (!min && !max) return null
  const fmt = (n) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)
  const sym = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
  if (min && max) return `${sym}${fmt(min)} – ${sym}${fmt(max)}`
  if (min) return `${sym}${fmt(min)}+`
  return `Up to ${sym}${fmt(max)}`
}

function DeadlineBadge({ deadlineType, deadlineDate }) {
  if (!deadlineType) return null

  if (deadlineType === 'rolling') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '12px', color: '#0891b2', fontWeight: '500',
      }}>
        <RefreshCcw size={11} strokeWidth={2.5} />
        Rolling Applications
      </div>
    )
  }

  if (deadlineType === 'date' && deadlineDate) {
    let formatted = deadlineDate
    try {
      formatted = new Date(deadlineDate).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    } catch (_) {}
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '12px', color: '#c2410c', fontWeight: '500',
      }}>
        <Calendar size={11} strokeWidth={2.5} />
        Apply by {formatted}
      </div>
    )
  }

  return null
}

export default function JobCard({ job, onSave }) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hovered, setHovered] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    if (saved || saving) return
    setSaving(true)
    try {
      await saveJob(job)
      setSaved(true)
      onSave?.()
    } catch (err) {
      console.error('Save failed', err)
    } finally {
      setSaving(false)
    }
  }

  const sector = SECTOR_COLORS[job.sector] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' }

  let timeAgo = ''
  try {
    timeAgo = job.date_posted ? formatDistanceToNow(new Date(job.date_posted), { addSuffix: true }) : ''
  } catch (_) { timeAgo = '' }

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px',
        display: 'flex', flexDirection: 'column', gap: '14px',
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        borderColor: hovered ? 'var(--color-border-strong)' : 'var(--color-border)',
        cursor: 'default',
      }}
    >
      {/* Top: logo + title + company */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <CompanyAvatar company={job.company} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px', fontWeight: '600',
            color: 'var(--color-text-primary)',
            lineHeight: '1.35', marginBottom: '4px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {job.title}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '400' }}>
            {job.company}
          </div>
        </div>
      </div>

      {/* Meta: location + sector + salary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {job.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            <MapPin size={11} strokeWidth={2} />
            {job.location}
          </div>
        )}
        {job.sector && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', fontWeight: '600',
            padding: '3px 9px', borderRadius: '999px',
            background: sector.bg, color: sector.color,
            letterSpacing: '0.01em', flexShrink: 0,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sector.dot, flexShrink: 0 }} />
            {job.sector}
          </span>
        )}
        {job.experience_level && LEVEL_STYLES[job.experience_level] && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', fontWeight: '600',
            padding: '3px 9px', borderRadius: '999px',
            background: LEVEL_STYLES[job.experience_level].bg,
            color: LEVEL_STYLES[job.experience_level].color,
            letterSpacing: '0.01em', flexShrink: 0,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: LEVEL_STYLES[job.experience_level].dot, flexShrink: 0 }} />
            {job.experience_level}
          </span>
        )}
        {salary && (
          <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
            {salary}
          </span>
        )}
      </div>

      {/* Deadline badge */}
      <DeadlineBadge deadlineType={job.deadline_type} deadlineDate={job.deadline_date} />

      {/* Footer: time ago + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{timeAgo}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Save — outlined */}
          <button
            onClick={handleSave}
            disabled={saved || saving}
            title={saved ? 'Saved to tracker' : 'Save to tracker'}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 13px', borderRadius: 'var(--radius-md)',
              border: saved ? '1.5px solid #86efac' : '1.5px solid var(--color-border-strong)',
              background: saved ? '#f0fdf4' : 'transparent',
              color: saved ? '#16a34a' : 'var(--color-text-secondary)',
              fontSize: '12px', fontWeight: '500',
              cursor: saved ? 'default' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              if (!saved) {
                e.currentTarget.style.borderColor = 'var(--color-navy)'
                e.currentTarget.style.color = 'var(--color-navy)'
                e.currentTarget.style.background = '#f0f4ff'
              }
            }}
            onMouseLeave={e => {
              if (!saved) {
                e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {saved ? <BookmarkCheck size={13} strokeWidth={2.5} /> : <Bookmark size={13} strokeWidth={2} />}
            {saved ? 'Saved' : 'Save'}
          </button>

          {/* Source link — outlined secondary */}
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            title="View on original job board"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '7px 11px', borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: '11px', fontWeight: '500', textDecoration: 'none',
              border: '1.5px solid var(--color-border-strong)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-navy)'
              e.currentTarget.style.color = 'var(--color-navy)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border-strong)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            <ExternalLink size={11} strokeWidth={2} />
            Source
          </a>

          {/* Apply Direct — solid navy primary */}
          <a
            href={buildDirectUrl(job.company, job.title)}
            target="_blank"
            rel="noopener noreferrer"
            title={isKnownEmployer(job.company) ? `Go to ${job.company} careers portal` : 'Search on Google'}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 13px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-navy)', color: '#ffffff',
              fontSize: '12px', fontWeight: '500', textDecoration: 'none',
              transition: 'background 0.15s ease',
              border: '1.5px solid transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-navy-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-navy)'}
          >
            <ExternalLink size={12} strokeWidth={2.5} />
            Apply Direct
          </a>
        </div>
      </div>
    </div>
  )
}
