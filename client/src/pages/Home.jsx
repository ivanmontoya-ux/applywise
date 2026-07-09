import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  FileText,
  ListChecks,
  Send,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { fetchPersonalInformation, fetchTracker } from '../lib/api'
import WorkflowGuide from '../components/WorkflowGuide'
import {
  APPLICATION_STATUSES,
  formatApplicationDate,
  getDocumentReadiness,
  getNextAction,
  getStatusStyle,
  isTerminalStatus,
} from '../lib/application'

const pageStyle = { padding: '36px 40px', maxWidth: '1180px' }
const heroStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '24px',
  flexWrap: 'wrap',
  marginBottom: '32px',
  padding: '28px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f7fbfb 100%)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}
const eyebrowStyle = {
  fontSize: '12px',
  fontWeight: '800',
  color: 'var(--color-applied-teal)',
  textTransform: 'uppercase',
  letterSpacing: '0',
  marginBottom: '8px',
}
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '620px' }
const panelStyle = {
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}
const primaryLinkStyle = {
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  padding: '0 16px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-applied-teal)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '800',
  textDecoration: 'none',
  boxShadow: 'var(--shadow-primary)',
  transition: 'transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease',
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
  background: 'var(--color-bg)',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  boxShadow: 'var(--shadow-sm)',
}
const featureIconBaseStyle = {
  width: 48,
  height: 48,
  minWidth: 48,
  borderRadius: 'var(--radius-md)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}
const tealFeatureIconStyle = {
  ...featureIconBaseStyle,
  background: 'var(--color-applied-teal-soft)',
  color: 'var(--color-applied-teal)',
  border: '1px solid #bddbf5',
}
const indigoFeatureIconStyle = {
  ...featureIconBaseStyle,
  background: 'var(--color-applied-teal-soft)',
  color: 'var(--color-applied-teal)',
  border: '1px solid #bddbf5',
}

function Panel({ title, eyebrow, children, action }) {
  return (
    <section className="interactive-card" style={{ ...panelStyle, padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          {eyebrow && (
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0', marginBottom: '5px' }}>
              {eyebrow}
            </p>
          )}
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function SkeletonLine({ width = '100%', height = 12, radius = 6 }) {
  return (
    <div
      className="skeleton-block"
      style={{ width, height, borderRadius: radius }}
    />
  )
}

function ActionSkeletonList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', background: '#fbfdff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <SkeletonLine width="64%" height={14} />
              <div style={{ marginTop: 8 }}>
                <SkeletonLine width="38%" height={11} />
              </div>
            </div>
            <SkeletonLine width={58} height={24} radius={999} />
          </div>
          <SkeletonLine width="92%" height={12} />
          <div style={{ marginTop: 8 }}>
            <SkeletonLine width="70%" height={12} />
          </div>
        </div>
      ))}
    </div>
  )
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
      fontWeight: '700',
    }}>
      {status}
    </span>
  )
}

function EmptyState({ icon: Icon, title, copy, action }) {
  return (
    <div style={{
      minHeight: 150,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '12px',
      color: 'var(--color-text-secondary)',
    }}>
      <span style={tealFeatureIconStyle}>
        <Icon size={22} strokeWidth={2.4} />
      </span>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '14px', lineHeight: '1.55', maxWidth: '360px' }}>{copy}</p>
      </div>
      {action}
    </div>
  )
}

function sortByDeadline(applications) {
  return [...applications].sort((a, b) => {
    const aTime = a.deadline_date ? new Date(a.deadline_date).getTime() : Number.MAX_SAFE_INTEGER
    const bTime = b.deadline_date ? new Date(b.deadline_date).getTime() : Number.MAX_SAFE_INTEGER
    return aTime - bTime
  })
}

