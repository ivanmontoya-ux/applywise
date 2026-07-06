const GEMINI_INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions'
const DEFAULT_MODEL = 'gemini-3.5-flash'
const MAX_CV_TEXT_CHARS = 45000
const MAX_JOB_TEXT_CHARS = 18000
const MAX_RECOMMENDATION_JOBS = 30
const MAX_FILE_BYTES = 5 * 1024 * 1024

const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
])

const cvReviewSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'A short direct summary of how the CV matches the selected role.',
    },
    fit_score: {
      type: 'integer',
      description: 'Estimated fit score from 0 to 100 based only on provided evidence.',
      minimum: 0,
      maximum: 100,
    },
    recommendation: {
      type: 'string',
      enum: ['strong_match', 'possible_match', 'weak_match'],
    },
    role_focus: {
      type: 'string',
      description: 'The role focus inferred from the job and CV.',
    },
    top_strengths: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          evidence: { type: 'string' },
          why_it_matters: { type: 'string' },
        },
        required: ['evidence', 'why_it_matters'],
      },
    },
    evidence_gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          requirement: { type: 'string' },
          cv_gap: { type: 'string' },
          how_to_fix: { type: 'string' },
        },
        required: ['requirement', 'cv_gap', 'how_to_fix'],
      },
    },
    bullet_rewrites: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          section: { type: 'string' },
          current_issue: { type: 'string' },
          suggested_bullet: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['section', 'current_issue', 'suggested_bullet', 'reason'],
      },
    },
    keyword_suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          keyword: { type: 'string' },
          why: { type: 'string' },
          where_to_add: { type: 'string' },
        },
        required: ['keyword', 'why', 'where_to_add'],
      },
    },
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          concern: { type: 'string' },
          safer_alternative: { type: 'string' },
        },
        required: ['claim', 'concern', 'safer_alternative'],
      },
    },
    next_steps: {
      type: 'array',
      items: { type: 'string' },
    },
    cover_letter_angles: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'summary',
    'fit_score',
    'recommendation',
    'role_focus',
    'top_strengths',
    'evidence_gaps',
    'bullet_rewrites',
    'keyword_suggestions',
    'risks',
    'next_steps',
    'cover_letter_angles',
  ],
}

const cvProfileSchema = {
  type: 'object',
  properties: {
    candidate_name: { type: 'string' },
    headline: { type: 'string' },
    summary: { type: 'string' },
    contact: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        phone: { type: 'string' },
        location: { type: 'string' },
        linkedin: { type: 'string' },
        portfolio: { type: 'string' },
      },
      required: ['email', 'phone', 'location', 'linkedin', 'portfolio'],
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          institution: { type: 'string' },
          degree: { type: 'string' },
          field: { type: 'string' },
          location: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          details: { type: 'array', items: { type: 'string' } },
        },
        required: ['institution', 'degree', 'field', 'location', 'start_date', 'end_date', 'details'],
      },
    },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          organization: { type: 'string' },
          role: { type: 'string' },
          location: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          achievements: { type: 'array', items: { type: 'string' } },
          skills_used: { type: 'array', items: { type: 'string' } },
        },
        required: ['organization', 'role', 'location', 'start_date', 'end_date', 'achievements', 'skills_used'],
      },
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          context: { type: 'string' },
          description: { type: 'string' },
          outcomes: { type: 'array', items: { type: 'string' } },
          skills_used: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'context', 'description', 'outcomes', 'skills_used'],
      },
    },
    skills: {
      type: 'object',
      properties: {
        technical: { type: 'array', items: { type: 'string' } },
        business: { type: 'array', items: { type: 'string' } },
        tools: { type: 'array', items: { type: 'string' } },
        languages: { type: 'array', items: { type: 'string' } },
        other: { type: 'array', items: { type: 'string' } },
      },
      required: ['technical', 'business', 'tools', 'languages', 'other'],
    },
    certifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          issuer: { type: 'string' },
          date: { type: 'string' },
        },
        required: ['name', 'issuer', 'date'],
      },
    },
    evidence_points: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          evidence: { type: 'string' },
          category: { type: 'string' },
          source_section: { type: 'string' },
        },
        required: ['evidence', 'category', 'source_section'],
      },
    },
    missing_fields: {
      type: 'array',
      items: { type: 'string' },
    },
    extraction_notes: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'candidate_name',
    'headline',
    'summary',
    'contact',
    'education',
    'experience',
    'projects',
    'skills',
    'certifications',
    'evidence_points',
    'missing_fields',
    'extraction_notes',
  ],
}

const coverLetterSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    opening_strategy: { type: 'string' },
    cover_letter: { type: 'string' },
    evidence_used: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          cv_evidence: { type: 'string' },
          why_it_matters: { type: 'string' },
        },
        required: ['claim', 'cv_evidence', 'why_it_matters'],
      },
    },
    personalization_notes: {
      type: 'array',
      items: { type: 'string' },
    },
    missing_inputs: {
      type: 'array',
      items: { type: 'string' },
    },
    editing_checklist: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'title',
    'opening_strategy',
    'cover_letter',
    'evidence_used',
    'personalization_notes',
    'missing_inputs',
    'editing_checklist',
  ],
}

const jobRecommendationSchema = {
  type: 'object',
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          job_id: { type: 'string' },
          fit_score: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },
          fit_label: {
            type: 'string',
            enum: ['strong_fit', 'potential_fit', 'stretch'],
          },
          reason: { type: 'string' },
          matching_evidence: {
            type: 'array',
            items: { type: 'string' },
          },
          concerns: {
            type: 'array',
            items: { type: 'string' },
          },
          next_step: { type: 'string' },
        },
        required: ['job_id', 'fit_score', 'fit_label', 'reason', 'matching_evidence', 'concerns', 'next_step'],
      },
    },
  },
  required: ['recommendations'],
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return ''
  return value.replace(/\r\n/g, '\n').trim().slice(0, maxLength)
}

