import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export async function fetchJobs(filters = {}) {
  const params = {}
  if (filters.locations?.length) params.locations = filters.locations.join(',')
  if (filters.sectors?.length) params.sectors = filters.sectors.join(',')
  if (filters.days && filters.days !== 'any') params.days = filters.days
  if (filters.q) params.q = filters.q
  const { data } = await api.get('/jobs', { params })
  return data
}

export async function refreshJobs() {
  const { data } = await api.post('/jobs/refresh')
  return data
}

export async function saveJob(job) {
  const { data } = await api.post('/tracker', {
    job_id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    url: job.url,
    sector: job.sector,
    deadline_type: job.deadline_type || null,
    deadline_date: job.deadline_date || null,
  })
  return data
}

export async function fetchTracker(status) {
  const params = status && status !== 'All' ? { status } : {}
  const { data } = await api.get('/tracker', { params })
  return data
}

export async function updateApplication(id, patch) {
  const { data } = await api.patch(`/tracker/${id}`, patch)
  return data
}

export async function deleteApplication(id) {
  const { data } = await api.delete(`/tracker/${id}`)
  return data
}

export async function addApplication(application) {
  const { data } = await api.post('/tracker', { ...application, is_manual: 1 })
  return data
}

export async function fetchAiStatus() {
  const { data } = await api.get('/ai/status')
  return data
}

export async function reviewCv(payload) {
  const { data } = await api.post('/ai/cv-review', payload)
  return data
}

export async function extractCvProfile(payload) {
  const { data } = await api.post('/ai/cv-extract', payload)
  return data
}

export async function joinWaitlist(signup) {
  const { data } = await api.post('/waitlist', signup)
  return data
}

export async function fetchWaitlistStats() {
  const { data } = await api.get('/waitlist/stats')
  return data
}
