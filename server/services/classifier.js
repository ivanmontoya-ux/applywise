const EXCLUDE_TITLE_RE = [
  /\bsenior\b/i,
  /\bsr\.?\b/i,
  /\blead\b/i,
  /\bmanager\b/i,
  /\bdirector\b/i,
  /\bhead\b/i,
  /\bexecutive\b/i,
  /\bvp\b/i,
  /\bvice[\s-]?president\b/i,
  /\bprincipal\b/i,
  /\bmanaging\s+director\b/i,
  /\bpartner\b/i,
  /\bchief\b/i,
  /\bceo\b/i,
  /\bcfo\b/i,
  /\bcoo\b/i,
  /\bcto\b/i,
  /\bsvp\b/i,
  /\bevp\b/i,
  /\bmd\b/i,
  /\bc-suite\b/i,
]

// Matches 3–9 or any two-digit-plus number (10, 15, 20 …)
const YRS = '(?:[3-9]|\\d{2,})'

const EXCLUDE_EXP_RE = [
  new RegExp(`\\b${YRS}\\s*\\+?\\s*years?\\s+(?:of\\s+)?(?:professional\\s+|relevant\\s+|work\\s+)?experience\\b`, 'i'),
  new RegExp(`\\bminimum\\s+(?:of\\s+)?${YRS}\\s*years?\\b`, 'i'),
  new RegExp(`\\bat\\s+least\\s+${YRS}\\s*years?\\b`, 'i'),
  new RegExp(`\\b${YRS}\\+?\\s*years?\\s+experience\\b`, 'i'),
]

const CLASSIFY_RULES = [
  {
    grandCategory: 'Graduate Program', subType: 'Graduate',
    kws: ['graduate', 'grad programme', 'grad program', 'grad scheme', 'graduate scheme',
          'graduate programme', 'graduate program', 'newly qualified', 'new grad'],
  },
  {
    grandCategory: 'Graduate Program', subType: 'Trainee',
    kws: ['trainee', 'in training'],
  },
  {
    grandCategory: 'Graduate Program', subType: 'Junior',
    kws: ['junior', 'jr.'],
  },
  {
    grandCategory: 'Graduate Program', subType: 'Apprentice',
    kws: ['apprentice', 'apprenticeship', 'school leaver'],
  },
  {
    grandCategory: 'Internship', subType: 'Internship',
    kws: ['intern', 'internship'],
  },
  {
    grandCategory: 'Internship', subType: 'Placement',
    kws: ['placement', 'industrial placement', 'year in industry'],
  },
  {
    grandCategory: 'Internship', subType: 'Work Experience',
    kws: ['work experience', 'shadowing'],
  },
  {
    grandCategory: 'Analyst Role', subType: 'Quantitative',
    kws: ['quant', 'quantitative'],
  },
  {
    grandCategory: 'Analyst Role', subType: 'Research',
    kws: ['research', 'researcher'],
  },
  {
    grandCategory: 'Analyst Role', subType: 'Analyst',
    kws: ['analyst'],
  },
  {
    grandCategory: 'Associate', subType: 'Associate',
    kws: ['associate'],
  },
  {
    grandCategory: 'Associate', subType: 'Assistant',
    kws: ['assistant'],
  },
  {
    grandCategory: 'Other', subType: 'Consultant',
    kws: ['consultant', 'consulting'],
  },
  {
    grandCategory: 'Other', subType: 'Specialist',
    kws: ['specialist'],
  },
  {
    grandCategory: 'Other', subType: 'Officer',
    kws: ['officer'],
  },
  {
    grandCategory: 'Other', subType: 'Coordinator',
    kws: ['coordinator'],
  },
]

export function isExcluded(title = '', description = '') {
  const t = title.toLowerCase()
  for (const re of EXCLUDE_TITLE_RE) {
    if (re.test(t)) return true
  }
  const snippet = `${title} ${(description || '').slice(0, 1500)}`
  for (const re of EXCLUDE_EXP_RE) {
    if (re.test(snippet)) return true
  }
  return false
}

export function classifyJob(title = '') {
  const t = title.toLowerCase()
  for (const { grandCategory, subType, kws } of CLASSIFY_RULES) {
    for (const kw of kws) {
      if (t.includes(kw)) return { grandCategory, subType }
    }
  }
  return { grandCategory: 'Entry-Level', subType: 'General' }
}

export function inferExperienceLevel(title = '', description = '') {
  const t = title.toLowerCase()
  const d = (description || '').toLowerCase().slice(0, 1500)
  const full = `${t} ${d}`

  // Senior check first
  for (const re of EXCLUDE_TITLE_RE) {
    if (re.test(t)) return 'Senior'
  }
  for (const re of EXCLUDE_EXP_RE) {
    if (re.test(full)) return 'Senior'
  }

  const { grandCategory } = classifyJob(title)
  if (grandCategory === 'Graduate Program') return 'Graduate'
  if (grandCategory === 'Internship')       return 'Internship'
  if (grandCategory === 'Analyst Role')     return 'Analyst'
  if (grandCategory === 'Associate')        return 'Associate'

  // Description-based signals for titles that didn't match above
  if (/\b(recent\s*grad|new\s*grad|fresh\s*grad|entry[\s\-]?level|no\s*(prior\s*)?experience|0[\s\-]?–1?\s*[12]\s*years?|spring\s*week|summer\s*(analyst|associate)|campus\s*hire|early\s*career|newly\s*qualified)\b/.test(d)) {
    return 'Entry Level'
  }

  if (grandCategory === 'Entry-Level') return 'Entry Level'

  if (/\b[2-5]\+?\s*years?\s*(of\s*)?experience\b/.test(d)) return 'Mid Level'

  return null
}
