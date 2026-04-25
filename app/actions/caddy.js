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

export async function caddyStatus() {
  const res = await adminApiFetch('/api/caddy/status')
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Erreur API Caddy')
  return data
}

export async function caddyMapping() {
  const res = await adminApiFetch('/api/caddy/mapping')
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Erreur API Caddy')
  return { mapping: data.mapping || [], redirects: data.redirects || [] }
}

export async function caddyRedirects() {
  const res = await adminApiFetch('/api/caddy/redirects')
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Erreur API Caddy')
  return data.redirects || []
}

export async function caddyFileLog(file, tail = 200) {
  const res = await adminApiFetch(
    `/api/caddy/file-log?file=${encodeURIComponent(file)}&tail=${tail}`,
  )
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Erreur lecture log')
  return data.log || ''
}

/** Valide le Caddyfile via `docker exec … caddy validate` (sans recharger Caddy) */
export async function caddyValidate() {
  const res = await adminApiFetch('/api/caddy/validate', { method: 'POST' })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Erreur API')
  return { valid: data.valid, output: data.output || '' }
}
