import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  FileText,
  GraduationCap,
  Lightbulb,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { deletePersonalInformation, fetchPersonalInformation } from '../lib/api'

const pageStyle = { padding: '36px 40px', maxWidth: '1180px' }
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '400', maxWidth: '680px' }
const panelStyle = {
  background: '#ffffff',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}
const primaryLinkStyle = {
  minHeight: 42,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '800',
  textDecoration: 'none',
  boxShadow: 'var(--shadow-primary)',
  transition: 'background 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease',
}
const secondaryButtonStyle = {
  minHeight: 42,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: '#ffffff',
  color: 'var(--color-text-secondary)',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-sm)',
}

function Section({ icon: Icon, title, children }) {
  return (
    <section style={{ ...panelStyle, padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
        <span style={{
          width: 30,
          height: 30,
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-applied-teal-soft)',
          color: 'var(--color-applied-teal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} strokeWidth={2.4} />
        </span>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function EmptyState({ error }) {
  return (
    <div style={{
      ...panelStyle,
      minHeight: '420px',
      padding: '42px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '12px',
    }}>
      <span style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: error ? '#fff1f2' : 'var(--color-applied-teal-soft)',
        color: error ? 'var(--color-danger)' : 'var(--color-applied-teal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {error ? <AlertCircle size={24} strokeWidth={2.2} /> : <UserRound size={24} strokeWidth={2.2} />}
      </span>
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '5px' }}>
          {error ? 'Personal information could not load' : 'No personal information saved yet'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '400px', lineHeight: '1.55' }}>
          {error || 'Extract a CV profile from Documents to save your contact details, education, experience, skills, and evidence in one place.'}
        </p>
      </div>
      {!error && (
        <Link to="/documents" style={primaryLinkStyle}>
          <FileText size={15} strokeWidth={2.4} />
          Extract from CV
        </Link>
      )}
    </div>
  )
}

function FieldRows({ rows }) {
  const visibleRows = rows.filter(row => row.value)
  if (!visibleRows.length) return <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No items saved.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {visibleRows.map(row => (
        <div key={row.label}>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0', marginBottom: '2px' }}>
            {row.label}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.45', overflowWrap: 'anywhere' }}>
            {row.value}
          </p>
        </div>
      ))}
    </div>
  )
}

function PillList({ items }) {
  if (!items?.length) return <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No items saved.</p>

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          style={{
            border: '1px solid #bddbf5',
            background: 'var(--color-applied-teal-soft)',
            color: 'var(--color-applied-teal)',
            borderRadius: '999px',
            padding: '5px 9px',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function DetailList({ items }) {
  if (!items?.length) return null

  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px' }}>
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '13px',
            lineHeight: '1.5',
            paddingLeft: '12px',
            position: 'relative',
          }}
        >
          <span style={{
            position: 'absolute',
            left: 0,
            top: '9px',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--color-applied-teal)',
          }} />
          {item}
        </li>
      ))}
    </ul>
  )
}

function PairList({ items, fields }) {
  if (!items?.length) return <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No items saved.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item, index) => (
        <article key={index} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '13px 14px', background: '#fbfdff' }}>
          {fields.map(({ key, label, strong }) => (
            item?.[key] ? (
              <p
                key={key}
                style={{
                  color: strong ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  fontWeight: strong ? '600' : '400',
                  marginBottom: key === fields[fields.length - 1].key ? 0 : '5px',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)', fontWeight: '600' }}>{label}: </span>
                {item[key]}
              </p>
            ) : null
          ))}
        </article>
      ))}
    </div>
  )
}

function dateRange(item) {
  return [item?.start_date, item?.end_date].filter(Boolean).join(' - ')
}

