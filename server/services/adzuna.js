import axios from 'axios'
import { getDb } from '../db/database.js'
import { isExcluded, classifyJob, inferExperienceLevel, inferSector } from './classifier.js'

// Note: Adzuna uses 'es' for Spain — 'gb' would search UK only.
const SEARCHES = [
  { country: 'gb', where: 'london',    label: 'London, UK' },
  { country: 'es', where: 'madrid',    label: 'Madrid, Spain' },
  { country: 'it', where: 'milan',     label: 'Milan, Italy' },
  { country: 'us', where: 'new york',  label: 'New York, US' },
  { country: 'nl', where: 'amsterdam', label: 'Amsterdam, Netherlands' },
]

const JOB_QUERIES = [
  'graduate business analyst',
  'junior business analyst',
  'graduate consultant',
  'junior consultant',
  'strategy analyst',
  'business strategy graduate',
  'commercial graduate',
  'management trainee',
  'operations graduate',
  'operations analyst',
  'project coordinator',
  'product analyst',
  'associate product manager',
  'marketing graduate',
  'marketing coordinator',
  'growth analyst',
  'sales graduate',
  'business development representative',
  'account executive graduate',
  'customer success associate',
  'supply chain graduate',
  'procurement analyst',
  'human resources graduate',
  'talent acquisition coordinator',
  'data analyst graduate',
  'graduate finance',
  'graduate analyst',
  'investment banking',
  'asset management',
  'wealth management',
  'M&A',
  'private equity',
  'venture capital',
  'sales trading',
  'equity research',
  'risk analyst',
  'quantitative analyst',
  'financial advisor',
  'corporate finance',
  'treasury analyst',
  'compliance analyst',
  'fintech analyst',
  'junior broker',
]

function currencyFor(country) {
  if (country === 'gb') return 'GBP'
  if (country === 'us') return 'USD'
  return 'EUR'
}

function isAdzunaHost(urlStr) {
  try { return /adzuna\./i.test(new URL(urlStr).hostname) } catch { return false }
}

// Try to extract the destination URL from an Adzuna redirect URL's query params.
// Adzuna sometimes encodes the destination as a query parameter (no HTTP request needed).
function extractUrlFromQueryParams(redirectUrl) {
  try {
    const url = new URL(redirectUrl)
    for (const name of ['apply_url', 'redirect_url', 'destination', 'redirect', 'goto', 'url', 'target', 'external_url', 'externalUrl']) {
      const val = url.searchParams.get(name)
      if (val) {
        try {
          const decoded = decodeURIComponent(val)
          if (decoded.startsWith('http') && !isAdzunaHost(decoded)) return decoded
        } catch {}
      }
    }
  } catch {}
  return null
}

