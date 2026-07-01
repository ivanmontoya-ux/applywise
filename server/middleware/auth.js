const USER_CACHE_TTL_MS = 60_000
const userCache = new Map()

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getSupabaseConfig() {
  const url = clean(process.env.SUPABASE_URL).replace(/\/$/, '')
  const key = clean(
    process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  if (!url || !key) {
    const err = new Error('Supabase auth is not configured on the server.')
    err.status = 503
    throw err
  }

  return { url, key }
}

function getBearerToken(req) {
  const header = req.get('authorization') || ''
  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return ''
  return token.trim()
}

async function fetchSupabaseUser(token) {
  const cached = userCache.get(token)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user
  }

  const { url, key } = getSupabaseConfig()
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
    },
  })

  const rawText = await response.text()
  let data = null
  try {
    data = rawText ? JSON.parse(rawText) : null
  } catch {
    data = null
  }

  if (!response.ok || !data?.id) {
    const err = new Error(data?.msg || data?.message || 'Invalid or expired session.')
    err.status = 401
    throw err
  }

  const user = {
    id: data.id,
    email: data.email || '',
    role: data.role || '',
  }
  userCache.set(token, {
    user,
    expiresAt: Date.now() + USER_CACHE_TTL_MS,
  })
  return user
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req)
    if (!token) {
      return res.status(401).json({ error: 'Login required.' })
    }

    req.user = await fetchSupabaseUser(token)
    next()
  } catch (error) {
    const status = error.status && Number.isInteger(error.status) ? error.status : 500
    res.status(status).json({
      error: error.message || 'Authentication failed.',
    })
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const token = getBearerToken(req)
    if (!token) {
      req.user = null
      next()
      return
    }

    req.user = await fetchSupabaseUser(token)
    next()
  } catch {
    req.user = null
    next()
  }
}