function toText(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function estimateBase64Bytes(data) {
  if (typeof data !== 'string') return 0
  const clean = data.replace(/^data:[^,]+,/, '').replace(/\s/g, '')
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0
  return Math.max(0, Math.floor((clean.length * 3) / 4) - padding)
}

function normalizeMimeType(mimeType, fileName = '') {
  const lowered = String(mimeType || '').toLowerCase()
  if (DOCUMENT_MIME_TYPES.has(lowered)) return lowered

  const name = String(fileName || '').toLowerCase()
  if (name.endsWith('.pdf')) return 'application/pdf'
  if (name.endsWith('.doc')) return 'application/msword'
  if (name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (name.endsWith('.md')) return 'text/markdown'
  if (name.endsWith('.txt')) return 'text/plain'
  return lowered
}

function normalizeBase64(data) {
  if (typeof data !== 'string') return ''
  return data.replace(/^data:[^,]+,/, '').replace(/\s/g, '')
}

function buildPrompt({ cvText, jobTitle, company, jobDescription, applicationNotes, personalInfo }) {
  const jobLine = [jobTitle, company].filter(Boolean).join(' at ')
  return [
    'Review this CV for a graduate or early-career application.',
    '',
    'Rules:',
    '- Base every recommendation on evidence from the CV and job context.',
    '- Do not invent achievements, employers, grades, tools, languages, or metrics.',
    '- If evidence is missing, say what the user should add or verify.',
    '- Make suggestions practical for European graduate roles.',
    '- Keep the tone calm, direct, and specific.',
    '',
    `Selected application: ${jobLine || 'Not specified'}`,
    '',
    'Job description or target-role context:',
    jobDescription || 'No job description provided. Give general fit guidance and ask for missing role context where useful.',
    '',
    'Application notes:',
    applicationNotes || 'No application notes provided.',
    '',
    'Saved personal information, if available:',
    personalInfo || 'No saved personal information provided.',
    '',
    'CV or saved profile evidence:',
    cvText || 'The CV was uploaded as a document. Read the attached document content.',
  ].join('\n')
}

function buildExtractionPrompt({ cvText }) {
  return [
    'Extract structured candidate information from this CV.',
    '',
    'Rules:',
    '- Only extract information that is explicitly present in the CV.',
    '- Do not infer employers, grades, dates, locations, tools, languages, metrics, or achievements.',
    '- Use empty strings and empty arrays for missing information.',
    '- Preserve useful wording where it helps the user review the extracted profile.',
    '- Separate responsibilities, achievements, skills, education, projects, and contact details.',
    '- Put any important missing profile fields in missing_fields.',
    '- Keep extraction_notes short and practical.',
    '',
    'CV text pasted by user:',
    cvText || 'The CV was uploaded as a document. Read the attached document content.',
  ].join('\n')
}

function buildCoverLetterPrompt({ cvText, jobTitle, company, jobDescription, applicationNotes, personalInfo }) {
  const jobLine = [jobTitle, company].filter(Boolean).join(' at ')
  return [
    'Draft a tailored cover letter for a graduate or early-career skilled-role application.',
    '',
    'Rules:',
    '- Use only evidence from the CV, saved personal information, and job context.',
    '- Do not invent achievements, grades, employers, tools, languages, metrics, or motivations.',
    '- If useful information is missing, list it in missing_inputs instead of guessing.',
    '- Keep the tone professional, calm, direct, and specific.',
    '- Write for European graduate and early-career roles.',
    '- Make the letter easy to customize; avoid hype and guaranteed-outcome language.',
    '- Use a normal business-letter style without postal addresses unless provided.',
    '- Target roughly 300 to 450 words.',
    '',
    `Selected application: ${jobLine || 'Not specified'}`,
    '',
    'Job description or target-role context:',
    jobDescription || 'No detailed job description provided. Use the selected application title/company and call out missing role context.',
    '',
    'Application notes:',
    applicationNotes || 'No application notes provided.',
    '',
    'Saved personal information, if available:',
    personalInfo || 'No saved personal information provided.',
    '',
    'CV or saved profile evidence:',
    cvText || 'The CV was uploaded as a document. Read the attached document content.',
  ].join('\n')
}

function compactJobForRecommendation(job = {}) {
  return {
    id: toText(job.id),
    title: cleanText(job.title, 180),
    company: cleanText(job.company, 180),
    location: cleanText(job.location, 160),
    sector: cleanText(job.sector, 160),
    experience_level: cleanText(job.experience_level, 120),
    description: cleanText(job.description, 420),
  }
}

function compactProfileForRecommendation(profile = {}) {
  const skills = profile.skills && typeof profile.skills === 'object' ? profile.skills : {}
  return {
    candidate_name: toText(profile.candidate_name),
    headline: cleanText(profile.headline, 300),
    summary: cleanText(profile.summary, 1200),
    location: cleanText(profile.contact?.location, 160),
    education: asArray(profile.education).map(item => ({
      degree: cleanText(item?.degree, 160),
      field: cleanText(item?.field, 160),
      details: textArray(item?.details, 4),
    })).slice(0, 4),
    experience: asArray(profile.experience).map(item => ({
      role: cleanText(item?.role, 160),
      organization: cleanText(item?.organization, 160),
      achievements: textArray(item?.achievements, 5),
      skills_used: textArray(item?.skills_used, 8),
    })).slice(0, 6),
    projects: asArray(profile.projects).map(item => ({
      title: cleanText(item?.title, 160),
      description: cleanText(item?.description, 300),
      skills_used: textArray(item?.skills_used, 8),
    })).slice(0, 4),
    skills: {
      technical: textArray(skills.technical, 14),
      business: textArray(skills.business, 14),
      tools: textArray(skills.tools, 14),
      languages: textArray(skills.languages, 8),
      other: textArray(skills.other, 10),
    },
    evidence_points: asArray(profile.evidence_points).map(item => toText(item?.evidence || item)).filter(Boolean).slice(0, 8),
  }
}

function buildJobRecommendationPrompt({ personalInfo, jobs }) {
  const compactJobs = asArray(jobs)
    .map(compactJobForRecommendation)
    .filter(job => job.id && job.title)
    .slice(0, MAX_RECOMMENDATION_JOBS)

  return [
    'Recommend the best-fit jobs for this graduate or early-career candidate from the provided job list.',
    '',
    'Rules:',
    '- Recommend only jobs from the provided job list.',
    '- Use the exact job_id values from the job list.',
    '- Base reasoning only on saved personal information and the job title, sector, location, and description.',
    '- Do not invent candidate experience, skills, locations, languages, grades, or work authorization.',
    '- Prefer realistic early-career fit over prestige.',
    '- If a job is a stretch, explain the missing evidence clearly.',
    '- Return 3 to 5 recommendations.',
    '- Keep reasons short and practical.',
    '',
    'Saved personal information:',
    JSON.stringify(compactProfileForRecommendation(personalInfo || {}), null, 2).slice(0, 12000),
    '',
    'Available jobs:',
    JSON.stringify(compactJobs, null, 2),
  ].join('\n')
}

function extractTextBlock(block) {
  if (!block) return ''
  if (typeof block === 'string') return block
  if (typeof block.text === 'string') return block.text
  if (block.type === 'text' && typeof block.content === 'string') return block.content
  return ''
}

function extractOutputText(data) {
  if (typeof data?.output_text === 'string') return data.output_text
  if (typeof data?.outputText === 'string') return data.outputText

  if (Array.isArray(data?.steps)) {
    for (let i = data.steps.length - 1; i >= 0; i -= 1) {
      const step = data.steps[i]
      if (Array.isArray(step?.content)) {
        const text = step.content.map(extractTextBlock).filter(Boolean).join('\n')
        if (text) return text
      }
      const direct = extractTextBlock(step?.content)
      if (direct) return direct
    }
  }

  return ''
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function textArray(value, limit = 12) {
  return asArray(value).map(toText).filter(Boolean).slice(0, limit)
}

function clampScore(value) {
  const score = Number(value)
  if (!Number.isFinite(score)) return 0
  return Math.max(0, Math.min(100, Math.round(score)))
}

function buildPersonalInformationText(value) {
  if (!value) return ''

  let profile = value
  if (typeof value === 'string') {
    try {
      profile = JSON.parse(value)
    } catch {
      return cleanText(value, 12000)
    }
  }

  if (!profile || typeof profile !== 'object') return ''

  const compact = compactProfileForRecommendation(profile)
  const hasContent = Boolean(
    compact.candidate_name ||
    compact.headline ||
    compact.summary ||
    compact.location ||
    compact.education.length ||
    compact.experience.length ||
    compact.projects.length ||
    Object.values(compact.skills || {}).some(items => asArray(items).length) ||
    compact.evidence_points.length,
  )

  if (!hasContent) return ''
  return [
    'Saved Personal Information extracted from the user CV. Treat this as reusable CV evidence.',
    JSON.stringify(compact, null, 2),
  ].join('\n')
}

function buildCvDocumentInput(payload = {}, missingMessage, options = {}) {
  const cvText = cleanText(payload.cv_text, MAX_CV_TEXT_CHARS)
  const cvFile = payload.cv_file && typeof payload.cv_file === 'object' ? payload.cv_file : null
  const personalInfoText = options.allowPersonalInformation
    ? buildPersonalInformationText(payload.personal_information)
    : ''
  const input = []

  if (cvFile?.data) {
    const mimeType = normalizeMimeType(cvFile.mime_type, cvFile.name)
    if (!DOCUMENT_MIME_TYPES.has(mimeType)) {
      const err = new Error('Unsupported CV file type. Upload a PDF, DOC, DOCX, TXT, or MD file.')
      err.status = 400
      throw err
    }

    if (estimateBase64Bytes(cvFile.data) > MAX_FILE_BYTES) {
      const err = new Error('CV file is too large. Upload a file under 5 MB.')
      err.status = 400
      throw err
    }

    input.push({
      type: 'document',
      data: normalizeBase64(cvFile.data),
      mime_type: mimeType,
    })
  }

  if (!cvText && input.length === 0 && personalInfoText) {
    return { cvText: personalInfoText, input, usedPersonalInformation: true }
  }

  if (!cvText && input.length === 0) {
    const err = new Error(missingMessage)
    err.status = 400
    throw err
  }

  return { cvText, input, usedPersonalInformation: false }
}

function normalizeReview(review) {
  return {
    summary: String(review.summary || '').trim(),
    fit_score: clampScore(review.fit_score),
    recommendation: ['strong_match', 'possible_match', 'weak_match'].includes(review.recommendation)
      ? review.recommendation
      : 'possible_match',
    role_focus: String(review.role_focus || '').trim(),
    top_strengths: asArray(review.top_strengths).slice(0, 5),
    evidence_gaps: asArray(review.evidence_gaps).slice(0, 6),
    bullet_rewrites: asArray(review.bullet_rewrites).slice(0, 6),
    keyword_suggestions: asArray(review.keyword_suggestions).slice(0, 8),
    risks: asArray(review.risks).slice(0, 5),
    next_steps: asArray(review.next_steps).slice(0, 5),
    cover_letter_angles: asArray(review.cover_letter_angles).slice(0, 4),
  }
}

function normalizeEducation(item = {}) {
  return {
    institution: toText(item.institution),
    degree: toText(item.degree),
    field: toText(item.field),
    location: toText(item.location),
    start_date: toText(item.start_date),
    end_date: toText(item.end_date),
    details: textArray(item.details, 5),
  }
}

function normalizeExperience(item = {}) {
  return {
    organization: toText(item.organization),
    role: toText(item.role),
    location: toText(item.location),
    start_date: toText(item.start_date),
    end_date: toText(item.end_date),
    achievements: textArray(item.achievements, 8),
    skills_used: textArray(item.skills_used, 12),
  }
}

function normalizeProject(item = {}) {
  return {
    title: toText(item.title),
    context: toText(item.context),
    description: toText(item.description),
    outcomes: textArray(item.outcomes, 6),
    skills_used: textArray(item.skills_used, 12),
  }
}

function normalizeProfile(profile = {}) {
  const contact = profile.contact && typeof profile.contact === 'object' ? profile.contact : {}
  const skills = profile.skills && typeof profile.skills === 'object' ? profile.skills : {}

  return {
    candidate_name: toText(profile.candidate_name),
    headline: toText(profile.headline),
    summary: toText(profile.summary),
    contact: {
      email: toText(contact.email),
      phone: toText(contact.phone),
      location: toText(contact.location),
      linkedin: toText(contact.linkedin),
      portfolio: toText(contact.portfolio),
    },
    education: asArray(profile.education).map(normalizeEducation).slice(0, 8),
    experience: asArray(profile.experience).map(normalizeExperience).slice(0, 10),
    projects: asArray(profile.projects).map(normalizeProject).slice(0, 8),
    skills: {
      technical: textArray(skills.technical, 20),
      business: textArray(skills.business, 20),
      tools: textArray(skills.tools, 20),
      languages: textArray(skills.languages, 20),
      other: textArray(skills.other, 20),
    },
    certifications: asArray(profile.certifications).map(item => ({
      name: toText(item?.name),
      issuer: toText(item?.issuer),
      date: toText(item?.date),
    })).slice(0, 10),
    evidence_points: asArray(profile.evidence_points).map(item => ({
      evidence: toText(item?.evidence),
      category: toText(item?.category),
      source_section: toText(item?.source_section),
    })).slice(0, 12),
    missing_fields: textArray(profile.missing_fields, 12),
    extraction_notes: textArray(profile.extraction_notes, 8),
  }
}

function normalizeCoverLetter(letter = {}) {
  return {
    title: toText(letter.title) || 'Tailored cover letter draft',
    opening_strategy: toText(letter.opening_strategy),
    cover_letter: toText(letter.cover_letter),
    evidence_used: asArray(letter.evidence_used).map(item => ({
      claim: toText(item?.claim),
      cv_evidence: toText(item?.cv_evidence),
      why_it_matters: toText(item?.why_it_matters),
    })).slice(0, 8),
    personalization_notes: textArray(letter.personalization_notes, 8),
    missing_inputs: textArray(letter.missing_inputs, 8),
    editing_checklist: textArray(letter.editing_checklist, 8),
  }
}

function normalizeJobRecommendations(result = {}, allowedJobIds = new Set()) {
  return {
    recommendations: asArray(result.recommendations)
      .map(item => ({
        job_id: toText(item?.job_id),
        fit_score: clampScore(item?.fit_score),
        fit_label: ['strong_fit', 'potential_fit', 'stretch'].includes(item?.fit_label)
          ? item.fit_label
          : 'potential_fit',
        reason: toText(item?.reason),
        matching_evidence: textArray(item?.matching_evidence, 4),
        concerns: textArray(item?.concerns, 3),
        next_step: toText(item?.next_step),
      }))
      .filter(item => item.job_id && allowedJobIds.has(item.job_id))
      .slice(0, 5),
  }
}

const LOCAL_MATCH_STOPWORDS = new Set([
  'and', 'the', 'for', 'with', 'from', 'that', 'this', 'your', 'you', 'are', 'our', 'will',
  'into', 'about', 'their', 'have', 'has', 'was', 'were', 'been', 'role', 'work', 'job',
  'jobs', 'team', 'teams', 'using', 'use', 'used', 'within', 'across', 'based', 'help',
  'helps', 'apply', 'application', 'applications', 'candidate', 'graduate', 'student',
])

function tokenizeForLocalMatch(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length >= 3 && !LOCAL_MATCH_STOPWORDS.has(token))
}

function collectProfileText(profile = {}) {
  const compact = compactProfileForRecommendation(profile)
  return [
    compact.headline,
    compact.summary,
    compact.location,
    ...asArray(compact.education).flatMap(item => [item.degree, item.field, ...asArray(item.details)]),
    ...asArray(compact.experience).flatMap(item => [item.role, item.organization, ...asArray(item.achievements), ...asArray(item.skills_used)]),
    ...asArray(compact.projects).flatMap(item => [item.title, item.description, ...asArray(item.skills_used)]),
    ...Object.values(compact.skills || {}).flatMap(asArray),
    ...asArray(compact.evidence_points),
  ].filter(Boolean).join(' ')
}

function topMatchedTerms(profileTerms, text, limit = 5) {
  const seen = new Set(tokenizeForLocalMatch(text))
  return [...profileTerms]
    .filter(term => seen.has(term))
    .slice(0, limit)
}

function buildLocalJobRecommendations(personalInfo, jobs, reason = '') {
  const profileText = collectProfileText(personalInfo)
  const profileTerms = new Set(tokenizeForLocalMatch(profileText).slice(0, 160))
  const hasProfileTerms = profileTerms.size > 0

  const scored = jobs.map(job => {
    const title = cleanText(job.title, 180)
    const jobText = [
      title,
      job.company,
      job.location,
      job.sector,
      job.experience_level,
      job.description,
    ].filter(Boolean).join(' ')
    const titleTerms = topMatchedTerms(profileTerms, `${title} ${job.sector || ''}`, 8)
    const bodyTerms = topMatchedTerms(profileTerms, jobText, 12)
    const uniqueMatches = [...new Set([...titleTerms, ...bodyTerms])]
    const loweredTitle = title.toLowerCase()
    const earlyCareerBonus = /\b(graduate|intern|internship|junior|trainee|entry|analyst|associate|assistant|coordinator)\b/.test(loweredTitle) ? 12 : 0
    const seniorPenalty = /\b(senior|director|head|lead|principal|manager)\b/.test(loweredTitle) ? 16 : 0
    const descriptionBonus = job.description ? 4 : 0
    const matchScore = Math.min(34, titleTerms.length * 7 + bodyTerms.length * 3)
    const score = Math.max(45, Math.min(94, 52 + matchScore + earlyCareerBonus + descriptionBonus - seniorPenalty))

    return {
      job,
      score,
      matches: uniqueMatches,
      earlyCareerBonus,
      seniorPenalty,
    }
  })

  return {
    recommendations: scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ job, score, matches, seniorPenalty }) => {
        const readableMatches = matches.slice(0, 4).map(term => term.replace(/[-_]/g, ' '))
        const fitLabel = score >= 80 ? 'strong_fit' : score >= 64 ? 'potential_fit' : 'stretch'
        const reasonText = readableMatches.length
          ? `Matches your saved profile through ${readableMatches.join(', ')}.`
          : hasProfileTerms
            ? 'Looks relevant to your saved profile and early-career search based on the role title and sector.'
            : 'Looks relevant to an early-career job search based on the role title and sector.'

        return {
          job_id: toText(job.id),
          fit_score: score,
          fit_label: fitLabel,
          reason: reasonText,
          matching_evidence: readableMatches.length
            ? readableMatches.map(term => `Saved profile includes evidence related to ${term}.`)
            : ['Saved profile exists, but ApplyWise could not identify many exact keyword overlaps.'],
          concerns: [
            seniorPenalty ? 'The title may imply more experience than a graduate role.' : '',
            job.description ? '' : 'The job description is short, so check the original posting before applying.',
          ].filter(Boolean),
          next_step: 'Open the job details and save it if the responsibilities match your target role.',
        }
      }),
    model: 'applywise-local-fit-matcher',
    interaction_id: null,
    ai_unavailable: true,
    warning: reason
      ? `Gemini job matching failed, so ApplyWise used local profile matching instead. Reason: ${cleanText(reason, 160)}`
      : 'Gemini job matching failed, so ApplyWise used local profile matching instead.',
  }
}

