const GEMINI_INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions'
const DEFAULT_MODEL = 'gemini-3.5-flash'
const MAX_CV_TEXT_CHARS = 45000
const MAX_JOB_TEXT_CHARS = 18000
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

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return ''
  return value.replace(/\r\n/g, '\n').trim().slice(0, maxLength)
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

function buildPrompt({ cvText, jobTitle, company, jobDescription, applicationNotes }) {
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
    'CV text pasted by user:',
    cvText || 'The CV was uploaded as a document. Read the attached document content.',
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

function clampScore(value) {
  const score = Number(value)
  if (!Number.isFinite(score)) return 0
  return Math.max(0, Math.min(100, Math.round(score)))
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

  const cvText = cleanText(payload.cv_text, MAX_CV_TEXT_CHARS)
  const jobTitle = cleanText(payload.job_title, 200)
  const company = cleanText(payload.company, 200)
  const jobDescription = cleanText(payload.job_description, MAX_JOB_TEXT_CHARS)
  const applicationNotes = cleanText(payload.application_notes, 4000)
  const cvFile = payload.cv_file && typeof payload.cv_file === 'object' ? payload.cv_file : null

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

  if (!cvText && input.length === 0) {
    const err = new Error('Add CV text or upload a CV file before requesting a review.')
    err.status = 400
    throw err
  }

  input.push({
    type: 'text',
    text: buildPrompt({ cvText, jobTitle, company, jobDescription, applicationNotes }),
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
    const err = new Error('Gemini returned no review text.')
    err.status = 502
    throw err
  }

  let review
  try {
    review = JSON.parse(outputText)
  } catch {
    const err = new Error('Gemini returned a response that could not be parsed as JSON.')
    err.status = 502
    throw err
  }

  return {
    ...normalizeReview(review),
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    interaction_id: data?.id || null,
  }
}
