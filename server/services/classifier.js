const EXCLUDE_TITLE_RE = [
  /\bsenior\b/i,
  /\bsr\.?\b/i,
  /\blead\b/i,
  /\bmanager\b/i,
  /\bdirector\b/i,
  /\bhead\b/i,
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

const EXCLUDE_DOMAIN_RE = [
  /\basbestos\b/i,
  /\babogado\b/i,
  /\babogada\b/i,
  /\blawyer\b/i,
  /\bsolicitor\b/i,
  /\blegal counsel\b/i,
  /\bnurse\b/i,
  /\bcare assistant\b/i,
  /\boss\s*\(m\/f\)/i,
  /\boperatore socio sanitario\b/i,
  /\bsocio sanitario\b/i,
  /\bwarehouse\b/i,
  /\bforklift\b/i,
  /\bdriver\b/i,
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
    grandCategory: 'Business Role', subType: 'Consultant',
    kws: ['consultant', 'consulting'],
  },
  {
    grandCategory: 'Business Role', subType: 'Specialist',
    kws: ['specialist'],
  },
  {
    grandCategory: 'Business Role', subType: 'Officer',
    kws: ['officer'],
  },
  {
    grandCategory: 'Business Role', subType: 'Coordinator',
    kws: ['coordinator'],
  },
  {
    grandCategory: 'Business Role', subType: 'Executive',
    kws: ['executive'],
  },
  {
    grandCategory: 'Business Role', subType: 'Product',
    kws: ['product'],
  },
  {
    grandCategory: 'Business Role', subType: 'Operations',
    kws: ['operations', 'operation'],
  },
]

export function isExcluded(title = '', description = '') {
  const t = title.toLowerCase()
  for (const re of EXCLUDE_TITLE_RE) {
    if (re.test(t)) return true
  }
  for (const re of EXCLUDE_DOMAIN_RE) {
    if (re.test(t)) return true
  }
  const snippet = `${title} ${(description || '').slice(0, 1500)}`
  for (const re of EXCLUDE_DOMAIN_RE) {
    if (re.test(snippet)) return true
  }
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

export function inferSector(title = '', description = '') {
  const t = title.toLowerCase()
  const text = `${title} ${description}`.toLowerCase()

  if (t.includes('financial advisory') || t.includes('financial advis')) return 'Financial Advisory'
  if (t.includes('investment bank') || t.includes('ib analyst') || t.includes('capital markets')) return 'Investment Banking'
  if (text.includes('m&a') || text.includes('merger') || text.includes('acquisition')) return 'M&A'
  if (text.includes('private equity') || text.includes('buyout')) return 'Private Equity'
  if (text.includes('venture capital') || /\bvc\b/.test(text)) return 'Venture Capital'
  if (text.includes('quant') || text.includes('quantitative')) return 'Quantitative Analysis'
  if (text.includes('sales') && (text.includes('trading') || text.includes('trader'))) return 'Sales & Trading'
  if ((text.includes('equity') || text.includes('equities')) && text.includes('research')) return 'Equity Research'
  if (text.includes('equity research') || text.includes('research analyst')) return 'Equity Research'
  if (text.includes('wealth') || text.includes('private client') || text.includes('private wealth')) return 'Wealth Management'
  if (text.includes('private bank')) return 'Private Banking'
  if (text.includes('asset manag') || text.includes('fund manag') || text.includes('portfolio')) return 'Asset Management'
  if (text.includes('commercial bank') || text.includes('corporate bank') || text.includes('retail bank')) return 'Commercial Banking'
  if (text.includes('risk') && text.includes('analyst')) return 'Risk Management'
  if (text.includes('compliance') || text.includes('regulatory') || text.includes('kyc') || text.includes('aml')) return 'Compliance & Regulatory'
  if (text.includes('treasury')) return 'Treasury'
  if (text.includes('fintech') || text.includes('financial technology') || text.includes('payments')) return 'Financial Technology (FinTech)'
  if (text.includes('corporate finance') || text.includes('corp fin') || text.includes('fp&a') || text.includes('financial analyst')) return 'Corporate Finance'
  if (text.includes('broker') || text.includes('brokerage') || text.includes('market mak')) return 'Brokerage & Market Making'
  if (text.includes('financial advisory') || text.includes('financial advis')) return 'Financial Advisory'

  if (text.includes('strategy') || text.includes('strategic')) return 'Strategy & Consulting'
  if (text.includes('consultant') || text.includes('consulting') || text.includes('advisory')) return 'Strategy & Consulting'
  if (text.includes('business analyst') || text.includes('business analysis') || text.includes('business analist')) return 'Business Analysis'
  if (text.includes('data analyst') || text.includes('analytics') || text.includes('insights')) return 'Data & Analytics'
  if (text.includes('human resources') || text.includes('hr ') || text.includes('talent acquisition') || text.includes('people operations')) return 'Human Resources'
  if (text.includes('operations') || text.includes('operational excellence') || text.includes('process improvement')) return 'Operations'
  if (text.includes('project') || text.includes('programme') || text.includes('program coordinator')) return 'Project Management'
  if (text.includes('product')) return 'Product Management'
  if (text.includes('marketing') || text.includes('brand') || text.includes('growth marketing') || text.includes('crm')) return 'Marketing'
  if (text.includes('sales') || text.includes('account executive') || text.includes('business development') || text.includes('commercial')) return 'Sales & Business Development'
  if (text.includes('supply chain') || text.includes('logistics') || text.includes('procurement')) return 'Supply Chain'
  if (text.includes('customer success') || text.includes('client success')) return 'Customer Success'

  return 'Business & Strategy'
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
  if (grandCategory === 'Business Role')    return 'Entry Level'

  // Description-based signals for titles that didn't match above
  if (/\b(recent\s*grad|new\s*grad|fresh\s*grad|entry[\s\-]?level|no\s*(prior\s*)?experience|0[\s\-]?–1?\s*[12]\s*years?|spring\s*week|summer\s*(analyst|associate)|campus\s*hire|early\s*career|newly\s*qualified)\b/.test(d)) {
    return 'Entry Level'
  }

  if (grandCategory === 'Entry-Level') return 'Entry Level'

  if (/\b[2-5]\+?\s*years?\s*(of\s*)?experience\b/.test(d)) return 'Mid Level'

  return null
}
