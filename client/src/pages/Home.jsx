import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  FileText,
  ListChecks,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { fetchJobs, fetchPersonalInformation, fetchTracker } from '../lib/api'
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

function Panel({ title, eyebrow, children, action }) {
  return (
    <section className="interactive-card" style={{ ...panelStyle, padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
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
      minHeight: 180,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '12px',
      color: 'var(--color-text-secondary)',
    }}>
      <span style={{
        width: 42,
        height: 42,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#edf7f7',
        color: 'var(--color-applied-teal)',
      }}>
        <Icon size={20} strokeWidth={2.4} />
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

export default function Home() {
  const auth = useAuth()
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [personalInfo, setPersonalInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadHome() {
      setLoading(true)
      setError('')
      try {
        const [trackerData, jobsData, personalData] = await Promise.all([
          fetchTracker('All'),
          fetchJobs({}),
          fetchPersonalInformation().catch(() => ({ profile: null })),
        ])
        if (cancelled) return
        setApplications(trackerData)
        setJobs(jobsData.slice(0, 4))
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

      <section style={{ ...panelStyle, padding: '30px', marginBottom: '26px', borderColor: 'rgba(47, 111, 115, 0.28)', background: '#ffffff' }}>
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
              <span style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: '#edf7f7', color: 'var(--color-applied-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

      <div style={{ marginBottom: '26px' }}>
        <WorkflowGuide
          title="Build one complete application"
          copy="Best path: add your CV, add your first job, generate tailored advice, save to tracker, then let Coach manage next actions."
          steps={workflowSteps}
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

          <Panel eyebrow="Suggested jobs" title="Roles to review next">
            {jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="Find or add a job to start building your application list."
                copy="The Jobs screen is where relevant roles become tracked applications."
                action={<Link to="/jobs" className="primary-action pressable" style={primaryLinkStyle}>Open Jobs</Link>}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {jobs.map(job => (
                  <article key={job.id} className="interactive-card" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', background: '#ffffff' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: '1.35', marginBottom: '5px' }}>{job.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>{job.company}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {job.location && <span>{job.location}</span>}
                      {job.sector && <span>{job.sector}</span>}
                    </div>
                  </article>
                ))}
              </div>
            )}
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

          <Panel eyebrow="Coach" title="Specific help, not generic advice">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} strokeWidth={2.4} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>
                Choose an application before asking for fit, CV, cover letter, or next-step support.
              </p>
            </div>
            <Link to="/coach" className="secondary-action pressable" style={{ ...secondaryLinkStyle, marginTop: '14px' }}>Open Coach</Link>
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