function parseJsonFromText(text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) return null

  const candidates = [trimmed]
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) candidates.push(fenced[1].trim())

  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1))
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch {
      // Try the next candidate shape.
    }
  }
  return null
}

async function readGeminiJsonResponse(response, emptyMessage) {
  const rawText = await response.text()
  let data = null
  try {
    data = rawText ? JSON.parse(rawText) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    const detail = data?.error?.message || rawText || `Gemini request failed with status ${response.status}`
    const err = new Error(detail)
    err.status = response.status
    throw err
  }

  const outputText = extractOutputText(data)
  if (!outputText) {
    const err = new Error(emptyMessage)
    err.status = 502
    throw err
  }

  const parsed = parseJsonFromText(outputText)
  if (!parsed) {
    const err = new Error('Gemini returned a response that could not be parsed as JSON.')
    err.status = 502
    throw err
  }

  return { parsed, data }
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY)
}

export async function reviewCvWithGemini(payload = {}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const err = new Error('Gemini API key is not configured on the server.')
    err.status = 503
    throw err
  }

  const { cvText, input } = buildCvDocumentInput(
    payload,
    'Upload or paste a CV, or extract and save Personal Information before requesting a review.',
    { allowPersonalInformation: true },
  )
  const jobTitle = cleanText(payload.job_title, 200)
  const company = cleanText(payload.company, 200)
  const jobDescription = cleanText(payload.job_description, MAX_JOB_TEXT_CHARS)
  const applicationNotes = cleanText(payload.application_notes, 4000)
  const personalInfo = buildPersonalInformationText(payload.personal_information)

  input.push({
    type: 'text',
    text: buildPrompt({ cvText, jobTitle, company, jobDescription, applicationNotes, personalInfo }),
  })

  const response = await fetch(GEMINI_INTERACTIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      system_instruction: 'You are ApplyWise, a private CV review coach for graduates applying to skilled roles. Give truthful, user-approved CV improvement suggestions. Never fabricate experience.',
      input,
      generation_config: {
        temperature: 0.2,
        thinking_level: 'low',
      },
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: cvReviewSchema,
      },
    }),
  })

  const { parsed: review, data } = await readGeminiJsonResponse(response, 'Gemini returned no review text.')

  return {
    ...normalizeReview(review),
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    interaction_id: data?.id || null,
  }
}

