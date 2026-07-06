import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Mail,
  PenLine,
  RefreshCw,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import WorkflowGuide from '../components/WorkflowGuide'
import { extractCvProfile, fetchAiStatus, fetchPersonalInformation, fetchTracker, generateCoverLetter, reviewCv, savePersonalInformation, updateApplication } from '../lib/api'
import { downloadCoverLetterDoc } from '../lib/documentExport'

const MAX_FILE_BYTES = 5 * 1024 * 1024

const pageStyle = { padding: '36px 40px', maxWidth: '1180px' }
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
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
  gap: '9px',
  padding: '10px 16px',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '800',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-primary)',
  transition: 'background 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease',
}
const secondaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  padding: '10px 14px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: '#ffffff',
  color: 'var(--color-text-secondary)',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-sm)',
}

function applicationLabel(application) {
  if (!application) return 'selected application'
  return [application.title, application.company].filter(Boolean).join(' at ') || 'selected application'
}

function readinessForSavedMaterial(application, materialType) {
  const hasReview = materialType === 'review' || Boolean(application?.cv_review)
  const hasLetter = materialType === 'cover_letter' || Boolean(application?.cover_letter)
  if (hasReview && hasLetter) return 'Complete'
  if (hasLetter) return 'Cover letter ready'
  if (hasReview) return 'CV reviewed'
  return 'Missing'
}

function SaveHint({ canSave, auth, selectedApplication }) {
  if (canSave) return null
  return (
    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.45', maxWidth: 220 }}>
      {!auth.session
        ? 'Log in or sign up to save this to an application.'
        : selectedApplication
          ? 'Generate a result before saving it.'
          : 'Select an application before saving.'}
    </p>
  )
}