// Extract the actual job destination from an Adzuna HTML page.
function extractDestFromHtml(html, baseUrl) {
  // 1. JSON-LD structured data (most reliable)
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const raw = JSON.parse(m[1])
      const candidates = Array.isArray(raw) ? raw : [raw]
      for (const d of candidates) {
        for (const key of ['url', 'sameAs', 'mainEntityOfPage']) {
          const u = d[key]
          if (u && typeof u === 'string' && !isAdzunaHost(u) && u.startsWith('http')) return u
        }
        if (d.mainEntity) {
          for (const key of ['url', 'sameAs']) {
            const u = d.mainEntity[key]
            if (u && typeof u === 'string' && !isAdzunaHost(u) && u.startsWith('http')) return u
          }
        }
      }
    } catch {}
  }

  // 2. meta http-equiv="refresh"
  const meta = html.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["'][^"']*?url=([^"'\s>]+)/i)
    || html.match(/<meta[^>]+content=["'][^"']*?url=([^"'\s>]+)[^>]+http-equiv=["']?refresh/i)
  if (meta) {
    try {
      const u = new URL(decodeURIComponent(meta[1].replace(/["'>].*$/, '')), baseUrl).href
      if (!isAdzunaHost(u)) return u
    } catch {}
  }

  // 3. JS redirect patterns
  const jsPatterns = [
    /window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/gi,
    /window\.location\.replace\s*\(\s*["']([^"']+)["']\s*\)/gi,
    /location\.href\s*=\s*["']([^"']+)["']/gi,
    /location\.replace\s*\(\s*["']([^"']+)["']\s*\)/gi,
  ]
  for (const pat of jsPatterns) {
    for (const m of html.matchAll(pat)) {
      try {
        const u = new URL(m[1], baseUrl).href
        if (!isAdzunaHost(u)) return u
      } catch {}
    }
  }

  // 4. Apply/external links: prefer rel="nofollow" hrefs (Adzuna marks the outbound apply link this way)
  for (const m of html.matchAll(/href=["'](https?:\/\/[^"']+)["'][^>]*rel=["'][^"']*nofollow[^"']*["']/gi)) {
    if (!isAdzunaHost(m[1])) return m[1]
  }
  for (const m of html.matchAll(/rel=["'][^"']*nofollow[^"']*["'][^>]*href=["'](https?:\/\/[^"']+)["']/gi)) {
    if (!isAdzunaHost(m[1])) return m[1]
  }

  // 5. Fallback: first non-Adzuna href that isn't a common CDN/tracking/social domain
  const noiseDomains = /^https?:\/\/(www\.)?(google|facebook|twitter|linkedin|cloudflare|jquery|bootstrap|fontawesome|gravatar|doubleclick|googletagmanager|analytics)\./i
  for (const m of html.matchAll(/href=["'](https?:\/\/[^"']+)["'][^>]*>/gi)) {
    const u = m[1]
    if (!isAdzunaHost(u) && !noiseDomains.test(u)) return u
  }

  return null
}

// Follow an Adzuna redirect URL and return the final destination.
// Falls back to HTML parsing when HTTP redirect stays on Adzuna.
async function resolveUrl(redirectUrl, timeoutMs = 8000) {
  if (!redirectUrl) return redirectUrl

  // Fast path: destination may be encoded in the redirect URL's query params
  const fromParams = extractUrlFromQueryParams(redirectUrl)
  if (fromParams) return fromParams

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const resp = await fetch(redirectUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    clearTimeout(timer)
    const finalUrl = resp.url || redirectUrl
    if (!isAdzunaHost(finalUrl)) return finalUrl

    // Still on Adzuna — parse the page HTML to find the actual destination
    const html = await resp.text()
    return extractDestFromHtml(html, finalUrl) || finalUrl
  } catch {
    return redirectUrl
  }
}

// Resolve all still-unresolved Adzuna redirect URLs in the DB (runs in background).
export async function resolveAdzunaUrls() {
  const db = getDb()
  const unresolved = db.prepare(
    "SELECT id, url FROM jobs WHERE source = 'adzuna' AND (url LIKE 'https://www.adzuna.%' OR url LIKE 'https://adzuna.%')"
  ).all()

  if (unresolved.length === 0) return
  console.log(`[adzuna] Resolving ${unresolved.length} redirect URLs…`)

  const update = db.prepare('UPDATE jobs SET url = ? WHERE id = ?')
  const CONCURRENCY = 8

  for (let i = 0; i < unresolved.length; i += CONCURRENCY) {
    const batch = unresolved.slice(i, i + CONCURRENCY)
    await Promise.all(batch.map(async ({ id, url }) => {
      const resolved = await resolveUrl(url)
      if (resolved && resolved !== url) update.run(resolved, id)
    }))
  }

  console.log(`[adzuna] URL resolution complete`)
}

export async function fetchAdzunaJobs() {
  const appId  = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY

  if (!appId || !appKey) {
    throw new Error('ADZUNA_APP_ID and ADZUNA_APP_KEY must be set in server/.env')
  }

  const db = getDb()
  let totalUpserted = 0
  const errors = []

  for (const { country, where, label } of SEARCHES) {
    for (const what of JOB_QUERIES) {
      try {
        const { data } = await axios.get(
          `https://api.adzuna.com/v1/api/jobs/${country}/search/1`,
          {
            params: {
              app_id: appId,
              app_key: appKey,
              what,
              where,
              results_per_page: 20,
              salary_include_unknown: 1,
              'content-type': 'application/json',
            },
            timeout: 12000,
          }
        )

        const selectUrl = db.prepare('SELECT url FROM jobs WHERE id = ?')

        for (const job of data?.results ?? []) {
          const titleStr = job.title || ''
          const descStr  = (job.description || '').slice(0, 2000)

          if (isExcluded(titleStr, descStr)) continue

          const { grandCategory, subType } = classifyJob(titleStr)

          // Preserve a previously-resolved URL so daily refreshes don't revert it.
          // Try query-param extraction as a fast fallback for new jobs.
          const jobId = `adzuna_${job.id}`
          const existing = selectUrl.get(jobId)
          let jobUrl
          if (existing && !isAdzunaHost(existing.url)) {
            jobUrl = existing.url
          } else {
            jobUrl = extractUrlFromQueryParams(job.redirect_url) || job.redirect_url || ''
          }

          db.prepare(`
            INSERT OR REPLACE INTO jobs (
              id, title, company, company_logo, location, sector,
              salary_min, salary_max, salary_currency,
              description, url, date_posted, source,
              deadline_type, deadline_date,
              grand_category, sub_type, experience_level
            ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'adzuna', NULL, NULL, ?, ?, ?)
          `).run(
            jobId,
            titleStr,
            job.company?.display_name || '',
            label,
            inferSector(titleStr, descStr),
            job.salary_min  || null,
            job.salary_max  || null,
            currencyFor(country),
            descStr,
            jobUrl,
            job.created ? new Date(job.created).toISOString() : new Date().toISOString(),
            grandCategory,
            subType,
            inferExperienceLevel(titleStr, descStr),
          )
          totalUpserted++
        }

        await new Promise(r => setTimeout(r, 200))
      } catch (err) {
        const msg = `[adzuna] ${label} / "${what}": ${err.message}`
        console.error(msg)
        errors.push(msg)
      }
    }
  }

  // Prune listings older than 30 days
  db.prepare(`DELETE FROM jobs WHERE source = 'adzuna' AND date_posted < datetime('now', '-30 days')`).run()

  console.log(`[adzuna] Upserted ${totalUpserted} jobs (${errors.length} search errors)`)
  return { upserted: totalUpserted, errors }
}
