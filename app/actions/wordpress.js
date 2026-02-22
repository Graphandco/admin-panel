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

/**
 * Liste des sites du multisite WordPress
 * @returns {{ success: boolean, sites: Array, count?: number }}
 */
export async function wordpressSites() {
  try {
    const res = await adminApiFetch('/api/wordpress/sites')
    const data = await res.json()
    if (!data.success) {
      throw new Error(data.error || 'Erreur API')
    }
    return data.sites || []
  } catch (err) {
    console.error('wordpressSites:', err.message)
    throw err
  }
}

/**
 * Liste des plugins WordPress (optionnel: url pour cibler un site, status pour filtrer)
 * @param {{ url?: string, status?: 'active'|'inactive' }} options
 * @returns {Promise<Array<{ name, title?, status, version, update, update_version }>>}
 */
export async function wordpressPlugins(options = {}) {
  try {
    const params = new URLSearchParams()
    if (options.url) params.set('url', options.url)
    if (options.status) params.set('status', options.status)
    const path = '/api/wordpress/plugins' + (params.toString() ? `?${params}` : '')
    const res = await adminApiFetch(path)
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(res.ok ? 'Réponse invalide' : `API ${res.status}: ${(text || res.statusText).slice(0, 200)}`)
    }
    if (!data.success) {
      const msg = data.stderr || data.error || 'Erreur API'
      throw new Error(msg)
    }
    return data.plugins || []
  } catch (err) {
    console.error('wordpressPlugins:', err.message)
    throw err
  }
}

/**
 * Dernières modifications (posts/pages) sur tout le multisite
 * @returns {Promise<Array<{ title, modified, type, site_url, url?, blog_id }>>}
 */
export async function wordpressRecentChanges() {
  try {
    const res = await adminApiFetch('/api/wordpress/recent-changes')
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(res.ok ? 'Réponse invalide' : `API ${res.status}`)
    }
    if (!data.success) {
      throw new Error(data.error || 'Erreur API')
    }
    return data.changes || []
  } catch (err) {
    console.error('wordpressRecentChanges:', err.message)
    throw err
  }
}