export async function extractCvProfileWithGemini(payload = {}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const err = new Error('Gemini API key is not configured on the server.')
    err.status = 503
    throw err
  }

  const { cvText, input } = buildCvDocumentInput(
    payload,
    'Add CV text or upload a CV file before extracting profile information.',
  )

  input.push({
    type: 'text',
    text: buildExtractionPrompt({ cvText }),
  })

  const response = await fetch(GEMINI_INTERACTIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      system_instruction: 'You are ApplyWise, a private CV information extractor. Extract only confirmed candidate information from CVs. Never fabricate experience or personal details.',
      input,
      generation_config: {
        temperature: 0.1,
        thinking_level: 'low',
      },
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: cvProfileSchema,
      },
    }),
  })

  const { parsed: profile, data } = await readGeminiJsonResponse(response, 'Gemini returned no CV extraction text.')

  return {
    ...normalizeProfile(profile),
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    interaction_id: data?.id || null,
  }
}

export async function generateCoverLetterWithGemini(payload = {}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const err = new Error('Gemini API key is not configured on the server.')
    err.status = 503
    throw err
  }

  const { cvText, input } = buildCvDocumentInput(
    payload,
    'Upload or paste a CV, or extract and save Personal Information before generating a cover letter.',
    { allowPersonalInformation: true },
  )
  const jobTitle = cleanText(payload.job_title, 200)
  const company = cleanText(payload.company, 200)
  const jobDescription = cleanText(payload.job_description, MAX_JOB_TEXT_CHARS)
  const applicationNotes = cleanText(payload.application_notes, 4000)
  const personalInfo = buildPersonalInformationText(payload.personal_information)

  if (!jobDescription && !jobTitle && !company) {
    const err = new Error('Add a job description or select an application before generating a cover letter.')
    err.status = 400
    throw err
  }

  input.push({
    type: 'text',
    text: buildCoverLetterPrompt({
      cvText,
      jobTitle,
      company,
      jobDescription,
      applicationNotes,
      personalInfo,
    }),
  })

  const response = await fetch(GEMINI_INTERACTIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      system_instruction: 'You are ApplyWise, a private application-writing coach. Draft truthful, role-specific cover letters from provided evidence only. Never fabricate candidate experience.',
      input,
      generation_config: {
        temperature: 0.35,
        thinking_level: 'low',
      },
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: coverLetterSchema,
      },
    }),
  })

  const { parsed: letter, data } = await readGeminiJsonResponse(response, 'Gemini returned no cover letter text.')

  return {
    ...normalizeCoverLetter(letter),
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    interaction_id: data?.id || null,
  }
}