function formatUpdatedAt(value) {
  if (!value) return ''
  const date = new Date(value.endsWith('Z') ? value : `${value}Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PersonalInformation() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setLoading(true)
      setError('')
      try {
        const result = await fetchPersonalInformation()
        if (!cancelled) setProfile(result.profile || null)
      } catch {
        if (!cancelled) setError('Make sure the local server is running, then try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProfile()
    return () => { cancelled = true }
  }, [])

  const contactRows = useMemo(() => [
    { label: 'Email', value: profile?.contact?.email },
    { label: 'Phone', value: profile?.contact?.phone },
    { label: 'Location', value: profile?.contact?.location },
    { label: 'LinkedIn', value: profile?.contact?.linkedin },
    { label: 'Portfolio', value: profile?.contact?.portfolio },
  ], [profile])

  const skillGroups = useMemo(() => [
    { label: 'Technical', items: profile?.skills?.technical },
    { label: 'Business', items: profile?.skills?.business },
    { label: 'Tools', items: profile?.skills?.tools },
    { label: 'Languages', items: profile?.skills?.languages },
    { label: 'Other', items: profile?.skills?.other },
  ].filter(group => group.items?.length), [profile])

  async function handleDelete() {
    setSaving(true)
    setError('')
    try {
      await deletePersonalInformation()
      setProfile(null)
    } catch {
      setError('Personal information could not be cleared yet.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>Personal Information</h1>
        <p style={subtitleStyle}>Loading saved CV information...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={pageStyle}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={titleStyle}>Personal Information</h1>
          <p style={subtitleStyle}>Saved CV information that can be reused across ApplyWise.</p>
        </div>
        <EmptyState error={error} />
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={titleStyle}>Personal Information</h1>
          <p style={subtitleStyle}>Saved CV information that can be reused for job fit checks, cover letters, reminders, and future profile features.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link to="/documents" style={primaryLinkStyle}>
            <FileText size={15} strokeWidth={2.4} />
            Update from CV
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            style={{
              ...secondaryButtonStyle,
              color: 'var(--color-danger)',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Trash2 size={15} strokeWidth={2.4} />
            {saving ? 'Clearing...' : 'Clear'}
          </button>
        </div>
      </header>

      {error && (
        <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', background: '#fef2f2', color: 'var(--color-danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <section style={{ ...panelStyle, padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '13px', alignItems: 'flex-start' }}>
          <span style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-applied-teal-soft)',
            color: 'var(--color-applied-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <UserRound size={21} strokeWidth={2.3} />
          </span>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0', marginBottom: '6px' }}>
              Saved profile
            </p>
            <h2 style={{ fontSize: '19px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {profile.candidate_name || 'Extracted CV profile'}
            </h2>
            {profile.headline && (
              <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '600', lineHeight: '1.45', marginBottom: '5px' }}>
                {profile.headline}
              </p>
            )}
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>
              {profile.summary || 'No profile summary saved yet.'}
            </p>
            {profile.updated_at && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '10px' }}>
                Last updated {formatUpdatedAt(profile.updated_at)}
              </p>
            )}
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <Section icon={Mail} title="Contact details">
            <FieldRows rows={contactRows} />
          </Section>
          <Section icon={Lightbulb} title="Skills">
            {skillGroups.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {skillGroups.map(group => (
                  <div key={group.label}>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '8px' }}>
                      {group.label}
                    </p>
                    <PillList items={group.items} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No skills saved.</p>
            )}
          </Section>
        </div>

        <Section icon={Briefcase} title="Experience">
          {profile.experience?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.experience.map((item, index) => (
                <article key={index} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '13px 14px', background: '#fbfdff' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    {item.role || item.organization || 'Experience'}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                    {[item.organization, item.location, dateRange(item)].filter(Boolean).join(' - ')}
                  </p>
                  <DetailList items={item.achievements} />
                  {item.skills_used?.length ? <div style={{ marginTop: '11px' }}><PillList items={item.skills_used} /></div> : null}
                </article>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No experience saved.</p>
          )}
        </Section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <Section icon={GraduationCap} title="Education">
            {profile.education?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profile.education.map((item, index) => (
                  <article key={index} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '13px 14px', background: '#fbfdff' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                      {[item.degree, item.field].filter(Boolean).join(' in ') || item.institution || 'Education'}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                      {[item.institution, item.location, dateRange(item)].filter(Boolean).join(' - ')}
                    </p>
                    <DetailList items={item.details} />
                  </article>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No education saved.</p>
            )}
          </Section>

          <Section icon={FileText} title="Projects">
            {profile.projects?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profile.projects.map((item, index) => (
                  <article key={index} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '13px 14px', background: '#fbfdff' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                      {item.title || 'Project'}
                    </h3>
                    {[item.context, item.description].filter(Boolean).map((text, textIndex) => (
                      <p key={textIndex} style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '6px' }}>
                        {text}
                      </p>
                    ))}
                    <DetailList items={item.outcomes} />
                    {item.skills_used?.length ? <div style={{ marginTop: '11px' }}><PillList items={item.skills_used} /></div> : null}
                  </article>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No projects saved.</p>
            )}
          </Section>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <Section icon={ShieldCheck} title="Certifications">
            <PairList
              items={profile.certifications}
              fields={[
                { key: 'name', label: 'Name', strong: true },
                { key: 'issuer', label: 'Issuer' },
                { key: 'date', label: 'Date' },
              ]}
            />
          </Section>
          <Section icon={CheckCircle2} title="Evidence points">
            <PairList
              items={profile.evidence_points}
              fields={[
                { key: 'evidence', label: 'Evidence', strong: true },
                { key: 'category', label: 'Category' },
                { key: 'source_section', label: 'Source' },
              ]}
            />
          </Section>
        </div>
      </div>
    </div>
  )
}
