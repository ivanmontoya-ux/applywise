import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileText,
  ListChecks,
  MessageSquareText,
  Send,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { fetchGmailSuggestions, fetchPersonalInformation, fetchTracker } from '../lib/api'
import {
  APPLICATION_STATUSES,
  formatApplicationDate,
  getDocumentReadiness,
  getStatusStyle,
  isTerminalStatus,
} from '../lib/application'

const pageStyle = { padding: '36px 40px', maxWidth: '1180px' }
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '720px' }
const panelStyle = {
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}
const primaryLinkStyle = {
  minHeight: 40,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '800',
  textDecoration: 'none',
}
const secondaryButtonStyle = {
  minHeight: 38,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '0 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
}
const labelStyle = { fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0' }

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function daysBetween(from, to = new Date()) {
  const start = parseDate(from)
  if (!start) return null
  return Math.floor((to.getTime() - start.getTime()) / 86400000)
}

function daysUntil(value) {
  const date = parseDate(value)
  if (!date) return null
  return Math.ceil((date.getTime() - new Date().getTime()) / 86400000)
}

function confidenceLabel(value) {
  if (value >= 0.82) return 'High confidence'
  if (value >= 0.62) return 'Medium confidence'
  return 'Needs confirmation'
}

function StatusBadge({ status }) {
  const style = getStatusStyle(status)
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: 24,
      padding: '0 8px',
      borderRadius: '6px',
      border: `1px solid ${style.border}`,
      background: style.bg,
      color: style.color,
      fontSize: '12px',
      fontWeight: '800',
    }}>
      {status}
    </span>
  )
}

function ConfidenceBadge({ value }) {
  const color = value >= 0.82 ? 'var(--color-success)' : value >= 0.62 ? 'var(--color-applied-teal)' : 'var(--color-warning)'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: 24,
      padding: '0 8px',
      borderRadius: '999px',
      border: '1px solid var(--color-border)',
      background: '#ffffff',
      color,
      fontSize: '12px',
      fontWeight: '800',
    }}>
      {confidenceLabel(value)}
    </span>
  )
}

