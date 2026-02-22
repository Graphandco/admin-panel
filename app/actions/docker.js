'use server'

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://admin-api:3000'
const ADMIN_API_KEY = process.env.ADMIN_API_KEY

function adminApiFetch(path) {
  const headers = {}
  if (ADMIN_API_KEY) {
    headers['X-API-Key'] = ADMIN_API_KEY
  }
  return fetch(`${ADMIN_API_URL}${path}`, { headers })
}

export async function dockerPs() {
  try {
    const res = await adminApiFetch('/api/docker/ps')
    const data = await res.json()
    if (!data.success) {
      throw new Error(data.error || 'Erreur API')
    }
    return data.containers || []
  } catch (err) {
    console.error('dockerPs:', err.message)
    throw err
  }
}

export async function dockerStats() {
  try {
    const res = await adminApiFetch('/api/docker/stats')
    const data = await res.json()
    if (!data.success) return []
    return data.stats || []
  } catch {
    return []
  }
}

export async function dockerLogs(container) {
  try {
    const res = await adminApiFetch(
      `/api/docker/logs?container=${encodeURIComponent(container)}`
    )
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data.logs || ''
  } catch (err) {
    console.error('dockerLogs:', err.message)
    throw err
  }
}
