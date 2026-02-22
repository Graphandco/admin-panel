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
 * 10 dernières connexions au backoffice WordPress
 * @returns {Promise<Array<{ user: string, login: string }>>}
 */
export async function wordpressConnexions() {
  try {
    const res = await adminApiFetch('/api/wordpress/connexions')
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
    return data.connexions || []
  } catch (err) {
    console.error('wordpressConnexions:', err.message)
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

/**
 * Statistiques par type de contenu + espace disque
 * @param {{ url?: string }} options - url optionnelle pour cibler un site
 * @returns {Promise<{ content_types: Array<{name,label,count}>, disk_used: string|null }>}
 */
export async function wordpressSiteStats(options = {}) {
  try {
    const params = new URLSearchParams()
    if (options.url) params.set('url', options.url)
    const path = '/api/wordpress/site-stats' + (params.toString() ? `?${params}` : '')
    const res = await adminApiFetch(path)
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
    return {
      content_types: data.content_types || [],
      disk_used: data.disk_used || null,
    }
  } catch (err) {
    console.error('wordpressSiteStats:', err.message)
    throw err
  }
}

/**
 * Infos d'un site (titre, logo, url, admin_url)
 * @param {{ url: string }} options - url du site
 * @returns {Promise<{ site_name, url, logo_url, admin_url }>}
 */
export async function wordpressSiteInfo(options) {
  try {
    if (!options?.url) return null
    const res = await adminApiFetch(`/api/wordpress/site-info?url=${encodeURIComponent(options.url)}`)
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      return null
    }
    if (!data.success) return null
    return {
      site_name: data.site_name || null,
      tagline: data.tagline || null,
      url: data.url || null,
      logo_url: data.logo_url || null,
      admin_url: data.admin_url || null,
    }
  } catch (err) {
    console.error('wordpressSiteInfo:', err.message)
    return null
  }
}