function getFirstName(value) {
  const normalized = String(value || '').trim().replace(/[._-]+/g, ' ')
  if (!normalized) return ''

  const firstWord = normalized.split(/\s+/)[0]?.replace(/[^a-z0-9']/gi, '')
  if (!firstWord) return ''

  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1)
}

function hasProfileEvidence(profile) {
  if (!profile || typeof profile !== 'object') return false
  const skills = profile.skills && typeof profile.skills === 'object' ? profile.skills : {}
  return Boolean(
    profile.candidate_name ||
    profile.headline ||
    profile.summary ||
    profile.education?.length ||
    profile.experience?.length ||
    profile.projects?.length ||
    Object.values(skills).some(items => Array.isArray(items) && items.length),
  )
}

function applicationLabel(application) {
  if (!application) return 'this application'
  return [application.title, application.company].filter(Boolean).join(' at ') || 'this application'
}

function firstIncompleteStep(steps) {
  return steps.find(step => !step.done)?.id
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const target = new Date(dateStr)
  if (Number.isNaN(target.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

function daysSince(dateStr) {
  const until = daysUntil(dateStr)
  return until === null ? null : Math.abs(Math.min(until, 0))
}

function pluralize(value, singular, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`
}

function applicationShortName(app) {
  if (!app) return 'this application'
  if (app.company && app.title) return `${app.company} (${app.title})`
  return app.company || app.title || 'this application'
}

function buildAttentionItems(applications) {
  const active = applications.filter(app => !isTerminalStatus(app.status))
  return active
    .map(app => {
      const deadlineDays = daysUntil(app.deadline_date)
      const appliedAge = daysSince(app.date_applied || app.date_saved)
      const needsDocuments = getDocumentReadiness(app) !== 'Complete'
      let score = 0
      const reasons = []

      if (app.status === 'Interview') {
        score += 35
        reasons.push('it is in Interview stage')
      }
      if (app.status === 'Assessment') {
        score += 30
        reasons.push('an assessment may need action')
      }
      if (deadlineDays !== null && deadlineDays < 0) {
        score += 45
        reasons.push('the saved deadline has passed')
      } else if (deadlineDays !== null && deadlineDays <= 1) {
        score += 40
        reasons.push(deadlineDays === 0 ? 'the deadline is today' : 'the deadline is tomorrow')
      } else if (deadlineDays !== null && deadlineDays <= 3) {
        score += 25
        reasons.push(`the deadline is in ${pluralize(deadlineDays, 'day')}`)
      }
      if (app.status === 'Applied' && appliedAge !== null && appliedAge >= 10) {
        score += 28
        reasons.push(`it has been ${pluralize(appliedAge, 'day')} since you applied`)
      }
      if (needsDocuments && ['Saved', 'Applied'].includes(app.status)) {
        score += 18
        reasons.push(`documents are ${getDocumentReadiness(app).toLowerCase()}`)
      }
      if (!app.deadline_date && app.deadline_type !== 'rolling' && ['Saved', 'Applied', 'Assessment'].includes(app.status)) {
        score += 12
        reasons.push('no deadline is saved')
      }

      return { app, score, reasons, deadlineDays, appliedAge }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
}

function buildFollowUpItems(applications) {
  return applications
    .filter(app => !isTerminalStatus(app.status) && app.status === 'Applied')
    .map(app => ({ app, age: daysSince(app.date_applied || app.date_saved) }))
    .filter(item => item.age !== null && item.age >= 10)
    .sort((a, b) => b.age - a.age)
}

function buildDashboardChatAnswer(question, context) {
  const normalized = String(question || '').toLowerCase()
  const applications = context.applications || []
  const attentionItems = buildAttentionItems(applications)
  const followUps = buildFollowUpItems(applications)
  const closestDeadline = context.upcomingDeadlines?.[0] || null
  const mostUrgent = attentionItems[0] || null

  if (!applications.length) {
    if (!context.profileReady) {
      return 'Start by uploading your CV and extracting Personal Information. After that, add your first job so ApplyWise can give specific next steps instead of generic advice.'
    }
    return 'Add your first job to the tracker. Once there is a real application, I can tell you which deadline, follow-up, or document task is most urgent.'
  }

  if (normalized.includes('deadline') || normalized.includes('closest') || normalized.includes('soon')) {
    if (!closestDeadline) return 'No saved deadlines are visible yet. Add deadlines to your active applications so I can prioritize what is closest.'
    const deadlineDays = daysUntil(closestDeadline.deadline_date)
    const timing = deadlineDays === 0
      ? 'today'
      : deadlineDays === 1
        ? 'tomorrow'
        : deadlineDays < 0
          ? `${pluralize(Math.abs(deadlineDays), 'day')} ago`
          : `in ${pluralize(deadlineDays, 'day')}`
    return `The closest deadline is ${applicationShortName(closestDeadline)}, due ${timing} on ${formatApplicationDate(closestDeadline.deadline_date)}. Open it and check documents before moving forward.`
  }

  if (normalized.includes('follow')) {
    if (!followUps.length) return 'No follow-up is clearly due yet. I would still add follow-up reminders for Applied applications so nothing goes quiet.'
    const top = followUps[0]
    return `Follow up with ${applicationShortName(top.app)} first. It has been ${pluralize(top.age, 'day')} since you applied, so it is the strongest follow-up candidate.`
  }

  if (normalized.includes('urgent') || normalized.includes('attention') || normalized.includes('today')) {
    if (!attentionItems.length) return 'Nothing looks urgent today. The best use of time is to improve one active application: add missing deadlines, finish documents, or prepare the next follow-up.'
    const topItems = attentionItems.slice(0, 2).map(item => `${applicationShortName(item.app)} because ${item.reasons.slice(0, 2).join(' and ')}`)
    return `These need attention: ${topItems.join('; ')}. Start with ${applicationShortName(mostUrgent.app)}.`
  }

  if (normalized.includes('improve') || normalized.includes('week') || normalized.includes('better')) {
    const missingDocs = applications.filter(app => !isTerminalStatus(app.status) && getDocumentReadiness(app) !== 'Complete').length
    const missingDeadlines = applications.filter(app => !isTerminalStatus(app.status) && !app.deadline_date && app.deadline_type !== 'rolling').length
    if (!context.profileReady) return 'This week, improve your setup by saving Personal Information from your CV. That will make CV reviews, cover letters, and job recommendations more specific.'
    if (missingDocs > 0) return `This week, focus on document quality. ${pluralize(missingDocs, 'active application')} still need CV review or cover letter work.`
    if (missingDeadlines > 0) return `This week, improve tracking quality. ${pluralize(missingDeadlines, 'active application')} still need a deadline or next expected date.`
    if (followUps.length > 0) return `This week, clean up follow-ups. Start with ${applicationShortName(followUps[0].app)}, then review the rest of your Applied applications.`
    return 'This week, add one or two better-fit jobs and keep each application complete: deadline, tailored documents, status, and next action.'
  }

  if (context.dashboardAction) {
    return `${context.dashboardAction.title}. ${context.dashboardAction.reason} ${context.dashboardAction.copy}`
  }

  if (mostUrgent) {
    return `Start with ${applicationShortName(mostUrgent.app)} because ${mostUrgent.reasons.join(' and ')}.`
  }

  return 'Review your tracker and choose one concrete next action: finish documents, add a deadline, prepare for an interview, or create a follow-up reminder.'
}

function DashboardChatbot({ applications, upcomingDeadlines, dashboardAction, profileReady, loading }) {
  const starter = dashboardAction
    ? `${dashboardAction.title}. ${dashboardAction.reason}`
    : 'Ask me what needs attention, which deadline is closest, or who to follow up with.'
  const [messages, setMessages] = useState([{ role: 'assistant', text: starter }])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!loading) {
      setMessages(prev => {
        if (prev.length > 1) return prev
        return [{ role: 'assistant', text: starter }]
      })
    }
  }, [loading, starter])

  const quickQuestions = [
    'What needs attention today?',
    'Closest deadline?',
    'Who should I follow up with?',
  ]

  function ask(question) {
    const cleanQuestion = String(question || '').trim()
    if (!cleanQuestion || loading) return

    const answer = buildDashboardChatAnswer(cleanQuestion, {
      applications,
      upcomingDeadlines,
      dashboardAction,
      profileReady,
    })
    setMessages(prev => [...prev.slice(-4), { role: 'user', text: cleanQuestion }, { role: 'assistant', text: answer }])
    setDraft('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    ask(draft)
  }

  const visibleMessages = messages.slice(-2)

  return (
    <section style={{ ...panelStyle, padding: '18px 20px', marginBottom: '22px', background: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={indigoFeatureIconStyle}>
          <Bot size={22} strokeWidth={2.4} />
        </span>
        <div>
          <p style={{ ...eyebrowStyle, marginBottom: '3px' }}>AI command center</p>
          <h2 style={{ fontSize: '17px', lineHeight: '1.2', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
            What should I do next?
          </h2>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          {visibleMessages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.text.slice(0, 20)}`}
              style={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                justifySelf: message.role === 'user' ? 'end' : 'start',
                maxWidth: message.role === 'user' ? '82%' : '100%',
                padding: '9px 11px',
                borderRadius: '12px',
                border: message.role === 'user' ? '1px solid var(--color-indigo-border)' : '1px solid var(--color-border)',
                background: message.role === 'user' ? 'var(--color-indigo-soft)' : '#ffffff',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                lineHeight: '1.45',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {quickQuestions.map(question => (
            <button
              key={question}
              type="button"
              onClick={() => ask(question)}
              disabled={loading}
              className="secondary-action pressable"
              style={{
                minHeight: 32,
                padding: '0 10px',
                borderRadius: '999px',
                border: '1px solid var(--color-border)',
                background: '#ffffff',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                fontWeight: '800',
                boxShadow: 'var(--shadow-sm)',
                opacity: loading ? 0.55 : 1,
              }}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '8px', marginTop: '12px' }}>
        <input
          type="text"
          value={draft}
          onChange={event => setDraft(event.target.value)}
          placeholder="Ask: Which application is most urgent?"
          disabled={loading}
          style={{
            flex: 1,
            minHeight: 38,
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0 12px',
            background: '#ffffff',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !draft.trim()}
          className="primary-action pressable"
          style={{
            minHeight: 38,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '0 14px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-applied-teal)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '800',
            boxShadow: 'var(--shadow-primary)',
            opacity: loading || !draft.trim() ? 0.55 : 1,
          }}
        >
          <Send size={14} strokeWidth={2.4} />
          Ask
        </button>
      </form>
    </section>
  )
}

export default function Home() {
  const auth = useAuth()
  const [applications, setApplications] = useState([])
  const [personalInfo, setPersonalInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadHome() {
      setLoading(true)
      setError('')
      try {
        const [trackerData, personalData] = await Promise.all([
          fetchTracker('All'),
          fetchPersonalInformation().catch(() => ({ profile: null })),
        ])
        if (cancelled) return
        setApplications(trackerData)
        setPersonalInfo(personalData?.profile || null)
      } catch {
        if (!cancelled) setError('Could not load Home. Make sure the local server is running.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadHome()
    return () => { cancelled = true }
  }, [])

  const activeApplications = useMemo(
    () => applications.filter(app => !isTerminalStatus(app.status)).slice(0, 5),
    [applications],
  )
  const upcomingDeadlines = useMemo(
    () => sortByDeadline(applications.filter(app => app.deadline_date && !isTerminalStatus(app.status))).slice(0, 4),
    [applications],
  )
  const nextActions = useMemo(
    () => activeApplications.slice(0, 3).map(app => ({ app, action: getNextAction(app) })),
    [activeApplications],
  )
  const profileReady = useMemo(() => hasProfileEvidence(personalInfo), [personalInfo])
  const firstApplication = activeApplications[0] || applications[0] || null
  const applicationNeedingDocuments = useMemo(
    () => activeApplications.find(app => getDocumentReadiness(app) !== 'Complete') || null,
    [activeApplications],
  )
  const applicationMissingDeadline = useMemo(
    () => activeApplications.find(app => !app.deadline_date && app.deadline_type !== 'rolling') || null,
    [activeApplications],
  )
  const counts = useMemo(() => {
    const next = Object.fromEntries(APPLICATION_STATUSES.map(status => [status, 0]))
    applications.forEach(app => {
      if (next[app.status] !== undefined) next[app.status] += 1
    })
    return next
  }, [applications])
  const firstName = useMemo(() => {
    const profileName = getFirstName(personalInfo?.candidate_name)
    if (profileName) return profileName

    const metadataName = getFirstName(
      auth.user?.user_metadata?.full_name ||
      auth.user?.user_metadata?.name ||
      auth.user?.full_name ||
      auth.user?.name,
    )
    if (metadataName) return metadataName

    return getFirstName(auth.user?.email?.split('@')[0])
  }, [auth.user, personalInfo])
  const workflowSteps = useMemo(() => {
    const hasProfile = profileReady
    const hasTrackedJob = applications.length > 0
    const hasTailoredDocs = applications.some(app => app.cv_review || app.cover_letter)
    const hasTrackerReady = hasTrackedJob && hasTailoredDocs
    const hasCoachContext = hasProfile && hasTrackedJob && hasTailoredDocs && applications.some(app => app.status && app.status !== 'Saved')
    const steps = [
      { id: 'profile', title: 'Extract CV profile', copy: 'Upload the current CV and save reusable Personal Information.', to: '/documents', done: hasProfile, icon: FileText },
      { id: 'jobs', title: 'Add first job', copy: 'Find a role or add one manually so there is a real application to work on.', to: '/jobs', done: hasTrackedJob, icon: Briefcase },
      { id: 'documents', title: 'Tailor documents', copy: 'Generate CV recommendations and a cover letter for the selected role.', to: '/documents', done: hasTailoredDocs, icon: FileText },
      { id: 'tracker', title: 'Save to tracker', copy: 'Keep the role, deadline, status, documents, and next action together.', to: '/tracker', done: hasTrackerReady, icon: ListChecks },
      { id: 'coach', title: 'Use Coach', copy: 'Let Coach prioritize follow-ups, reminders, and interview prep.', to: '/coach', done: hasCoachContext, icon: CheckCircle2 },
    ]
    const activeStep = firstIncompleteStep(steps)
    return steps.map(step => ({ ...step, active: step.id === activeStep }))
  }, [applications, profileReady])
  const dashboardAction = useMemo(() => {
    if (loading) return null
    if (!profileReady) {
      return {
        eyebrow: 'Start here',
        title: 'Add your CV and extract Personal Information',
        copy: 'This creates the reusable profile that powers CV reviews, cover letters, job recommendations, and coaching.',
        reason: 'Recommended because ApplyWise does not have saved Personal Information yet.',
        to: '/documents',
        label: 'Add CV',
        icon: FileText,
      }
    }
    if (applications.length === 0) {
      return {
        eyebrow: 'Next best action',
        title: 'Add your first job',
        copy: 'Choose a role from Jobs or add one manually so ApplyWise can build a real application workflow.',
        reason: 'Recommended because there is no tracked application yet.',
        to: '/jobs',
        label: 'Find or add a job',
        icon: Briefcase,
      }
    }
    if (applicationNeedingDocuments && getDocumentReadiness(applicationNeedingDocuments) !== 'Complete') {
      return {
        eyebrow: 'Next best action',
        title: `Tailor documents for ${applicationLabel(applicationNeedingDocuments)}`,
        copy: 'Run a CV fit analysis and draft a cover letter before moving the application forward.',
        reason: `Recommended because document readiness is ${getDocumentReadiness(applicationNeedingDocuments)}.`,
        to: '/documents',
        label: 'Generate tailored advice',
        icon: FileText,
      }
    }
    if (applicationMissingDeadline) {
      return {
        eyebrow: 'Next best action',
        title: `Add a deadline for ${applicationLabel(applicationMissingDeadline)}`,
        copy: 'A deadline makes reminders, follow-ups, and weekly planning much more reliable.',
        reason: 'Recommended because this tracked application has no deadline yet.',
        to: `/tracker/${applicationMissingDeadline.id}`,
        label: 'Open application',
        icon: CalendarDays,
      }
    }
    const interviewApplication = activeApplications.find(app => app.status === 'Interview')
    if (interviewApplication) {
      return {
        eyebrow: 'Next best action',
        title: `Prepare interview notes for ${applicationLabel(interviewApplication)}`,
        copy: 'Use the application detail page to review documents, reminders, and coach suggestions for the interview stage.',
        reason: 'Recommended because this application is currently in Interview.',
        to: `/tracker/${interviewApplication.id}`,
        label: 'Prepare interview',
        icon: ListChecks,
      }
    }
    const appliedApplication = activeApplications.find(app => app.status === 'Applied')
    if (appliedApplication) {
      return {
        eyebrow: 'Next best action',
        title: `Check follow-up timing for ${applicationLabel(appliedApplication)}`,
        copy: 'Review the timeline and decide whether a follow-up reminder or recruiter reply is needed.',
        reason: 'Recommended because applied applications should not go quiet without a next action.',
        to: `/tracker/${appliedApplication.id}`,
        label: 'Review follow-up',
        icon: CalendarDays,
      }
    }
    return {
      eyebrow: 'Next best action',
      title: 'Review your active tracker',
      copy: 'Check statuses, documents, deadlines, and coach suggestions so the next application step stays clear.',
      reason: 'Recommended because the setup workflow is complete enough for ongoing tracking.',
      to: firstApplication ? `/tracker/${firstApplication.id}` : '/tracker',
      label: 'Open tracker',
      icon: ListChecks,
    }
  }, [activeApplications, applicationMissingDeadline, applicationNeedingDocuments, applications.length, firstApplication, loading, profileReady])
  const DashboardActionIcon = dashboardAction?.icon || ListChecks

  return (
    <div style={pageStyle}>
      <header style={heroStyle}>
        <div>
          <p style={eyebrowStyle}>Today in ApplyWise</p>
          <h1 style={titleStyle}>
            {firstName ? `${firstName}, here is your next best step.` : 'Here is your next best step.'}
          </h1>
          <p style={subtitleStyle}>Your jobs, applications, documents, reminders, and CV work stay organized in one private workspace.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link to="/jobs" className="primary-action pressable" style={primaryLinkStyle}>
            <Briefcase size={16} strokeWidth={2.4} />
            Find jobs
          </Link>
          <Link to="/tracker" className="secondary-action pressable" style={secondaryLinkStyle}>Open tracker</Link>
        </div>
      </header>

      {error && (
        <div style={{ marginBottom: '18px', padding: '12px 14px', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', background: '#fef2f2', color: 'var(--color-danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <section style={{ ...panelStyle, padding: '26px', marginBottom: '22px', borderColor: 'rgba(33, 104, 179, 0.28)', background: '#ffffff' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <SkeletonLine width="120px" height={12} />
            <SkeletonLine width="56%" height={26} />
            <SkeletonLine width="78%" height={14} />
            <SkeletonLine width="180px" height={44} radius={8} />
          </div>
        ) : dashboardAction ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '22px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <span style={tealFeatureIconStyle}>
                <DashboardActionIcon size={22} strokeWidth={2.4} />
              </span>
              <div>
                <p style={eyebrowStyle}>{dashboardAction.eyebrow}</p>
                <h2 style={{ fontSize: '22px', lineHeight: '1.2', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  {dashboardAction.title}
                </h2>
                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', maxWidth: '760px', marginBottom: '12px' }}>
                  {dashboardAction.copy}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  {dashboardAction.reason}
                </p>
              </div>
            </div>
            <Link to={dashboardAction.to} className="primary-action pressable" style={{ ...primaryLinkStyle, minHeight: 48, padding: '0 18px', whiteSpace: 'nowrap' }}>
              {dashboardAction.label}
              <ArrowRight size={16} strokeWidth={2.4} />
            </Link>
          </div>
        ) : null}
      </section>

      <DashboardChatbot
        applications={applications}
        upcomingDeadlines={upcomingDeadlines}
        dashboardAction={dashboardAction}
        profileReady={profileReady}
        loading={loading}
      />

      <div style={{ marginBottom: '26px' }}>
        <WorkflowGuide
          title="Application setup"
          copy="Add your CV, add a job, tailor documents, and save everything in the tracker."
          steps={workflowSteps}
          compact
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '22px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <Panel
            eyebrow="Today"
            title="Application work waiting for action"
            action={<Link to="/reminders" className="secondary-action pressable" style={{ ...secondaryLinkStyle, minHeight: 36, padding: '0 12px', fontSize: '13px' }}>View reminders</Link>}
          >
            {loading ? (
              <ActionSkeletonList />
            ) : nextActions.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="Save your first job to start tracking applications."
                copy="Jobs you save will appear here with next actions, deadlines, and document prompts."
                action={<Link to="/jobs" className="primary-action pressable" style={primaryLinkStyle}>Find or add a job</Link>}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {nextActions.map(({ app, action }) => (
                  <article key={app.id} className="interactive-card" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', background: '#fbfdff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '2px' }}>{app.title}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{app.company}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{action}</p>
                  </article>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            eyebrow="Active applications"
            title="Pipeline summary"
            action={<Link to="/tracker" style={{ color: 'var(--color-applied-teal)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: '800', textDecoration: 'none' }}>Open <ArrowRight size={14} /></Link>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))', gap: '10px' }}>
              {APPLICATION_STATUSES.map(status => {
                const style = getStatusStyle(status)
                return (
                  <div key={status} style={{ border: `1px solid ${style.border}`, background: style.bg, borderRadius: 'var(--radius-md)', padding: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: '800', color: style.color, lineHeight: '1' }}>{counts[status]}</div>
                    <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>{status}</div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <Panel eyebrow="Upcoming" title="Deadlines and reminders">
            {upcomingDeadlines.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No deadlines yet. Add one if the posting includes it."
                copy="Deadlines and follow-ups stay visible until they are resolved."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingDeadlines.map(app => (
                  <article key={app.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                    <CalendarDays size={16} strokeWidth={2.3} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-warning)', fontWeight: '800', marginBottom: '3px' }}>{formatApplicationDate(app.deadline_date)}</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '800' }}>{app.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{app.company}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>

          <Panel eyebrow="Documents" title="CV readiness">
            {activeApplications.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Upload a CV before tailoring applications."
                copy="CV suggestions stay editable and user-approved."
                action={<Link to="/documents" className="secondary-action pressable" style={secondaryLinkStyle}>Open Documents</Link>}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeApplications.slice(0, 4).map(app => (
                  <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{app.company}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{app.title}</p>
                    </div>
                    <span style={{ minHeight: 24, padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: '700' }}>
                      {getDocumentReadiness(app)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          {applications.some(app => !isTerminalStatus(app.status) && !app.deadline_date) && (
            <div style={{ ...panelStyle, padding: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#fffaf0', borderColor: '#fed7aa' }}>
              <AlertCircle size={18} strokeWidth={2.3} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '13px', color: '#7c4a03', lineHeight: '1.5' }}>
                You have applications without deadlines or next actions. Add one before marking them as applied.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
