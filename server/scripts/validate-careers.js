// Run with: node server/scripts/validate-careers.js
import { initDb, getDb } from '../db/database.js'

// Inline minimal careers map for validation (mirrors client/src/lib/careers.js)
const CAREERS_MAP = [
  { keys: ['goldman sachs'],       searchUrl: 'https://higher.gs.com/roles/?q={query}' },
  { keys: ['jpmorgan', 'jp morgan', 'j.p. morgan', 'jpmorgan chase'], searchUrl: 'https://careers.jpmorgan.com/global/en/search-jobs?q={query}' },
  { keys: ['morgan stanley'],      careersUrl: 'https://www.morganstanley.com/people/careers' },
  { keys: ['bank of america', 'merrill lynch', 'bofa'], searchUrl: 'https://careers.bankofamerica.com/en-us/search-jobs?q={query}' },
  { keys: ['citigroup', 'citibank', 'citi'], searchUrl: 'https://jobs.citi.com/search-jobs?keyword={query}' },
  { keys: ['barclays'],            searchUrl: 'https://search.jobs.barclays/?q={query}' },
  { keys: ['hsbc'],                searchUrl: 'https://www.hsbc.com/careers/jobs-and-internships/job-search?keywords={query}' },
  { keys: ['deutsche bank'],       careersUrl: 'https://careers.db.com/' },
  { keys: ['ubs'],                 searchUrl: 'https://jobs.ubs.com/TGWebHost/searchjobs.aspx?q={query}' },
  { keys: ['bnp paribas'],         careersUrl: 'https://group.bnpparibas/en/careers' },
  { keys: ['rothschild'],          searchUrl: 'https://careers.rothschildandco.com/search/?q={query}' },
  { keys: ['lazard'],              searchUrl: 'https://careers.lazard.com/search/?q={query}' },
  { keys: ['blackrock'],           searchUrl: 'https://careers.blackrock.com/job-search-results/?keyword={query}' },
  { keys: ['kkr'],                 searchUrl: 'https://kkr.wd3.myworkdayjobs.com/KKR/jobs?q={query}' },
  { keys: ['blackstone'],          careersUrl: 'https://www.blackstone.com/careers/' },
  { keys: ['amundi'],              searchUrl: 'https://careers.amundi.com/jobs?query={query}' },
  { keys: ['schroders'],           searchUrl: 'https://careers.schroders.com/en/search/?q={query}' },
  { keys: ['deloitte'],            searchUrl: 'https://apply.deloitte.com/careers/SearchJobs/{query}' },
  { keys: ['ernst & young', 'ernst and young'], searchUrl: 'https://careers.ey.com/ey/search/?q={query}&orgIds=1' },
  { keys: ['kpmg'],                careersUrl: 'https://home.kpmg/xx/en/home/careers.html' },
  { keys: ['mckinsey'],            searchUrl: 'https://www.mckinsey.com/careers/search-jobs?q={query}' },
  { keys: ['revolut'],             searchUrl: 'https://www.revolut.com/careers/all-jobs?search={query}' },
  { keys: ['bending spoons'],      careersUrl: 'https://jobs.bendingspoons.com/' },
]

function normalizeCompany(c) {
  return (c || '').toLowerCase().replace(/\./g, '').replace(/\s*&\s*/g, ' and ').replace(/\s+/g, ' ').trim()
}

function findEntry(company) {
  const norm = normalizeCompany(company)
  for (const entry of CAREERS_MAP) {
    for (const key of entry.keys) {
      if (key.length <= 3) {
        if (new RegExp(`(?:^|\\s)${key}(?:\\s|$)`).test(norm)) return entry
      } else if (norm.includes(key)) {
        return entry
      }
    }
  }
  return null
}

function buildDirectUrl(company, title) {
  const entry = findEntry(company)
  const query = encodeURIComponent(title || '')
  if (entry) {
    if (entry.searchUrl) return entry.searchUrl.replace('{query}', query)
    return entry.careersUrl
  }
  return `https://www.google.com/search?q=${encodeURIComponent('"' + (company || '') + '" careers "' + (title || '') + '"')}`
}

async function checkUrl(url, timeoutMs = 6000) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const resp = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CareerValidator/1.0)' },
    })
    clearTimeout(timer)
    return { ok: resp.status < 400, status: resp.status, finalUrl: resp.url }
  } catch (err) {
    return { ok: false, status: null, finalUrl: url, error: err.message }
  }
}

async function main() {
  initDb()
  const db = getDb()

  const jobs = db.prepare(`
    SELECT id, title, company, url, experience_level
    FROM jobs
    ORDER BY RANDOM()
    LIMIT 20
  `).all()

  console.log(`\nValidating direct-apply URLs for ${jobs.length} jobs...\n`)
  console.log('─'.repeat(100))

  let knownCount = 0
  let okCount = 0

  for (const job of jobs) {
    const directUrl = buildDirectUrl(job.company, job.title)
    const isKnown = !directUrl.includes('google.com')
    const { ok, status, finalUrl, error } = await checkUrl(directUrl)

    if (isKnown) knownCount++
    if (ok) okCount++

    const statusIcon  = ok ? '✓' : '✗'
    const portalIcon  = isKnown ? '[PORTAL]' : '[GOOGLE]'
    const statusStr   = status ? `HTTP ${status}` : `ERR: ${error}`
    const company     = (job.company || '').padEnd(22).slice(0, 22)
    const title       = (job.title || '').padEnd(35).slice(0, 35)
    const level       = (job.experience_level || '—').padEnd(12)

    console.log(`${statusIcon} ${portalIcon} ${company} | ${title} | ${level} | ${statusStr}`)
    if (finalUrl !== directUrl) console.log(`  → ${finalUrl}`)
  }

  console.log('─'.repeat(100))
  console.log(`\nResults: ${okCount}/${jobs.length} URLs resolved OK | ${knownCount}/${jobs.length} routed to known portals\n`)
}

main().catch(console.error)
