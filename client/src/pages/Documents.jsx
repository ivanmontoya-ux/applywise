import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  FileText,
  Lightbulb,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import { fetchAiStatus, fetchTracker, reviewCv } from '../lib/api'

const MAX_FILE_BYTES = 5 * 1024 * 1024

const pageStyle = { padding: '36px 40px', maxWidth: '1180px' }
const titleStyle = { fontSize: '22px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '400' }
const panelStyle = {
  background: '#ffffff',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}
const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: 'var(--color-text-secondary)',
  marginBottom: '6px',
}
const inputStyle = {
  width: '100%',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  minHeight: 44,
  padding: '10px 12px',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '13px',
  lineHeight: '1.5',
  outline: 'none',
}
const primaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 16px',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
}
const secondaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 14px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: '#ffffff',
  color: 'var(--color-text-secondary)',
  fontSize: '13px',
  fontWeight: '500',
  cursor: 'pointer',
}

function bytesToSize(bytes) {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function guessMimeType(file) {
  if (file.type) return file.type
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return 'application/pdf'
  if (name.endsWith('.doc')) return 'application/msword'
  if (name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (name.endsWith('.md')) return 'text/markdown'
  return 'text/plain'
}

function isTextFile(file) {
  const name = file.name.toLowerCase()
  return file.type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return window.btoa(binary)
}

function recommendationLabel(value) {
  if (value === 'strong_match') return 'Strong match'
  if (value === 'weak_match') return 'Weak match'
  return 'Possible match'
}

function recommendationColor(value) {
  if (value === 'strong_match') return { bg: '#f0fdf4', color: 'var(--color-success)', border: '#bbf7d0' }
  if (value === 'weak_match') return { bg: '#fef2f2', color: 'var(--color-danger)', border: '#fecaca' }
  return { bg: '#edf7f7', color: 'var(--color-applied-teal)', border: '#b9dada' }
}

function Section({ icon: Icon, title, children }) {
  return (
    <section style={{ ...panelStyle, padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
        <span style={{
          width: 30,
          height: 30,
          borderRadius: 'var(--radius-md)',
          background: '#edf7f7',
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

function EmptyReview() {
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
        background: '#edf7f7',
        color: 'var(--color-applied-teal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ListChecks size={24} strokeWidth={2.2} />
      </span>
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '5px' }}>
          CV recommendations will appear here
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '360px' }}>
          Upload or paste a CV, add the job description, then review evidence-based improvements.
        </p>
      </div>
    </div>
  )
}

function TextList({ items }) {
  if (!items?.length) {
    return <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No items returned.</p>
  }

  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          style={{
            display: 'flex',
            gap: '9px',
            color: 'var(--color-text-secondary)',
            fontSize: '13px',
            lineHeight: '1.5',
          }}
        >
          <CheckCircle2 size={15} strokeWidth={2.4} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function PairList({ items, fields }) {
  if (!items?.length) {
    return <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No items returned.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item, index) => (
        <article
          key={index}
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '13px 14px',
            background: '#fbfdff',
          }}
        >
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

function ReviewResults({ review }) {
  const rec = recommendationColor(review.recommendation)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <section style={{ ...panelStyle, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0', marginBottom: '6px' }}>
              Gemini CV review
            </p>
            <h2 style={{ fontSize: '19px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {review.role_focus || 'Role-focused CV recommendations'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>
              {review.summary}
            </p>
          </div>
          <div style={{
            minWidth: 118,
            border: `1px solid ${rec.border}`,
            background: rec.bg,
            color: rec.color,
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1' }}>{review.fit_score}</div>
            <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '4px' }}>{recommendationLabel(review.recommendation)}</div>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Suggestions are draft guidance. Review and approve any CV changes yourself before using them.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Section icon={CheckCircle2} title="Strong evidence">
          <PairList
            items={review.top_strengths}
            fields={[
              { key: 'evidence', label: 'Evidence', strong: true },
              { key: 'why_it_matters', label: 'Why it matters' },
            ]}
          />
        </Section>
        <Section icon={AlertCircle} title="Evidence gaps">
          <PairList
            items={review.evidence_gaps}
            fields={[
              { key: 'requirement', label: 'Requirement', strong: true },
              { key: 'cv_gap', label: 'Gap' },
              { key: 'how_to_fix', label: 'Fix' },
            ]}
          />
        </Section>
      </div>

      <Section icon={FileText} title="Suggested CV bullets">
        <PairList
          items={review.bullet_rewrites}
          fields={[
            { key: 'section', label: 'Section', strong: true },
            { key: 'current_issue', label: 'Issue' },
            { key: 'suggested_bullet', label: 'Suggested bullet', strong: true },
            { key: 'reason', label: 'Reason' },
          ]}
        />
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Section icon={Lightbulb} title="Keywords to add truthfully">
          <PairList
            items={review.keyword_suggestions}
            fields={[
              { key: 'keyword', label: 'Keyword', strong: true },
              { key: 'why', label: 'Why' },
              { key: 'where_to_add', label: 'Where' },
            ]}
          />
        </Section>
        <Section icon={ShieldCheck} title="Claims to handle carefully">
          <PairList
            items={review.risks}
            fields={[
              { key: 'claim', label: 'Claim', strong: true },
              { key: 'concern', label: 'Concern' },
              { key: 'safer_alternative', label: 'Safer alternative' },
            ]}
          />
        </Section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Section icon={ListChecks} title="Next best steps">
          <TextList items={review.next_steps} />
        </Section>
        <Section icon={Briefcase} title="Cover letter angles">
          <TextList items={review.cover_letter_angles} />
        </Section>
      </div>
    </div>
  )
}

export default function Documents() {
  const [applications, setApplications] = useState([])
  const [selectedApplicationId, setSelectedApplicationId] = useState('')
  const [aiStatus, setAiStatus] = useState(null)
  const [cvText, setCvText] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingContext, setLoadingContext] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadContext() {
      try {
        const [trackerData, statusData] = await Promise.all([
          fetchTracker('All'),
          fetchAiStatus(),
        ])
        if (cancelled) return
        setApplications(trackerData)
        setAiStatus(statusData)
        if (trackerData[0]?.id) setSelectedApplicationId(String(trackerData[0].id))
      } catch {
        if (!cancelled) setError('Could not load application context. Make sure the server is running.')
      } finally {
        if (!cancelled) setLoadingContext(false)
      }
    }

    loadContext()
    return () => { cancelled = true }
  }, [])

  const selectedApplication = useMemo(
    () => applications.find(app => String(app.id) === selectedApplicationId) || null,
    [applications, selectedApplicationId],
  )

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    setError('')
    setReview(null)
    if (!file) return

    if (file.size > MAX_FILE_BYTES) {
      setCvFile(null)
      setError('Upload a CV file under 5 MB.')
      return
    }

    try {
      const buffer = await file.arrayBuffer()
      const nextFile = {
        name: file.name,
        size: file.size,
        mime_type: guessMimeType(file),
        data: arrayBufferToBase64(buffer),
      }
      setCvFile(nextFile)

      if (isTextFile(file)) {
        const text = await file.text()
        setCvText(text)
      }
    } catch {
      setCvFile(null)
      setError('Could not read that CV file. Try another file or paste the CV text.')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setReview(null)

    if (!cvText.trim() && !cvFile) {
      setError('We need CV text before reviewing fit. Upload a CV or paste CV text first.')
      return
    }

    if (!jobDescription.trim()) {
      setError('We need a job description before generating suggestions.')
      return
    }

    setLoading(true)
    try {
      const result = await reviewCv({
        cv_text: cvText,
        cv_file: cvFile,
        job_title: selectedApplication?.title || '',
        company: selectedApplication?.company || '',
        application_notes: selectedApplication?.notes || '',
        job_description: jobDescription,
      })
      setReview(result)
    } catch (err) {
      setError(err?.response?.data?.error || 'Gemini could not review the CV yet.')
    } finally {
      setLoading(false)
    }
  }

  const connected = aiStatus?.gemini_configured

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={titleStyle}>Documents</h1>
          <p style={subtitleStyle}>Upload a CV and get role-specific improvement recommendations.</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 11px',
          borderRadius: '999px',
          border: `1px solid ${connected ? '#86efac' : '#fecaca'}`,
          background: connected ? '#f0fdf4' : '#fff1f2',
          color: connected ? '#15803d' : '#b91c1c',
          fontSize: '12px',
          fontWeight: '700',
        }}>
          {connected ? <CheckCircle2 size={14} strokeWidth={2.5} /> : <AlertCircle size={14} strokeWidth={2.5} />}
          {connected ? `Gemini ready (${aiStatus?.model || 'configured'})` : 'Gemini key missing'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '18px', alignItems: 'start' }}>
        <form onSubmit={handleSubmit} style={{ ...panelStyle, padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>Application context</label>
            <select
              value={selectedApplicationId}
              onChange={event => setSelectedApplicationId(event.target.value)}
              disabled={loadingContext || applications.length === 0}
              style={inputStyle}
            >
              {applications.length === 0 ? (
                <option value="">No saved applications yet</option>
              ) : applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.title} at {app.company}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>CV file</label>
            <label style={{
              border: '1.5px dashed var(--color-border-strong)',
              borderRadius: 'var(--radius-lg)',
              minHeight: '116px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              background: '#f8fafc',
              cursor: 'pointer',
            }}>
              <Upload size={20} strokeWidth={2.2} color="var(--color-applied-teal)" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Upload CV
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                PDF, DOC, DOCX, TXT, or MD under 5 MB
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
            {cvFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                <FileText size={14} strokeWidth={2.4} color="var(--color-applied-teal)" />
                <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{cvFile.name}</span>
                <span>{bytesToSize(cvFile.size)}</span>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>CV text</label>
            <textarea
              value={cvText}
              onChange={event => {
                setCvText(event.target.value)
                setReview(null)
              }}
              rows={10}
              placeholder="Paste your approved base CV text here, or upload a PDF or Word CV above."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Job description or target-role requirements</label>
            <textarea
              value={jobDescription}
              onChange={event => setJobDescription(event.target.value)}
              rows={7}
              placeholder="Paste the job description, key requirements, or the role profile you want the CV tailored toward."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {selectedApplication && (
            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              background: '#fbfdff',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
            }}>
              <strong style={{ display: 'block', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                {selectedApplication.title} at {selectedApplication.company}
              </strong>
              {[selectedApplication.location, selectedApplication.sector, selectedApplication.status].filter(Boolean).join(' - ')}
            </div>
          )}

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '11px 12px',
              borderRadius: 'var(--radius-md)',
              background: '#fff1f2',
              color: '#b91c1c',
              fontSize: '13px',
              lineHeight: '1.45',
            }}>
              <AlertCircle size={16} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 2 }} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading || !connected}
              style={{
                ...primaryButtonStyle,
                opacity: loading || !connected ? 0.6 : 1,
                cursor: loading || !connected ? 'default' : 'pointer',
              }}
            >
              {loading ? <RefreshCw size={15} strokeWidth={2.5} /> : <ListChecks size={15} strokeWidth={2.5} />}
              {loading ? 'Checking CV evidence...' : 'Review CV'}
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => {
                setReview(null)
                setError('')
                setCvText('')
                setCvFile(null)
                setJobDescription('')
              }}
            >
              Clear
            </button>
          </div>
          {loading && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
              Reading job requirements, checking CV evidence, and separating confirmed strengths from gaps.
            </p>
          )}
        </form>

        {review ? <ReviewResults review={review} /> : <EmptyReview />}
      </div>
    </div>
  )
}
