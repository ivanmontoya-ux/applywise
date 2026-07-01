const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
const AUTH_STORAGE_KEY = 'applywise.supabase.session'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

function getSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to client/.env.')
  }

  return {
    url: supabaseUrl.replace(/\/$/, ''),
    key: supabaseKey,
  }
}

function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('applywise-auth-change'))
  }
}

function readStoredSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredSession(session) {
  if (typeof window === 'undefined') return
  if (!session?.access_token) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    notifyAuthChange()
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  notifyAuthChange()
}

function normalizeSession(data) {
  if (!data?.access_token) return null
  const expiresIn = Number(data.expires_in || 3600)
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || '',
    token_type: data.token_type || 'bearer',
    expires_at: Date.now() + expiresIn * 1000,
    user: data.user || null,
  }
}

async function authRequest(path, options = {}) {
  const { url, key } = getSupabaseConfig()
  const response = await fetch(`${url}/auth/v1${path}`, {
    ...options,
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.msg || data?.message || text || `Supabase auth request failed with ${response.status}`)
  }

  return data
}

export function getStoredAuthSession() {
  return readStoredSession()
}

export function clearAuthSession() {
  writeStoredSession(null)
}

export async function refreshAuthSession(session = readStoredSession()) {
  if (!session?.refresh_token) {
    clearAuthSession()
    return null
  }

  try {
    const data = await authRequest('/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    })
    const nextSession = normalizeSession(data)
    writeStoredSession(nextSession)
    return nextSession
  } catch {
    clearAuthSession()
    return null
  }
}

export async function getCurrentSession() {
  const session = readStoredSession()
  if (!session?.access_token) return null

  if (session.expires_at && session.expires_at > Date.now() + 60_000) {
    return session
  }

  return refreshAuthSession(session)
}

export async function getAccessToken() {
  const session = await getCurrentSession()
  return session?.access_token || ''
}

export async function signUpWithEmail({ email, password, fullName }) {
  const data = await authRequest('/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      data: fullName ? { full_name: fullName } : {},
    }),
  })
  const session = normalizeSession(data)
  if (session) writeStoredSession(session)
  return { session, user: data?.user || session?.user || null }
}

export async function signInWithPassword({ email, password }) {
  const data = await authRequest('/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const session = normalizeSession(data)
  writeStoredSession(session)
  return { session, user: session?.user || data?.user || null }
}

export async function signOutFromSupabase() {
  const session = readStoredSession()
  if (session?.access_token) {
    try {
      await authRequest('/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
    } catch {
      // Local logout should still happen if the remote session already expired.
    }
  }
  clearAuthSession()
}

export async function supabaseRest(path, options = {}) {
  const { url, key } = getSupabaseConfig()
  const response = await fetch(`${url}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Supabase request failed with ${response.status}`)
  }

  const text = await response.text()
  if (!text) {
    return null
  }

  return JSON.parse(text)
}

export async function createWaitlistSignup(signup) {
  return supabaseRest('/waitlist_signups', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      email: signup.email,
      full_name: signup.fullName || null,
      location: signup.location || null,
      target_role: signup.targetRole || null,
      strongest_need: signup.strongestNeed || null,
      source: signup.source || 'website',
      metadata: signup.metadata || {},
    }),
  })
}

export async function fetchPublicJobs() {
  return supabaseRest('/jobs?select=*&order=date_posted.desc.nullslast&limit=500')
}
