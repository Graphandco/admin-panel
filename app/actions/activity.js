'use server'

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://admin-api:3000'
const ADMIN_API_KEY = process.env.ADMIN_API_KEY

function adminApiFetch(path, options = {}) {
  const headers = { ...options.headers }
  if (ADMIN_API_KEY) {
    headers['X-API-Key'] = ADMIN_API_KEY
  }
  return fetch(`${ADMIN_API_URL}${path}`, { ...options, headers })
}

/**
 * @param {{ category?: string, status?: string, q?: string, limit?: number, offset?: number, hours?: number }} opts
 */
export async function getActivity(opts = {}) {
  try {
    const qs = new URLSearchParams()
    if (opts.category && opts.category !== 'all') qs.set('category', opts.category)
    if (opts.status && opts.status !== 'all') qs.set('status', opts.status)
    if (opts.q) qs.set('q', opts.q)
    if (opts.limit) qs.set('limit', String(opts.limit))
    if (opts.offset) qs.set('offset', String(opts.offset))
    if (opts.hours) qs.set('hours', String(opts.hours))
    const res = await adminApiFetch(`/api/activity?${qs}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data
  } catch (err) {
    console.error('getActivity:', err.message)
    throw err
  }
}