function TailoringWorkspace({
  selectedApplication,
  hasCvEvidence,
  review,
  coverLetter,
  reviewDisabled,
  coverLetterDisabled,
  loading,
  generatingLetter,
  onReviewCv,
  onGenerateCoverLetter,
}) {
  const savedReview = Boolean(selectedApplication?.cv_review)
  const savedCoverLetter = Boolean(selectedApplication?.cover_letter)
  const hasReview = Boolean(review || savedReview)
  const hasLetter = Boolean(coverLetter || savedCoverLetter)
  const notes = String(selectedApplication?.notes || '').toLowerCase()
  const hasInterviewPrep = selectedApplication?.status === 'Interview' && Boolean(notes.trim())
  const hasFollowUpPlan = /follow|reply|recruiter|thank|availability/i.test(notes)
  const hasChecklist = Boolean(
    selectedApplication &&
    hasReview &&
    hasLetter &&
    (selectedApplication.deadline_date || selectedApplication.deadline_type === 'rolling'),
  )
  const baseDisabled = !selectedApplication || !hasCvEvidence
  const steps = [
    {
      id: 'cv-fit',
      title: 'CV fit analysis',
      copy: hasReview ? 'Role-specific CV recommendations are ready.' : 'Check strengths, gaps, keywords, and truthful bullet improvements.',
      done: hasReview,
      icon: ListChecks,
      action: (
        <button
          type="button"
          onClick={onReviewCv}
          disabled={reviewDisabled}
          style={{ ...secondaryButtonStyle, minHeight: 34, padding: '7px 10px', fontSize: '12px', opacity: reviewDisabled ? 0.6 : 1, cursor: reviewDisabled ? 'default' : 'pointer' }}
        >
          {loading ? <RefreshCw size={13} strokeWidth={2.5} /> : <ListChecks size={13} strokeWidth={2.5} />}
          {loading ? 'Reviewing...' : 'Review CV'}
        </button>
      ),
    },
    {
      id: 'cover-letter',
      title: 'Cover letter draft',
      copy: hasLetter ? 'A tailored draft is ready to edit, save, or export.' : 'Create a job-specific cover letter from profile evidence and role context.',
      done: hasLetter,
      icon: PenLine,
      action: (
        <button
          type="button"
          onClick={onGenerateCoverLetter}
          disabled={coverLetterDisabled}
          style={{ ...secondaryButtonStyle, minHeight: 34, padding: '7px 10px', fontSize: '12px', opacity: coverLetterDisabled ? 0.6 : 1, cursor: coverLetterDisabled ? 'default' : 'pointer' }}
        >
          {generatingLetter ? <RefreshCw size={13} strokeWidth={2.5} /> : <PenLine size={13} strokeWidth={2.5} />}
          {generatingLetter ? 'Drafting...' : 'Draft letter'}
        </button>
      ),
    },
    {
      id: 'interview-prep',
      title: 'Interview prep notes',
      copy: hasInterviewPrep ? 'Interview preparation notes are captured on the application.' : 'Prepare role-specific STAR prompts once the application reaches Interview.',
      done: hasInterviewPrep,
      icon: GraduationCap,
      action: selectedApplication ? (
        <Link to={`/tracker/${selectedApplication.id}`} style={{ ...secondaryButtonStyle, minHeight: 34, padding: '7px 10px', fontSize: '12px' }}>
          Open detail
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      ) : null,
    },
    {
      id: 'follow-up',
      title: 'Follow-up email',
      copy: hasFollowUpPlan ? 'A follow-up or recruiter reply note exists.' : 'Plan follow-ups, thank-you emails, and recruiter replies after applying.',
      done: hasFollowUpPlan,
      icon: Mail,
      action: selectedApplication ? (
        <Link to="/coach" style={{ ...secondaryButtonStyle, minHeight: 34, padding: '7px 10px', fontSize: '12px' }}>
          Open Coach
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      ) : null,
    },
    {
      id: 'checklist',
      title: 'Application checklist',
      copy: hasChecklist ? 'Core preparation items are attached to the application.' : 'Confirm documents, deadline, status, reminders, and notes before submission.',
      done: hasChecklist,
      icon: CalendarDays,
      action: selectedApplication ? (
        <Link to={`/tracker/${selectedApplication.id}`} style={{ ...secondaryButtonStyle, minHeight: 34, padding: '7px 10px', fontSize: '12px' }}>
          Review checklist
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      ) : null,
    },
  ]
  const activeIndex = steps.findIndex(step => !step.done)

  return (
    <section style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px', background: '#fbfdff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0', marginBottom: '4px' }}>
            Tailoring workspace
          </p>
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
            Structured application materials
          </h2>
        </div>
        {baseDisabled && (
          <span style={{ minHeight: 26, display: 'inline-flex', alignItems: 'center', padding: '0 8px', border: '1px solid #fed7aa', borderRadius: '999px', background: '#fff7ed', color: 'var(--color-warning)', fontSize: '11px', fontWeight: '800' }}>
            Needs CV and job
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gap: '10px' }}>
        {steps.map((step, index) => {
          const Icon = step.icon
          const active = index === activeIndex
          return (
            <div
              key={step.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '34px 1fr auto',
                gap: '10px',
                alignItems: 'center',
                border: `1px solid ${active ? 'var(--color-applied-teal)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '11px',
                background: active ? '#ffffff' : step.done ? '#f8fafc' : '#ffffff',
              }}
            >
              <span style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: active ? 'var(--color-applied-teal)' : '#edf7f7', color: active ? '#ffffff' : 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} strokeWidth={2.4} />
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', marginBottom: '3px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>{step.title}</h3>
                  {step.done ? (
                    <span style={{ color: 'var(--color-success)', fontSize: '11px', fontWeight: '800' }}>Done</span>
                  ) : active ? (
                    <span style={{ color: 'var(--color-applied-teal)', fontSize: '11px', fontWeight: '800' }}>Current</span>
                  ) : null}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>{step.copy}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {step.action}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
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
          CV insights will appear here
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '360px' }}>
          Upload a CV once to extract Personal Information. After that, saved profile data can power CV reviews and cover letters.
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

function ReviewPriority({ review }) {
  const highImpact = [
    ...(review.evidence_gaps || []).slice(0, 2).map(item => item.how_to_fix || item.cv_gap || item.requirement),
    ...(review.bullet_rewrites || []).slice(0, 2).map(item => item.suggested_bullet),
  ].filter(Boolean)
  const niceToHave = (review.keyword_suggestions || [])
    .slice(0, 4)
    .map(item => [item.keyword, item.where_to_add].filter(Boolean).join(' - '))
    .filter(Boolean)
  const needsEvidence = [
    ...(review.evidence_gaps || []).slice(0, 3).map(item => item.cv_gap),
    ...(review.risks || []).slice(0, 2).map(item => item.safer_alternative || item.concern),
  ].filter(Boolean)

  return (
    <section style={{ ...panelStyle, padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
        <span style={{ width: 30, height: 30, borderRadius: 'var(--radius-md)', background: '#edf7f7', color: 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ListChecks size={16} strokeWidth={2.4} />
        </span>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>Recommendation priorities</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '10px' }}>
        {[
          ['High impact fixes', highImpact, '#fff7ed', 'var(--color-warning)'],
          ['Nice to have', niceToHave, '#edf7f7', 'var(--color-applied-teal)'],
          ['Needs evidence', needsEvidence, '#fff1f2', 'var(--color-danger)'],
        ].map(([title, items, bg, color]) => (
          <div key={title} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', background: bg }}>
            <p style={{ fontSize: '12px', fontWeight: '800', color, marginBottom: '8px' }}>{title}</p>
            {items.length ? (
              <ul style={{ display: 'grid', gap: '7px' }}>
                {items.slice(0, 4).map((item, index) => (
                  <li key={`${title}-${index}`} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>{item}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.45' }}>No items returned.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function PillList({ items }) {
  if (!items?.length) {
    return <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No items returned.</p>
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          style={{
            border: '1px solid #b9dada',
            background: '#edf7f7',
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

function FieldRows({ rows }) {
  const visibleRows = rows.filter(row => row.value)

  if (!visibleRows.length) {
    return <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No items returned.</p>
  }

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

function dateRange(item) {
  return [item?.start_date, item?.end_date].filter(Boolean).join(' - ')
}

function hasProfileEvidence(profile) {
  if (!profile || typeof profile !== 'object') return false
  const skills = profile.skills && typeof profile.skills === 'object' ? profile.skills : {}
  return Boolean(
    profile.candidate_name ||
    profile.headline ||
    profile.summary ||
    profile.contact?.location ||
    profile.education?.length ||
    profile.experience?.length ||
    profile.projects?.length ||
    profile.evidence_points?.length ||
    Object.values(skills).some(items => Array.isArray(items) && items.length),
  )
}

function CvProfileResults({ profile }) {
  const contactRows = [
    { label: 'Email', value: profile.contact?.email },
    { label: 'Phone', value: profile.contact?.phone },
    { label: 'Location', value: profile.contact?.location },
    { label: 'LinkedIn', value: profile.contact?.linkedin },
    { label: 'Portfolio', value: profile.contact?.portfolio },
  ]
  const skillGroups = [
    { label: 'Technical', items: profile.skills?.technical },
    { label: 'Business', items: profile.skills?.business },
    { label: 'Tools', items: profile.skills?.tools },
    { label: 'Languages', items: profile.skills?.languages },
    { label: 'Other', items: profile.skills?.other },
  ].filter(group => group.items?.length)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <section style={{ ...panelStyle, padding: '24px' }}>
        <div style={{ display: 'flex', gap: '13px', alignItems: 'flex-start' }}>
          <span style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: '#edf7f7',
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
              Gemini CV extraction
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
              {profile.summary || 'Review the extracted fields below before saving or using them elsewhere.'}
            </p>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '16px' }}>
          ApplyWise only extracts visible CV information. Check the fields before using them in applications.
        </p>
      </section>

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
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No skills returned.</p>
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
                {item.skills_used?.length ? (
                  <div style={{ marginTop: '11px' }}>
                    <PillList items={item.skills_used} />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No experience returned.</p>
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
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No education returned.</p>
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
                  {item.skills_used?.length ? (
                    <div style={{ marginTop: '11px' }}>
                      <PillList items={item.skills_used} />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No projects returned.</p>
          )}
        </Section>
      </div>

      <Section icon={ShieldCheck} title="Certifications">
        {profile.certifications?.length ? (
          <PairList
            items={profile.certifications}
            fields={[
              { key: 'name', label: 'Name', strong: true },
              { key: 'issuer', label: 'Issuer' },
              { key: 'date', label: 'Date' },
            ]}
          />
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No certifications returned.</p>
        )}
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
        <Section icon={AlertCircle} title="Missing or unclear fields">
          <TextList items={profile.missing_fields} />
        </Section>
      </div>

      <Section icon={ShieldCheck} title="Extraction notes">
        <TextList items={profile.extraction_notes} />
      </Section>
    </div>
  )
}

function ReviewResults({ review, onSave, saving, canSave, auth, selectedApplication }) {
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', flexShrink: 0 }}>
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
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave || saving}
              style={{
                ...secondaryButtonStyle,
                opacity: !canSave || saving ? 0.6 : 1,
                cursor: !canSave || saving ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {saving ? <RefreshCw size={14} strokeWidth={2.5} /> : <Save size={14} strokeWidth={2.5} />}
              {saving ? 'Saving...' : 'Save to application'}
            </button>
            <SaveHint canSave={canSave} auth={auth} selectedApplication={selectedApplication} />
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Suggestions are draft guidance. Review and approve any CV changes yourself before using them.
        </p>
      </section>

      <ReviewPriority review={review} />

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

function CoverLetterResults({ letter, onSave, saving, canSave, auth, selectedApplication, onCreateDoc, onTextChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <section style={{ ...panelStyle, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0', marginBottom: '6px' }}>
              Gemini cover letter draft
            </p>
            <h2 style={{ fontSize: '19px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {letter.title || 'Tailored cover letter'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>
              {letter.opening_strategy || 'Drafted from the CV and application context provided.'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '9px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(letter.cover_letter || '')}
                style={{ ...secondaryButtonStyle, flexShrink: 0 }}
              >
                Copy draft
              </button>
              <button
                type="button"
                onClick={onCreateDoc}
                disabled={!letter.cover_letter}
                style={{
                  ...secondaryButtonStyle,
                  opacity: letter.cover_letter ? 1 : 0.6,
                  cursor: letter.cover_letter ? 'pointer' : 'default',
                  flexShrink: 0,
                }}
              >
                <Download size={14} strokeWidth={2.5} />
                Create Word doc
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={!canSave || saving}
                style={{
                  ...primaryButtonStyle,
                  opacity: !canSave || saving ? 0.6 : 1,
                  cursor: !canSave || saving ? 'default' : 'pointer',
                  flexShrink: 0,
                }}
              >
                {saving ? <RefreshCw size={14} strokeWidth={2.5} /> : <Save size={14} strokeWidth={2.5} />}
                {saving ? 'Saving...' : 'Save to application'}
              </button>
            </div>
            <SaveHint canSave={canSave} auth={auth} selectedApplication={selectedApplication} />
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          This is a draft. Check names, role details, and claims before sending.
        </p>
      </section>

      <Section icon={FileText} title="Cover letter draft">
        <textarea
          value={letter.cover_letter || ''}
          onChange={event => onTextChange(event.target.value)}
          rows={16}
          placeholder="No cover letter draft returned."
          style={{
            width: '100%',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            background: '#fbfdff',
            color: 'var(--color-text-primary)',
            fontSize: '14px',
            lineHeight: '1.7',
            resize: 'vertical',
            outline: 'none',
          }}
        />
        <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.45' }}>
          Edit the draft here before saving it to the application or creating the Word document.
        </p>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Section icon={CheckCircle2} title="Evidence used">
          <PairList
            items={letter.evidence_used}
            fields={[
              { key: 'claim', label: 'Claim', strong: true },
              { key: 'cv_evidence', label: 'CV evidence' },
              { key: 'why_it_matters', label: 'Why it matters' },
            ]}
          />
        </Section>
        <Section icon={Lightbulb} title="Personalization notes">
          <TextList items={letter.personalization_notes} />
        </Section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Section icon={AlertCircle} title="Missing inputs">
          <TextList items={letter.missing_inputs} />
        </Section>
        <Section icon={ListChecks} title="Editing checklist">
          <TextList items={letter.editing_checklist} />
        </Section>
      </div>
    </div>
  )
}

export default function Documents() {
  const auth = useAuth()
  const [applications, setApplications] = useState([])
  const [selectedApplicationId, setSelectedApplicationId] = useState('')
  const [aiStatus, setAiStatus] = useState(null)
  const [personalInfo, setPersonalInfo] = useState(null)
  const [cvText, setCvText] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [profile, setProfile] = useState(null)
  const [review, setReview] = useState(null)
  const [coverLetter, setCoverLetter] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatingLetter, setGeneratingLetter] = useState(false)
  const [loadingContext, setLoadingContext] = useState(true)
  const [error, setError] = useState('')
  const [saveNotice, setSaveNotice] = useState('')
  const [savingMaterial, setSavingMaterial] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadContext() {
      try {
        const [trackerData, statusData, personalInfoData] = await Promise.all([
          fetchTracker('All'),
          fetchAiStatus(),
          fetchPersonalInformation().catch(() => ({ profile: null })),
        ])
        if (cancelled) return
        setApplications(trackerData)
        setAiStatus(statusData)
        setPersonalInfo(personalInfoData?.profile || null)
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
  const reusableProfile = personalInfo || profile
  const hasReusableProfile = hasProfileEvidence(reusableProfile)
  const hasDirectCvSource = Boolean(cvText.trim() || cvFile)
  const hasCvEvidence = hasDirectCvSource || hasReusableProfile
  const personalInfoPayload = hasReusableProfile ? JSON.stringify(reusableProfile) : ''

  function showSavedReview(application = selectedApplication) {
    if (!application?.cv_review) return
    setProfile(null)
    setCoverLetter(null)
    setReview(application.cv_review)
    setError('')
    setSaveNotice(`Showing saved CV recommendations for ${applicationLabel(application)}.`)
  }

  function showSavedCoverLetter(application = selectedApplication) {
    if (!application?.cover_letter) return
    setProfile(null)
    setReview(null)
    setCoverLetter(application.cover_letter)
    setError('')
    setSaveNotice(`Showing saved cover letter for ${applicationLabel(application)}.`)
  }

  function handleApplicationChange(applicationId) {
    setSelectedApplicationId(applicationId)
    const application = applications.find(app => String(app.id) === applicationId)
    setProfile(null)
    setError('')
    setSaveNotice('')

    if (application?.cv_review) {
      setReview(application.cv_review)
      setCoverLetter(null)
    } else if (application?.cover_letter) {
      setReview(null)
      setCoverLetter(application.cover_letter)
    } else {
      setReview(null)
      setCoverLetter(null)
    }
  }

  async function saveMaterialToApplication(materialType) {
    setError('')
    setSaveNotice('')

    if (!auth.session) {
      setSaveNotice('Log in or sign up to save this to an application.')
      return
    }
    if (!selectedApplication) {
      setError('Select an application before saving this material.')
      return
    }

    const isReview = materialType === 'review'
    const material = isReview ? review : coverLetter
    if (!material) {
      setError(isReview ? 'Generate CV recommendations before saving.' : 'Generate a cover letter before saving.')
      return
    }

    setSavingMaterial(materialType)
    try {
      const savedAt = new Date().toISOString()
      const payload = {
        document_readiness: readinessForSavedMaterial(selectedApplication, materialType),
        [isReview ? 'cv_review' : 'cover_letter']: {
          ...material,
          saved_at: savedAt,
          saved_from: isReview ? 'gemini_cv_review' : 'gemini_cover_letter',
        },
      }
      const updated = await updateApplication(selectedApplication.id, payload)
      setApplications(prev => prev.map(app => (
        String(app.id) === String(updated.id) ? updated : app
      )))
      setSaveNotice(`${isReview ? 'CV recommendations' : 'Cover letter'} saved to ${applicationLabel(updated)}.`)
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not save this material to the application yet.')
    } finally {
      setSavingMaterial('')
    }
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    setError('')
    setSaveNotice('')
    setReview(null)
    setProfile(null)
    setCoverLetter(null)
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

  async function runCvReview() {
    setError('')
    setSaveNotice('')
    setReview(null)
    setProfile(null)
    setCoverLetter(null)

    if (!hasCvEvidence) {
      setError('Upload or paste a CV, or extract and save Personal Information before reviewing fit.')
      return
    }

    if (!jobDescription.trim() && !selectedApplication) {
      setError('Add a job description or select an application before generating suggestions.')
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
        personal_information: personalInfoPayload,
      })
      setReview(result)
    } catch (err) {
      setError(err?.response?.data?.error || 'Gemini could not review the CV yet.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await runCvReview()
  }

  async function handleExtractProfile() {
    setError('')
    setSaveNotice('')
    setReview(null)
    setProfile(null)
    setCoverLetter(null)

    if (!cvText.trim() && !cvFile) {
      setError('Upload a CV or paste CV text first.')
      return
    }

    setExtracting(true)
    try {
      const result = await extractCvProfile({
        cv_text: cvText,
        cv_file: cvFile,
      })
      setProfile(result)
      if (!auth.session) {
        setSaveNotice('Log in or sign up to save this under Personal Information.')
      } else {
        try {
          const saved = await savePersonalInformation(result, 'cv_extraction')
          setProfile(saved.profile || result)
          setPersonalInfo(saved.profile || result)
          setSaveNotice('Saved under Personal Information.')
        } catch {
          setSaveNotice('CV information was extracted, but it could not be saved yet.')
        }
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Gemini could not extract CV information yet.')
    } finally {
      setExtracting(false)
    }
  }

  async function handleGenerateCoverLetter() {
    setError('')
    setSaveNotice('')
    setReview(null)
    setProfile(null)
    setCoverLetter(null)

    if (!hasCvEvidence) {
      setError('Upload or paste a CV, or extract and save Personal Information before generating a cover letter.')
      return
    }

    if (!jobDescription.trim() && !selectedApplication) {
      setError('Add a job description or select an application before generating a cover letter.')
      return
    }

    setGeneratingLetter(true)
    try {
      const result = await generateCoverLetter({
        cv_text: cvText,
        cv_file: cvFile,
        job_title: selectedApplication?.title || '',
        company: selectedApplication?.company || '',
        application_notes: selectedApplication?.notes || '',
        job_description: jobDescription,
        personal_information: personalInfoPayload,
      })
      setCoverLetter(result)
    } catch (err) {
      setError(err?.response?.data?.error || 'Gemini could not generate the cover letter yet.')
    } finally {
      setGeneratingLetter(false)
    }
  }

  function handleCreateCoverLetterDoc() {
    if (!coverLetter?.cover_letter) return
    downloadCoverLetterDoc(coverLetter, selectedApplication || {})
  }

  const connected = aiStatus?.gemini_configured
  const profileSaved = saveNotice === 'Saved under Personal Information.'
  const extractDisabled = extracting || loading || generatingLetter || !connected || !hasDirectCvSource
  const reviewDisabled = loading || extracting || generatingLetter || !connected || !hasCvEvidence
  const coverLetterDisabled = generatingLetter || loading || extracting || !connected || !hasCvEvidence
  const canSaveReview = Boolean(auth.session && selectedApplication && review)
  const canSaveCoverLetter = Boolean(auth.session && selectedApplication && coverLetter)
  const documentWorkflowStepBase = [
    { id: 'upload', title: 'Add CV source', copy: 'Upload once, paste text, or reuse saved Personal Information.', to: '/documents', done: hasCvEvidence, icon: Upload },
    { id: 'extract', title: 'Extract profile', copy: 'Save confirmed facts under Personal Information for reuse.', to: '/personal-information', done: hasReusableProfile || profileSaved, icon: UserRound },
    { id: 'review', title: 'Review CV for role', copy: 'Use a selected application or pasted job description.', to: '/documents', done: Boolean(review || selectedApplication?.cv_review), icon: ListChecks },
    { id: 'letter', title: 'Generate cover letter', copy: 'Create an editable, job-specific draft and Word document.', to: '/documents', done: Boolean(coverLetter || selectedApplication?.cover_letter), icon: PenLine },
    { id: 'save', title: 'Save to application', copy: 'Store the approved review or letter on the tracked job.', to: selectedApplication ? `/tracker/${selectedApplication.id}` : '/tracker', done: Boolean(selectedApplication?.cv_review || selectedApplication?.cover_letter), icon: Save },
  ]
  const documentWorkflowActive = documentWorkflowStepBase.find(step => !step.done)?.id
  const documentWorkflowSteps = documentWorkflowStepBase.map(step => ({
    ...step,
    active: step.id === documentWorkflowActive,
  }))

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={titleStyle}>Documents</h1>
          <p style={subtitleStyle}>Upload a CV once to extract Personal Information, then reuse it for CV reviews and cover letters.</p>
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

      <div style={{ marginBottom: '18px' }}>
        <WorkflowGuide
          title="Document workflow"
          copy="Use this order for stronger, reusable AI output. Save only reviewed information and approved drafts."
          steps={documentWorkflowSteps}
        />
      </div>

      {!loadingContext && !connected && (
        <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #fed7aa', borderRadius: 'var(--radius-md)', background: '#fff7ed', color: '#9a3412', fontSize: '13px', lineHeight: '1.5' }}>
          Gemini is not configured on the server, so CV extraction, CV review, cover letters, and AI job recommendations are disabled. Add `GEMINI_API_KEY` to `server/.env`, restart the app, or open <Link to="/settings" style={{ color: 'inherit', fontWeight: '800' }}>Settings</Link> for the setup checklist.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '18px', alignItems: 'start' }}>
        <form onSubmit={handleSubmit} style={{ ...panelStyle, padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>Application context</label>
            <select
              value={selectedApplicationId}
              onChange={event => handleApplicationChange(event.target.value)}
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

          {hasReusableProfile && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px',
              border: '1px solid #b9dada',
              borderRadius: 'var(--radius-md)',
              background: '#edf7f7',
              color: 'var(--color-applied-teal)',
              fontSize: '13px',
              lineHeight: '1.45',
            }}>
              <ShieldCheck size={17} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong style={{ display: 'block', color: 'var(--color-text-primary)', marginBottom: '3px' }}>
                  Saved Personal Information is ready
                </strong>
                You can review a CV or generate a cover letter without uploading the CV again. Upload only if you want to replace the current source.
              </div>
            </div>
          )}

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
                setProfile(null)
                setCoverLetter(null)
                setSaveNotice('')
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
              onChange={event => {
                setJobDescription(event.target.value)
                setReview(null)
                setCoverLetter(null)
              }}
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
              {(selectedApplication.cv_review || selectedApplication.cover_letter) && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {selectedApplication.cv_review && (
                    <button
                      type="button"
                      onClick={() => showSavedReview(selectedApplication)}
                      style={{ ...secondaryButtonStyle, minHeight: 34, padding: '7px 10px', fontSize: '12px' }}
                    >
                      Show saved CV review
                    </button>
                  )}
                  {selectedApplication.cover_letter && (
                    <button
                      type="button"
                      onClick={() => showSavedCoverLetter(selectedApplication)}
                      style={{ ...secondaryButtonStyle, minHeight: 34, padding: '7px 10px', fontSize: '12px' }}
                    >
                      Show saved cover letter
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <TailoringWorkspace
            selectedApplication={selectedApplication}
            hasCvEvidence={hasCvEvidence}
            review={review}
            coverLetter={coverLetter}
            reviewDisabled={reviewDisabled}
            coverLetterDisabled={coverLetterDisabled}
            loading={loading}
            generatingLetter={generatingLetter}
            onReviewCv={runCvReview}
            onGenerateCoverLetter={handleGenerateCoverLetter}
          />

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

          {saveNotice && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '11px 12px',
              borderRadius: 'var(--radius-md)',
              background: profileSaved ? '#f0fdf4' : '#fff7ed',
              color: profileSaved ? '#15803d' : '#9a3412',
              fontSize: '13px',
              lineHeight: '1.45',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {profileSaved
                  ? <CheckCircle2 size={16} strokeWidth={2.4} style={{ flexShrink: 0 }} />
                  : <AlertCircle size={16} strokeWidth={2.4} style={{ flexShrink: 0 }} />}
                {saveNotice}
              </span>
              {profileSaved && (
                <Link to="/personal-information" style={{ fontWeight: '800', color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  View
                </Link>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleExtractProfile}
              disabled={extractDisabled}
              style={{
                ...primaryButtonStyle,
                opacity: extractDisabled ? 0.6 : 1,
                cursor: extractDisabled ? 'default' : 'pointer',
              }}
            >
              {extracting ? <RefreshCw size={15} strokeWidth={2.5} /> : <UserRound size={15} strokeWidth={2.5} />}
              {extracting ? 'Extracting CV info...' : 'Extract CV profile'}
            </button>
            <button
              type="submit"
              disabled={reviewDisabled}
              style={{
                ...secondaryButtonStyle,
                opacity: reviewDisabled ? 0.6 : 1,
                cursor: reviewDisabled ? 'default' : 'pointer',
              }}
            >
              {loading ? <RefreshCw size={15} strokeWidth={2.5} /> : <ListChecks size={15} strokeWidth={2.5} />}
              {loading ? 'Checking CV evidence...' : 'Review CV'}
            </button>
            <button
              type="button"
              onClick={handleGenerateCoverLetter}
              disabled={coverLetterDisabled}
              style={{
                ...secondaryButtonStyle,
                opacity: coverLetterDisabled ? 0.6 : 1,
                cursor: coverLetterDisabled ? 'default' : 'pointer',
              }}
            >
              {generatingLetter ? <RefreshCw size={15} strokeWidth={2.5} /> : <PenLine size={15} strokeWidth={2.5} />}
              {generatingLetter ? 'Drafting letter...' : 'Generate cover letter'}
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => {
                setProfile(null)
                setReview(null)
                setCoverLetter(null)
                setError('')
                setSaveNotice('')
                setCvText('')
                setCvFile(null)
                setJobDescription('')
              }}
            >
              Clear
            </button>
          </div>
          {(loading || extracting || generatingLetter) && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
              {extracting
                ? 'Reading the CV and separating confirmed profile details from missing fields.'
                : generatingLetter
                  ? 'Drafting a role-specific cover letter from confirmed CV evidence and job context.'
                  : 'Reading job requirements, checking CV evidence, and separating confirmed strengths from gaps.'}
            </p>
          )}
        </form>

        {profile
          ? <CvProfileResults profile={profile} />
          : review
            ? (
              <ReviewResults
                review={review}
                onSave={() => saveMaterialToApplication('review')}
                saving={savingMaterial === 'review'}
                canSave={canSaveReview}
                auth={auth}
                selectedApplication={selectedApplication}
              />
            )
            : coverLetter
              ? (
                <CoverLetterResults
                  letter={coverLetter}
                  onSave={() => saveMaterialToApplication('cover_letter')}
                  saving={savingMaterial === 'cover_letter'}
                  canSave={canSaveCoverLetter}
                  auth={auth}
                  selectedApplication={selectedApplication}
                  onCreateDoc={handleCreateCoverLetterDoc}
                  onTextChange={value => setCoverLetter(prev => ({ ...(prev || {}), cover_letter: value }))}
                />
              )
              : <EmptyReview />}
      </div>
    </div>
  )
}
