const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

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