export async function recommendJobsWithGemini(payload = {}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const err = new Error('Gemini API key is not configured on the server.')
    err.status = 503
    throw err
  }

  let personalInfo = payload.personal_information || payload.profile || null
  if (typeof personalInfo === 'string') {
    try {
      personalInfo = JSON.parse(personalInfo)
    } catch {
      const err = new Error('Saved personal information could not be read.')
      err.status = 400
      throw err
    }
  }

  const jobs = asArray(payload.jobs)
    .map(compactJobForRecommendation)
    .filter(job => job.id && job.title)
    .slice(0, MAX_RECOMMENDATION_JOBS)

  if (!personalInfo || typeof personalInfo !== 'object') {
    const err = new Error('Extract and save Personal Information before requesting job recommendations.')
    err.status = 400
    throw err
  }

  if (jobs.length === 0) {
    const err = new Error('No jobs were available to recommend from.')
    err.status = 400
    throw err
  }

  try {
    const response = await fetch(GEMINI_INTERACTIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
        system_instruction: 'You are ApplyWise, a private job-fit recommender for graduates. Recommend roles from the provided list using only confirmed candidate information. Never fabricate fit evidence.',
        input: [{
          type: 'text',
          text: buildJobRecommendationPrompt({ personalInfo, jobs }),
        }],
        generation_config: {
          temperature: 0.2,
          thinking_level: 'low',
        },
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: jobRecommendationSchema,
        },
      }),
    })

    const { parsed, data } = await readGeminiJsonResponse(response, 'Gemini returned no job recommendations.')
    const allowedJobIds = new Set(jobs.map(job => job.id))
    const normalized = normalizeJobRecommendations(parsed, allowedJobIds)

    if (normalized.recommendations.length === 0) {
      return buildLocalJobRecommendations(personalInfo, jobs, 'Gemini did not return matching job IDs.')
    }

    return {
      ...normalized,
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      interaction_id: data?.id || null,
    }
  } catch (error) {
    console.error('[gemini] Job recommendations failed:', error.message)
    return buildLocalJobRecommendations(personalInfo, jobs, error.message)
  }
}
