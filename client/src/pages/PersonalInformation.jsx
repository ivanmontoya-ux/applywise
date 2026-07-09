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
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { deletePersonalInformation, fetchPersonalInformation, savePersonalInformation } from '../lib/api'

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
const inputStyle = {
  width: '100%',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  minHeight: 40,
  padding: '9px 11px',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '13px',
  lineHeight: '1.5',
  outline: 'none',
}
const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '800',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: 0,
  marginBottom: '5px',
}
const smallButtonStyle = {
  minHeight: 32,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  padding: '0 10px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: '#ffffff',
  color: 'var(--color-text-secondary)',
  fontSize: '12px',
  fontWeight: '800',
  cursor: 'pointer',
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

function EmptyState({ error, onCreate }) {
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
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/documents" style={primaryLinkStyle}>
            <FileText size={15} strokeWidth={2.4} />
            Extract from CV
          </Link>
          <button type="button" onClick={onCreate} style={{ ...secondaryButtonStyle, minHeight: 42 }}>
            <Plus size={15} strokeWidth={2.5} />
            Create manually
          </button>
        </div>
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

const SKILL_GROUPS = [
  ['technical', 'Technical'],
  ['business', 'Business'],
  ['tools', 'Tools'],
  ['languages', 'Languages'],
  ['other', 'Other'],
]

function splitLines(value) {
  return String(value || '')
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
}

function joinLines(value) {
  return Array.isArray(value) ? value.join('\n') : ''
}

function splitCsv(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function joinCsv(value) {
  return Array.isArray(value) ? value.join(', ') : ''
}

function blankProfile() {
  return {
    candidate_name: '',
    headline: '',
    summary: '',
    contact: { email: '', phone: '', location: '', linkedin: '', portfolio: '' },
    education: [],
    experience: [],
    projects: [],
    skills: { technical: [], business: [], tools: [], languages: [], other: [] },
    certifications: [],
    evidence_points: [],
    missing_fields: [],
    extraction_notes: [],
  }
}

function editableProfile(profile) {
  const base = blankProfile()
  const source = profile || {}
  return {
    ...base,
    ...source,
    contact: { ...base.contact, ...(source.contact || {}) },
    skills: { ...base.skills, ...(source.skills || {}) },
    education: Array.isArray(source.education) ? source.education : [],
    experience: Array.isArray(source.experience) ? source.experience : [],
    projects: Array.isArray(source.projects) ? source.projects : [],
    certifications: Array.isArray(source.certifications) ? source.certifications : [],
    evidence_points: Array.isArray(source.evidence_points) ? source.evidence_points : [],
    missing_fields: Array.isArray(source.missing_fields) ? source.missing_fields : [],
    extraction_notes: Array.isArray(source.extraction_notes) ? source.extraction_notes : [],
  }
}

function hasMeaningfulValue(value) {
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (value && typeof value === 'object') return Object.values(value).some(hasMeaningfulValue)
  return Boolean(String(value || '').trim())
}

function cleanStringArray(items) {
  return (Array.isArray(items) ? items : [])
    .map(item => String(item || '').trim())
    .filter(Boolean)
}

function cleanObjectArray(items) {
  return (Array.isArray(items) ? items : [])
    .map(item => {
      const next = { ...(item || {}) }
      if (Array.isArray(next.details)) next.details = cleanStringArray(next.details)
      if (Array.isArray(next.achievements)) next.achievements = cleanStringArray(next.achievements)
      if (Array.isArray(next.outcomes)) next.outcomes = cleanStringArray(next.outcomes)
      if (Array.isArray(next.skills_used)) next.skills_used = cleanStringArray(next.skills_used)
      Object.keys(next).forEach(key => {
        if (typeof next[key] === 'string') next[key] = next[key].trim()
      })
      return next
    })
    .filter(hasMeaningfulValue)
}

function cleanProfileDraft(profile) {
  const draft = editableProfile(profile)
  return {
    ...draft,
    candidate_name: String(draft.candidate_name || '').trim(),
    headline: String(draft.headline || '').trim(),
    summary: String(draft.summary || '').trim(),
    contact: Object.fromEntries(Object.entries(draft.contact || {}).map(([key, value]) => [key, String(value || '').trim()])),
    skills: Object.fromEntries(SKILL_GROUPS.map(([group]) => [group, cleanStringArray(draft.skills?.[group])])),
    education: cleanObjectArray(draft.education),
    experience: cleanObjectArray(draft.experience),
    projects: cleanObjectArray(draft.projects),
    certifications: cleanObjectArray(draft.certifications),
    evidence_points: cleanObjectArray(draft.evidence_points),
    missing_fields: cleanStringArray(draft.missing_fields),
    extraction_notes: cleanStringArray(draft.extraction_notes),
  }
}

function blankItem(section) {
  if (section === 'education') return { degree: '', field: '', institution: '', location: '', start_date: '', end_date: '', details: [] }
  if (section === 'experience') return { role: '', organization: '', location: '', start_date: '', end_date: '', achievements: [], skills_used: [] }
  if (section === 'projects') return { title: '', context: '', description: '', outcomes: [], skills_used: [] }
  if (section === 'certifications') return { name: '', issuer: '', date: '' }
  if (section === 'evidence_points') return { evidence: '', category: '', source_section: 'Manual edit' }
  return {}
}

function singularLabel(title) {
  if (title === 'Experience') return 'experience'
  if (title === 'Education') return 'education'
  if (title === 'Evidence points') return 'evidence point'
  if (title.endsWith('s')) return title.slice(0, -1).toLowerCase()
  return title.toLowerCase()
}

function TextInput({ label, value, onChange, placeholder = '' }) {
  return (
    <label>
      <span style={labelStyle}>{label}</span>
      <input value={value || ''} onChange={event => onChange(event.target.value)} placeholder={placeholder} style={inputStyle} />
    </label>
  )
}

function TextAreaInput({ label, value, onChange, placeholder = '', rows = 3 }) {
  return (
    <label>
      <span style={labelStyle}>{label}</span>
      <textarea value={value || ''} onChange={event => onChange(event.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputStyle, resize: 'vertical' }} />
    </label>
  )
}

function ProfileEditor({ draft, setDraft, onSave, onCancel, saving }) {
  function updateField(field, value) {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  function updateContact(field, value) {
    setDraft(prev => ({ ...prev, contact: { ...(prev.contact || {}), [field]: value } }))
  }

  function updateSkill(group, index, value) {
    setDraft(prev => {
      const items = [...(prev.skills?.[group] || [])]
      items[index] = value
      return { ...prev, skills: { ...(prev.skills || {}), [group]: items } }
    })
  }

  function addSkill(group) {
    setDraft(prev => ({
      ...prev,
      skills: { ...(prev.skills || {}), [group]: [...(prev.skills?.[group] || []), ''] },
    }))
  }

  function removeSkill(group, index) {
    setDraft(prev => ({
      ...prev,
      skills: {
        ...(prev.skills || {}),
        [group]: (prev.skills?.[group] || []).filter((_, itemIndex) => itemIndex !== index),
      },
    }))
  }

  function addItem(section) {
    setDraft(prev => ({ ...prev, [section]: [...(prev[section] || []), blankItem(section)] }))
  }

  function removeItem(section, index) {
    setDraft(prev => ({ ...prev, [section]: (prev[section] || []).filter((_, itemIndex) => itemIndex !== index) }))
  }

  function updateItem(section, index, field, value) {
    setDraft(prev => {
      const items = [...(prev[section] || [])]
      items[index] = { ...(items[index] || {}), [field]: value }
      return { ...prev, [section]: items }
    })
  }

  function renderItem(section, item, index) {
    if (section === 'education') {
      return (
        <>
          <TextInput label="Degree" value={item.degree} onChange={value => updateItem(section, index, 'degree', value)} />
          <TextInput label="Field" value={item.field} onChange={value => updateItem(section, index, 'field', value)} />
          <TextInput label="Institution" value={item.institution} onChange={value => updateItem(section, index, 'institution', value)} />
          <TextInput label="Location" value={item.location} onChange={value => updateItem(section, index, 'location', value)} />
          <TextInput label="Start date" value={item.start_date} onChange={value => updateItem(section, index, 'start_date', value)} />
          <TextInput label="End date" value={item.end_date} onChange={value => updateItem(section, index, 'end_date', value)} />
          <TextAreaInput label="Details" value={joinLines(item.details)} onChange={value => updateItem(section, index, 'details', splitLines(value))} placeholder="One detail per line" />
        </>
      )
    }

    if (section === 'experience') {
      return (
        <>
          <TextInput label="Role" value={item.role} onChange={value => updateItem(section, index, 'role', value)} />
          <TextInput label="Organization" value={item.organization} onChange={value => updateItem(section, index, 'organization', value)} />
          <TextInput label="Location" value={item.location} onChange={value => updateItem(section, index, 'location', value)} />
          <TextInput label="Start date" value={item.start_date} onChange={value => updateItem(section, index, 'start_date', value)} />
          <TextInput label="End date" value={item.end_date} onChange={value => updateItem(section, index, 'end_date', value)} />
          <TextAreaInput label="Achievements" value={joinLines(item.achievements)} onChange={value => updateItem(section, index, 'achievements', splitLines(value))} placeholder="One achievement per line" />
          <TextInput label="Skills used" value={joinCsv(item.skills_used)} onChange={value => updateItem(section, index, 'skills_used', splitCsv(value))} placeholder="Excel, SQL, presentation" />
        </>
      )
    }

    if (section === 'projects') {
      return (
        <>
          <TextInput label="Title" value={item.title} onChange={value => updateItem(section, index, 'title', value)} />
          <TextInput label="Context" value={item.context} onChange={value => updateItem(section, index, 'context', value)} />
          <TextAreaInput label="Description" value={item.description} onChange={value => updateItem(section, index, 'description', value)} />
          <TextAreaInput label="Outcomes" value={joinLines(item.outcomes)} onChange={value => updateItem(section, index, 'outcomes', splitLines(value))} placeholder="One outcome per line" />
          <TextInput label="Skills used" value={joinCsv(item.skills_used)} onChange={value => updateItem(section, index, 'skills_used', splitCsv(value))} placeholder="Research, strategy, PowerPoint" />
        </>
      )
    }

    if (section === 'certifications') {
      return (
        <>
          <TextInput label="Name" value={item.name} onChange={value => updateItem(section, index, 'name', value)} />
          <TextInput label="Issuer" value={item.issuer} onChange={value => updateItem(section, index, 'issuer', value)} />
          <TextInput label="Date" value={item.date} onChange={value => updateItem(section, index, 'date', value)} />
        </>
      )
    }

    return (
      <>
        <TextAreaInput label="Evidence" value={item.evidence} onChange={value => updateItem(section, index, 'evidence', value)} />
        <TextInput label="Category" value={item.category} onChange={value => updateItem(section, index, 'category', value)} placeholder="Experience, skill, project..." />
        <TextInput label="Source" value={item.source_section} onChange={value => updateItem(section, index, 'source_section', value)} />
      </>
    )
  }

  function renderArraySection(section, title) {
    const items = draft[section] || []
    return (
      <Section icon={section === 'education' ? GraduationCap : section === 'experience' ? Briefcase : section === 'projects' ? FileText : section === 'certifications' ? ShieldCheck : CheckCircle2} title={title}>
        <div style={{ display: 'grid', gap: '12px' }}>
          {items.map((item, index) => (
            <article key={index} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px', background: '#fbfdff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{singularLabel(title)} {index + 1}</strong>
                <button type="button" onClick={() => removeItem(section, index)} style={{ ...smallButtonStyle, color: 'var(--color-danger)' }}>
                  <Trash2 size={13} strokeWidth={2.4} />
                  Delete
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
                {renderItem(section, item, index)}
              </div>
            </article>
          ))}
          <button type="button" onClick={() => addItem(section)} style={{ ...smallButtonStyle, justifySelf: 'start' }}>
            <Plus size={13} strokeWidth={2.5} />
            Add {singularLabel(title)}
          </button>
        </div>
      </Section>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <section style={{ ...panelStyle, padding: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
          <TextInput label="Name" value={draft.candidate_name} onChange={value => updateField('candidate_name', value)} />
          <TextInput label="Headline" value={draft.headline} onChange={value => updateField('headline', value)} />
          <TextAreaInput label="Summary" value={draft.summary} onChange={value => updateField('summary', value)} rows={4} />
          <TextInput label="Email" value={draft.contact?.email} onChange={value => updateContact('email', value)} />
          <TextInput label="Phone" value={draft.contact?.phone} onChange={value => updateContact('phone', value)} />
          <TextInput label="Location" value={draft.contact?.location} onChange={value => updateContact('location', value)} />
          <TextInput label="LinkedIn" value={draft.contact?.linkedin} onChange={value => updateContact('linkedin', value)} />
          <TextInput label="Portfolio" value={draft.contact?.portfolio} onChange={value => updateContact('portfolio', value)} />
        </div>
      </section>

      <Section icon={Lightbulb} title="Skills">
        <div style={{ display: 'grid', gap: '14px' }}>
          {SKILL_GROUPS.map(([group, label]) => (
            <div key={group}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '800', marginBottom: '8px' }}>{label}</p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {(draft.skills?.[group] || []).map((item, index) => (
                  <div key={`${group}-${index}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '8px' }}>
                    <input value={item || ''} onChange={event => updateSkill(group, index, event.target.value)} style={inputStyle} />
                    <button type="button" onClick={() => removeSkill(group, index)} style={{ ...smallButtonStyle, color: 'var(--color-danger)' }}>
                      <X size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addSkill(group)} style={{ ...smallButtonStyle, justifySelf: 'start' }}>
                  <Plus size={13} strokeWidth={2.5} />
                  Add {label.toLowerCase()}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {renderArraySection('experience', 'Experience')}
      {renderArraySection('education', 'Education')}
      {renderArraySection('projects', 'Projects')}
      {renderArraySection('certifications', 'Certifications')}
      {renderArraySection('evidence_points', 'Evidence points')}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={secondaryButtonStyle} disabled={saving}>
          <X size={15} strokeWidth={2.5} />
          Cancel
        </button>
        <button type="button" onClick={onSave} style={{ ...primaryLinkStyle, border: 'none', cursor: 'pointer', opacity: saving ? 0.65 : 1 }} disabled={saving}>
          {saving ? <CheckCircle2 size={15} strokeWidth={2.5} /> : <Save size={15} strokeWidth={2.5} />}
          {saving ? 'Saving...' : 'Save personal information'}
        </button>
      </div>
    </div>
  )
}

export default function PersonalInformation() {
  const auth = useAuth()
  const [profile, setProfile] = useState(null)
  const [draftProfile, setDraftProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

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
    if (!auth.session) {
      setError('Log in or sign up before clearing saved personal information.')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await deletePersonalInformation()
      setProfile(null)
      setDraftProfile(null)
      setEditing(false)
      setNotice('Personal information cleared.')
    } catch {
      setError('Personal information could not be cleared yet.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit() {
    setDraftProfile(editableProfile(profile))
    setEditing(true)
    setError('')
    setNotice('')
  }

  function startCreate() {
    setDraftProfile(blankProfile())
    setEditing(true)
    setError('')
    setNotice('')
  }

  function cancelEdit() {
    setDraftProfile(null)
    setEditing(false)
    setError('')
  }

  async function handleSaveProfile() {
    if (!auth.session) {
      setError('Log in or sign up before saving personal information.')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const result = await savePersonalInformation(cleanProfileDraft(draftProfile), profile ? 'manual_edit' : 'manual_create')
      setProfile(result.profile || null)
      setDraftProfile(null)
      setEditing(false)
      setNotice('Personal information saved.')
    } catch (err) {
      const detail = err?.response?.data?.error || err?.message || 'Personal information could not be saved yet.'
      setError(detail)
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

  if (!profile && !editing) {
    return (
      <div style={pageStyle}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={titleStyle}>Personal Information</h1>
          <p style={subtitleStyle}>Saved CV information that can be reused across ApplyWise.</p>
        </div>
        {notice && (
          <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', background: '#f0fdf4', color: 'var(--color-success)', fontSize: '14px' }}>
            {notice}
          </div>
        )}
        <EmptyState error={error} onCreate={startCreate} />
      </div>
    )
  }

  if (editing) {
    return (
      <div style={pageStyle}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={titleStyle}>Personal Information</h1>
            <p style={subtitleStyle}>Add, edit, or delete profile details used by ApplyWise for CV reviews, cover letters, and job recommendations.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" onClick={cancelEdit} style={secondaryButtonStyle} disabled={saving}>
              <X size={15} strokeWidth={2.5} />
              Cancel
            </button>
            <button type="button" onClick={handleSaveProfile} style={{ ...primaryLinkStyle, border: 'none', cursor: 'pointer', opacity: saving ? 0.65 : 1 }} disabled={saving}>
              <Save size={15} strokeWidth={2.5} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </header>

        {error && (
          <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', background: '#fef2f2', color: 'var(--color-danger)', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <ProfileEditor
          draft={draftProfile || blankProfile()}
          setDraft={setDraftProfile}
          onSave={handleSaveProfile}
          onCancel={cancelEdit}
          saving={saving}
        />
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
            onClick={startEdit}
            disabled={saving}
            style={secondaryButtonStyle}
          >
            <Pencil size={15} strokeWidth={2.4} />
            Edit
          </button>
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

      {notice && (
        <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', background: '#f0fdf4', color: 'var(--color-success)', fontSize: '14px' }}>
          {notice}
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