function Panel({ title, eyebrow, icon: Icon, children, action }) {
  return (
    <section style={{ ...panelStyle, padding: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          {Icon && (
            <span style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#edf7f7', color: 'var(--color-applied-teal)', flexShrink: 0 }}>
              <Icon size={17} strokeWidth={2.4} />
            </span>
          )}
          <div>
            {eyebrow && <p style={{ ...labelStyle, marginBottom: '5px' }}>{eyebrow}</p>}
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>{title}</h2>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function readinessFor(application, profileExists) {
  const documentReadiness = getDocumentReadiness(application)
  const hasCvReview = Boolean(application.cv_review)
  const hasCoverLetter = Boolean(application.cover_letter)
  const deadlineDays = daysUntil(application.deadline_date)
  const appliedDays = daysBetween(application.date_applied || application.date_saved)
  const isInterview = application.status === 'Interview'

  const factors = [
    {
      label: 'CV fit',
      score: hasCvReview ? 24 : profileExists ? 14 : 5,
      max: 25,
      copy: hasCvReview ? 'CV recommendations are saved for this application.' : profileExists ? 'Personal profile exists, but no saved CV review for this role.' : 'No saved profile or CV review found.',
    },
    {
      label: 'Cover letter',
      score: hasCoverLetter ? 20 : 7,
      max: 20,
      copy: hasCoverLetter ? 'A cover letter is saved for this application.' : 'No application-specific cover letter is saved yet.',
    },
    {
      label: 'Deadline risk',
      score: deadlineDays === null ? 7 : deadlineDays < 0 ? 2 : deadlineDays <= 3 ? 8 : 15,
      max: 15,
      copy: deadlineDays === null ? 'No deadline is saved.' : deadlineDays < 0 ? 'The saved deadline has passed.' : deadlineDays <= 3 ? 'The deadline is close.' : `Deadline is ${deadlineDays} days away.`,
    },
    {
      label: 'Interview prep',
      score: isInterview ? (application.notes ? 14 : 8) : application.status === 'Applied' ? 8 : 5,
      max: 20,
      copy: isInterview ? (application.notes ? 'Interview stage has notes to build from.' : 'Interview stage needs preparation notes.') : 'No interview preparation needed yet.',
    },
    {
      label: 'Follow-up status',
      score: application.status === 'Applied' && appliedDays !== null && appliedDays >= 10 ? 6 : 16,
      max: 20,
      copy: application.status === 'Applied' && appliedDays !== null && appliedDays >= 10
        ? `No recorded update for ${appliedDays} days.`
        : 'No urgent follow-up signal.',
    },
  ]

  const score = Math.min(100, Math.round(factors.reduce((sum, factor) => sum + factor.score, 0)))
  const confidence = hasCvReview || hasCoverLetter || application.deadline_date || application.notes ? 0.86 : 0.62
  return { score, factors, confidence, documentReadiness }
}

function buildNextActions(applications, profileExists, emailSuggestions) {
  const active = applications.filter(app => !isTerminalStatus(app.status))
  const candidates = []

  for (const app of active) {
    const readiness = readinessFor(app, profileExists)
    const deadlineDays = daysUntil(app.deadline_date)
    const appliedDays = daysBetween(app.date_applied || app.date_saved)

    if (app.status === 'Interview') {
      candidates.push({
        priority: 96,
        title: `Prepare for ${app.title} at ${app.company}`,
        action: 'Open the interview checklist and write two STAR examples for this role today.',
        reason: 'Recommended because this application is already in Interview status.',
        confidence: app.notes ? 0.88 : 0.76,
        application: app,
        path: '/coach',
      })
    }
    if (deadlineDays !== null && deadlineDays <= 3 && deadlineDays >= 0) {
      candidates.push({
        priority: 92,
        title: `Finish deadline work for ${app.title}`,
        action: readiness.score < 75 ? 'Review the CV and cover letter before the deadline.' : 'Submit or confirm this application before the deadline.',
        reason: `Recommended because the saved deadline is ${deadlineDays === 0 ? 'today' : `${deadlineDays} day${deadlineDays === 1 ? '' : 's'} away`}.`,
        confidence: 0.9,
        application: app,
        path: '/documents',
      })
    }
    if (app.status === 'Applied' && appliedDays !== null && appliedDays >= 10) {
      candidates.push({
        priority: 84,
        title: `Follow up with ${app.company}`,
        action: 'Send a concise follow-up email or update the application if you already heard back.',
        reason: `Recommended because this application has had no recorded update for ${appliedDays} days.`,
        confidence: 0.84,
        application: app,
        path: '/coach',
      })
    }
    if (!app.deadline_date && ['Saved', 'Applied', 'Assessment'].includes(app.status)) {
      candidates.push({
        priority: 72,
        title: `Add a deadline for ${app.title}`,
        action: 'Add the application deadline or next expected date so reminders can work.',
        reason: 'Recommended because this application has no saved deadline.',
        confidence: 0.7,
        application: app,
        path: '/tracker',
      })
    }
    if (readiness.score < 65 && ['Saved', 'Applied'].includes(app.status)) {
      candidates.push({
        priority: 68,
        title: `Improve application materials for ${app.title}`,
        action: 'Generate or save a CV review and cover letter before submitting or following up.',
        reason: `Recommended because readiness is ${readiness.score}/100 and documents are ${readiness.documentReadiness.toLowerCase()}.`,
        confidence: readiness.confidence,
        application: app,
        path: '/documents',
      })
    }
  }

  const emailUpdate = emailSuggestions.find(item => item.status === 'pending')
  if (emailUpdate) {
    candidates.push({
      priority: 88,
      title: 'Review a Gmail application update',
      action: 'Approve, dismiss, or create an application from the pending email suggestion.',
      reason: `Recommended because Gmail found: ${emailUpdate.suggested_title || emailUpdate.email?.subject || 'an application-related email'}.`,
      confidence: Number(emailUpdate.confidence || 0.7),
      application: null,
      path: '/email',
    })
  }

  if (candidates.length === 0) {
    return {
      title: 'Add or update one application',
      action: active.length ? 'Choose an active application and add the next concrete step.' : 'Save a job to the tracker so coaching can become specific.',
      reason: active.length ? 'Recommended because no urgent deadline, interview, or follow-up is visible right now.' : 'Recommended because the coach needs application data before it can personalize guidance.',
      confidence: active.length ? 0.62 : 0.55,
      application: active[0] || null,
      path: active.length ? '/tracker' : '/jobs',
    }
  }

  return candidates.sort((a, b) => b.priority - a.priority)[0]
}

function interviewQuestions(application, profile) {
  if (!application) return []
  const role = application.title || 'this role'
  const company = application.company || 'the company'
  const skills = [
    ...(profile?.skills?.business || []),
    ...(profile?.skills?.technical || []),
    ...(profile?.skills?.tools || []),
  ].slice(0, 4)
  const skillPrompt = skills.length ? ` Use evidence around ${skills.join(', ')}.` : ' Use evidence from your CV.'

  return [
    `Why are you interested in ${role} at ${company}?`,
    `Tell me about a time you solved a problem similar to what this role requires.${skillPrompt}`,
    `Describe a project where you worked with data, stakeholders, or ambiguity.`,
    `What would you want to learn in your first 90 days in this role?`,
    `STAR prompt: Situation, Task, Action, Result for one achievement that proves you fit ${role}.`,
  ]
}

function followUpTemplate(application, type = 'follow-up') {
  if (!application) return ''
  if (type === 'thank-you') {
    return `Subject: Thank you - ${application.title}\n\nHi [Name],\n\nThank you for taking the time to speak with me about the ${application.title} role at ${application.company}. I appreciated learning more about the team and the next steps.\n\nI remain very interested in the opportunity and would be happy to share any additional information.\n\nBest,\n[Your name]`
  }
  if (type === 'confirmation') {
    return `Subject: Interview confirmation - ${application.title}\n\nHi [Name],\n\nThank you for the invitation. I confirm my availability for the interview for the ${application.title} role at ${application.company}.\n\nBest,\n[Your name]`
  }
  return `Subject: Follow-up on ${application.title} application\n\nHi [Name],\n\nI hope you are well. I wanted to follow up on my application for the ${application.title} role at ${application.company}.\n\nI remain interested in the opportunity and would be happy to provide any additional information.\n\nBest,\n[Your name]`
}

function weekStart(date = new Date()) {
  const next = new Date(date)
  const day = next.getDay() || 7
  next.setHours(0, 0, 0, 0)
  next.setDate(next.getDate() - day + 1)
  return next
}

function inCurrentWeek(value) {
  const date = parseDate(value)
  if (!date) return false
  return date >= weekStart()
}

function weeklySummary(applications) {
  const active = applications.filter(app => !isTerminalStatus(app.status))
  const approaching = active.filter(app => {
    const days = daysUntil(app.deadline_date)
    return days !== null && days >= 0 && days <= 7
  })
  const added = applications.filter(app => inCurrentWeek(app.date_saved)).length
  const submitted = applications.filter(app => inCurrentWeek(app.date_applied) || (app.status === 'Applied' && inCurrentWeek(app.date_saved))).length
  const interviews = applications.filter(app => app.status === 'Interview').length
  const followUps = active.filter(app => app.status === 'Applied' && (daysBetween(app.date_applied || app.date_saved) || 0) >= 10).length
  const focus = interviews > 0
    ? 'Interview preparation'
    : approaching.length > 0
      ? 'Deadline execution'
      : followUps > 0
        ? 'Follow-ups'
        : active.length < 3
          ? 'Finding more strong-fit roles'
          : 'Improving application quality'

  return { added, submitted, interviews, followUps, approaching: approaching.length, focus }
}

function rejectionLearning(applications) {
  const rejected = applications.filter(app => app.status === 'Rejected')
  if (rejected.length === 0) {
    return {
      title: 'No rejection pattern yet',
      copy: 'There is no rejection data to learn from yet. Keep tracker statuses updated so patterns become useful later.',
      points: [],
      confidence: 0.55,
    }
  }

  const noCvReview = rejected.filter(app => !app.cv_review).length
  const noCover = rejected.filter(app => !app.cover_letter).length
  const noDeadline = rejected.filter(app => !app.deadline_date).length
  const sectors = rejected.reduce((acc, app) => {
    const key = app.sector || 'Unclassified'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const topSector = Object.entries(sectors).sort((a, b) => b[1] - a[1])[0]
  const points = []
  if (noCvReview > 0) points.push(`${noCvReview} rejected application${noCvReview === 1 ? '' : 's'} had no saved CV review.`)
  if (noCover > 0) points.push(`${noCover} rejected application${noCover === 1 ? '' : 's'} had no saved cover letter.`)
  if (noDeadline > 0) points.push(`${noDeadline} rejected application${noDeadline === 1 ? '' : 's'} had no saved deadline or next date.`)
  if (topSector) points.push(`Most rejections are in ${topSector[0]}, so compare role requirements before sending more applications there.`)

  return {
    title: `${rejected.length} rejected application${rejected.length === 1 ? '' : 's'} to learn from`,
    copy: 'Use this as a quality signal, not a judgment. The goal is to improve fit and evidence before the next round of applications.',
    points: points.length ? points : ['No clear pattern yet. Add CV reviews, cover letters, notes, and deadlines to make future learning sharper.'],
    confidence: rejected.length >= 3 ? 0.78 : 0.61,
  }
}

function HistoryPanel({ history, onClear }) {
  return (
    <Panel
      title="Coaching History"
      eyebrow="Privacy"
      icon={ShieldCheck}
      action={(
        <button type="button" onClick={onClear} style={secondaryButtonStyle}>
          <Trash2 size={14} strokeWidth={2.4} />
          Clear history
        </button>
      )}
    >
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55', marginBottom: '12px' }}>
        Coaching uses your private tracker, profile, document, and email-import data inside ApplyWise. It does not share career data with recruiters or companies.
      </p>
      {history.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No coaching history saved in this browser.</p>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {history.slice(0, 3).map(item => (
            <div key={item.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', background: '#fbfdff' }}>
              <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{item.title}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{formatApplicationDate(item.created_at) || 'Recently'} - {item.reason}</p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

export default function Coach() {
  const auth = useAuth()
  const [applications, setApplications] = useState([])
  const [profile, setProfile] = useState(null)
  const [emailSuggestions, setEmailSuggestions] = useState([])
  const [selectedApplicationId, setSelectedApplicationId] = useState('')
  const [practiceAnswer, setPracticeAnswer] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem('applywise-coach-history') || '[]'))
    } catch {
      setHistory([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadCoach() {
      setLoading(true)
      setError('')
      try {
        const trackerPromise = fetchTracker('All')
        const profilePromise = fetchPersonalInformation().catch(() => ({ profile: null }))
        const emailPromise = auth.session ? fetchGmailSuggestions('all').catch(() => []) : Promise.resolve([])
        const [trackerData, personalData, emailData] = await Promise.all([trackerPromise, profilePromise, emailPromise])
        if (cancelled) return
        setApplications(Array.isArray(trackerData) ? trackerData : [])
        setProfile(personalData?.profile || null)
        setEmailSuggestions(Array.isArray(emailData) ? emailData : [])
        if (trackerData?.[0]?.id) setSelectedApplicationId(String(trackerData[0].id))
      } catch {
        if (!cancelled) setError('Could not load Coach. Make sure the local server is running.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadCoach()
    return () => { cancelled = true }
  }, [auth.session])

  const profileExists = Boolean(profile?.candidate_name || profile?.summary || profile?.experience?.length || profile?.skills)
  const selectedApplication = useMemo(
    () => applications.find(app => String(app.id) === selectedApplicationId) || applications[0] || null,
    [applications, selectedApplicationId],
  )
  const readiness = useMemo(
    () => applications.map(app => ({ app, ...readinessFor(app, profileExists) })).sort((a, b) => a.score - b.score),
    [applications, profileExists],
  )
  const nextBestAction = useMemo(
    () => buildNextActions(applications, profileExists, emailSuggestions),
    [applications, profileExists, emailSuggestions],
  )
  const interviewApps = useMemo(
    () => applications.filter(app => app.status === 'Interview'),
    [applications],
  )
  const followUpApps = useMemo(
    () => applications.filter(app => app.status === 'Applied' && (daysBetween(app.date_applied || app.date_saved) || 0) >= 10),
    [applications],
  )
  const summary = useMemo(() => weeklySummary(applications), [applications])
  const rejection = useMemo(() => rejectionLearning(applications), [applications])
  const selectedQuestions = useMemo(() => interviewQuestions(selectedApplication, profile), [selectedApplication, profile])
  const answerFeedback = useMemo(() => {
    const words = practiceAnswer.trim().split(/\s+/).filter(Boolean).length
    if (!practiceAnswer.trim()) return 'Write a practice answer to get structure feedback.'
    if (words < 45) return 'Needs more detail. Add a clear situation, task, action, and measurable result.'
    if (!/\b(result|impact|increased|reduced|improved|learned|delivered|achieved)\b/i.test(practiceAnswer)) return 'Add the result or impact so the answer does not stop at describing the task.'
    return 'Good structure signal. Now make the result as specific and role-relevant as possible.'
  }, [practiceAnswer])

  useEffect(() => {
    if (!nextBestAction?.title || loading) return
    const entry = {
      id: `${Date.now()}-${nextBestAction.title}`,
      title: nextBestAction.title,
      reason: nextBestAction.reason,
      created_at: new Date().toISOString(),
    }
    setHistory(prev => {
      const next = [entry, ...prev.filter(item => item.title !== entry.title)].slice(0, 8)
      try { localStorage.setItem('applywise-coach-history', JSON.stringify(next)) } catch {}
      return next
    })
  }, [nextBestAction?.title, loading])

  function clearHistory() {
    try { localStorage.removeItem('applywise-coach-history') } catch {}
    setHistory([])
  }

  return (
    <div style={pageStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '22px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div>
          <h1 style={titleStyle}>Coach</h1>
          <p style={subtitleStyle}>Personal job-search coaching based on your applications, profile, documents, deadlines, interviews, and Gmail updates.</p>
        </div>
        <Link to="/tracker" style={primaryLinkStyle}>
          <ListChecks size={15} strokeWidth={2.4} />
          Open tracker
        </Link>
      </header>

      {error && (
        <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', background: '#fef2f2', color: 'var(--color-danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <section style={{ ...panelStyle, padding: '22px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Loading coaching context...</p>
        </section>
      ) : (
        <div style={{ display: 'grid', gap: '18px' }}>
          <Panel
            title="Next Best Action"
            eyebrow="Today"
            icon={CheckCircle2}
            action={<ConfidenceBadge value={nextBestAction.confidence} />}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '16px', alignItems: 'start' }}>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>{nextBestAction.title}</h3>
                <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', lineHeight: '1.55', fontWeight: '700', marginBottom: '8px' }}>{nextBestAction.action}</p>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>{nextBestAction.reason}</p>
              </div>
              <Link to={nextBestAction.path} style={primaryLinkStyle}>Go</Link>
            </div>
          </Panel>

          <Panel title="Application Readiness" eyebrow="Quality" icon={BarChart3}>
            {readiness.length === 0 ? (
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Save applications to see readiness scoring.</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {readiness.map(({ app, score, confidence, factors }) => {
                  const statusStyle = getStatusStyle(app.status)
                  return (
                    <article key={app.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px', background: '#fbfdff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '3px' }}>{app.title}</h3>
                          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{app.company}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <StatusBadge status={app.status} />
                          <span style={{ fontSize: '20px', fontWeight: '900', color: statusStyle.color }}>{score}/100</span>
                        </div>
                      </div>
                      <div style={{ height: 8, borderRadius: '999px', background: '#e5e7eb', overflow: 'hidden', marginBottom: '10px' }}>
                        <div style={{ width: `${score}%`, height: '100%', background: statusStyle.accent }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '8px' }}>
                        {factors.map(factor => (
                          <div key={factor.label} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '9px', background: '#ffffff' }}>
                            <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{factor.label} {Math.round((factor.score / factor.max) * 100)}%</p>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{factor.copy}</p>
                          </div>
                        ))}
                      </div>
                      <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>{confidenceLabel(confidence)} based on saved tracker and document data.</p>
                    </article>
                  )
                })}
              </div>
            )}
          </Panel>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '18px', alignItems: 'start' }}>
            <Panel title="Interview Coach" eyebrow="Preparation" icon={MessageSquareText}>
              {interviewApps.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>No applications are in Interview status yet. When one reaches Interview, this section becomes role-specific.</p>
              ) : (
                <>
                  <label style={{ display: 'block', marginBottom: '12px' }}>
                    <span style={{ ...labelStyle, display: 'block', marginBottom: '6px' }}>Interview application</span>
                    <select
                      value={selectedApplication?.id || ''}
                      onChange={event => setSelectedApplicationId(event.target.value)}
                      style={{ width: '100%', minHeight: 40, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 10px', background: '#ffffff' }}
                    >
                      {interviewApps.map(app => <option key={app.id} value={app.id}>{app.title} at {app.company}</option>)}
                    </select>
                  </label>
                  <div style={{ display: 'grid', gap: '9px', marginBottom: '12px' }}>
                    {selectedQuestions.map(question => (
                      <div key={question} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', background: '#fbfdff', fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '700', lineHeight: '1.45' }}>
                        {question}
                      </div>
                    ))}
                  </div>
                  <textarea
                    value={practiceAnswer}
                    onChange={event => setPracticeAnswer(event.target.value)}
                    placeholder="Paste a practice answer for structure feedback..."
                    style={{ width: '100%', minHeight: 104, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', resize: 'vertical', fontSize: '13px', lineHeight: '1.5' }}
                  />
                  <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{answerFeedback}</p>
                </>
              )}
            </Panel>

            <Panel title="Follow-Up Coach" eyebrow="Communication" icon={Send}>
              {followUpApps.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>No overdue follow-ups detected. Applied roles will appear here when there has been no recorded update for 10 days.</p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {followUpApps.slice(0, 3).map(app => (
                    <article key={app.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', background: '#fbfdff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{app.title}</h3>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{app.company}</p>
                        </div>
                        <ConfidenceBadge value={0.84} />
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.45', marginBottom: '8px' }}>
                        Recommended because this application has had no recorded update for {daysBetween(app.date_applied || app.date_saved)} days.
                      </p>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: '1.5', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px', background: '#ffffff' }}>
                        {followUpTemplate(app)}
                      </pre>
                    </article>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '18px', alignItems: 'start' }}>
            <Panel title="Weekly Progress Summary" eyebrow="This week" icon={CalendarDays}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
                {[
                  ['Added', summary.added],
                  ['Submitted', summary.submitted],
                  ['Interviews', summary.interviews],
                  ['Follow-ups due', summary.followUps],
                  ['Deadlines soon', summary.approaching],
                  ['Focus', summary.focus],
                ].map(([label, value]) => (
                  <div key={label} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px', background: '#fbfdff' }}>
                    <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</p>
                    <p style={{ fontSize: typeof value === 'number' ? '22px' : '14px', fontWeight: '900', color: 'var(--color-text-primary)' }}>{value}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>Recommended focus for next week: {summary.focus}. This is based on current statuses, saved dates, and approaching deadlines.</p>
            </Panel>

            <Panel title="Rejection Learning" eyebrow="Patterns" icon={AlertCircle} action={<ConfidenceBadge value={rejection.confidence} />}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px' }}>{rejection.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55', marginBottom: '10px' }}>{rejection.copy}</p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {rejection.points.map(point => (
                  <div key={point} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: '1.45' }}>
                    <CheckCircle2 size={15} strokeWidth={2.4} style={{ color: 'var(--color-applied-teal)', flexShrink: 0, marginTop: 2 }} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '18px', alignItems: 'start' }}>
            <Panel title="Profile Context" eyebrow="Personal data" icon={UserRound}>
              {profileExists ? (
                <div style={{ display: 'grid', gap: '8px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '800' }}>{profile?.candidate_name || 'Saved profile'}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{profile?.headline || profile?.summary || 'Profile data is saved and can support coaching recommendations.'}</p>
                  {profile?.missing_fields?.length > 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--color-warning)', lineHeight: '1.5' }}>Confirm missing profile fields: {profile.missing_fields.slice(0, 3).join(', ')}.</p>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55', marginBottom: '12px' }}>The coach has limited confidence because no saved personal profile is available.</p>
                  <Link to="/documents" style={primaryLinkStyle}>
                    <FileText size={15} strokeWidth={2.4} />
                    Extract CV profile
                  </Link>
                </div>
              )}
            </Panel>

            <HistoryPanel history={history} onClear={clearHistory} />
          </div>
        </div>
      )}
    </div>
  )
}
