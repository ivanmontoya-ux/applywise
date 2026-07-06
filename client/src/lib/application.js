export const APPLICATION_STATUSES = [
  'Saved',
  'Applied',
  'Interview',
  'Assessment',
  'Offer',
  'Rejected',
]

export const TERMINAL_STATUSES = new Set(['Offer', 'Rejected'])

export const STATUS_STYLES = {
  Saved: { bg: '#f4f4f5', color: '#52525b', border: '#d4d4d8', accent: '#a1a1aa' },
  Applied: { bg: '#edf7f7', color: '#2f6f73', border: '#b9dada', accent: '#2f6f73' },
  Interview: { bg: '#f8fafc', color: '#475569', border: '#cbd5e1', accent: '#475569' },
  Assessment: { bg: '#fff7ed', color: '#a15c07', border: '#fed7aa', accent: '#a15c07' },
  Offer: { bg: '#f0fdf4', color: '#2f6b45', border: '#bbf7d0', accent: '#2f6b45' },
  Rejected: { bg: '#fef2f2', color: '#b42318', border: '#fecaca', accent: '#b42318' },
}

export function getStatusStyle(status) {
  return STATUS_STYLES[status] || STATUS_STYLES.Saved
}

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(status)
}

export function formatApplicationDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return null
  }
}

export function getDocumentReadiness(application) {
  if (application?.document_readiness) return application.document_readiness
  if (application?.cv_review && application?.cover_letter) return 'Complete'
  if (application?.cover_letter) return 'Cover letter ready'
  if (application?.cv_review) return 'CV reviewed'
  return 'Missing'
}

export function getNextAction(application) {
  if (!application) return 'Add an application to see the next best step.'

  const deadline = formatApplicationDate(application.deadline_date)
  if (application.status === 'Saved') {
    return deadline
      ? `Review CV evidence and apply by ${deadline}.`
      : 'Paste the job description and decide whether to apply.'
  }
  if (application.status === 'Applied') return 'Add a follow-up reminder before this application goes quiet.'
  if (application.status === 'Interview') return 'Prepare role-specific interview notes from the job description.'
  if (application.status === 'Assessment') return 'Block time to complete the assessment and gather required documents.'
  if (application.status === 'Offer') return 'Review offer details and compare deadlines before deciding.'
  if (application.status === 'Rejected') return 'Record the outcome and reuse any strong application material.'
  return 'Add a next action so this application does not drift.'
}
