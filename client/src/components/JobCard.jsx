import React, { useState } from 'react'
import { MapPin, ExternalLink, Bookmark, BookmarkCheck, Calendar, RefreshCcw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { saveJob } from '../lib/api'
import { buildDirectUrl, isKnownEmployer } from '../lib/careers'

const NEUTRAL_CHIP_STYLE = { bg: '#f4f4f5', color: '#52525b', dot: '#71717a' }
const TEAL_CHIP_STYLE = { bg: '#edf7f7', color: '#2f6f73', dot: '#2f6f73' }
const LEVEL_STYLES = {
  'Graduate': TEAL_CHIP_STYLE,
  'Internship': TEAL_CHIP_STYLE,
  'Analyst': TEAL_CHIP_STYLE,
  'Associate': NEUTRAL_CHIP_STYLE,
  'Entry Level': TEAL_CHIP_STYLE,
  'Mid Level': NEUTRAL_CHIP_STYLE,
  'Senior': NEUTRAL_CHIP_STYLE,
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
  'accenture': 'accenture.com',
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
  'amazon': 'amazon.com',
  "l'oreal": 'loreal.com',
  'booking.com': 'booking.com',
  'salesforce': 'salesforce.com',
  'procter & gamble': 'pg.com',
  'spotify': 'spotify.com',
  'siemens': 'siemens.com',
  'heineken': 'theheinekencompany.com',
  'hubspot': 'hubspot.com',
  'nestle': 'nestle.com',
  'maersk': 'maersk.com',
  'zalando': 'zalando.com',
  'wise': 'wise.com',
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
        fontSize: '12px', color: 'var(--color-info)', fontWeight: '700',
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
        fontSize: '12px', color: 'var(--color-warning)', fontWeight: '700',
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
      const result = await saveJob(job)
      setSaved(true)
      onSave?.(result)
    } catch (err) {
      if (err?.response?.status === 401) {
        onSave?.({ authRequired: true })
      } else {
        onSave?.({ error: true })
      }
    } finally {
      setSaving(false)
    }
  }

  const sector = NEUTRAL_CHIP_STYLE

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
              minHeight: 44,
              padding: '0 14px', borderRadius: 'var(--radius-md)',
              border: saved ? '1.5px solid #bbf7d0' : '1.5px solid var(--color-border-strong)',
              background: saved ? '#f0fdf4' : 'transparent',
              color: saved ? 'var(--color-success)' : 'var(--color-text-secondary)',
              fontSize: '12px', fontWeight: '700',
              cursor: saved ? 'default' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              if (!saved) {
                e.currentTarget.style.borderColor = 'var(--color-applied-teal)'
                e.currentTarget.style.color = 'var(--color-applied-teal)'
                e.currentTarget.style.background = '#edf7f7'
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
              minHeight: 44,
              padding: '0 12px', borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: '12px', fontWeight: '700', textDecoration: 'none',
              border: '1.5px solid var(--color-border-strong)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-applied-teal)'
              e.currentTarget.style.color = 'var(--color-applied-teal)'
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
              minHeight: 44,
              padding: '0 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-applied-teal)', color: '#ffffff',
              fontSize: '12px', fontWeight: '700', textDecoration: 'none',
              transition: 'background 0.15s ease',
              border: '1.5px solid transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-navy-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-applied-teal)'}
          >
            <ExternalLink size={12} strokeWidth={2.5} />
            Apply Direct
          </a>
        </div>
      </div>
    </div>
  )
}
