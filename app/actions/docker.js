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

export async function dockerStatsAll() {
  try {
    const res = await adminApiFetch('/api/docker/stats')
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data.stats || []
  } catch (err) {
    console.error('dockerStatsAll:', err.message)
    throw err
  }
}

/**
 * Actions conteneur — ne throw pas (évite le message générique Next en prod).
 * @returns {{ success: boolean, error?: string }}
 */
async function dockerContainerAction(containerId, action) {
  const endpoints = {
    start: 'start',
    stop: 'stop',
    remove: 'remove',
    build: 'build',
    pull: 'pull',
    restart: 'restart',
    compose: 'compose',
    recreate: 'recreate',
  }
  if (!endpoints[action]) {
    return { success: false, error: `Action inconnue: ${action}` }
  }
  try {
    const path = `/api/docker/container/${encodeURIComponent(containerId)}/${endpoints[action]}`
    const res = await adminApiFetch(path, { method: 'POST' })
    let data
    try {
      data = await res.json()
    } catch {
      return {
        success: false,
        error:
          res.status === 404
            ? 'Route API introuvable — redémarrer admin-api'
            : `Erreur ${res.status}`,
      }
    }
    if (!res.ok || !data.success) {
      return { success: false, error: data?.error || `Erreur ${res.status}` }
    }
    return { success: true, ...data }
  } catch (err) {
    console.error(`dockerContainerAction(${action}):`, err.message)
    return { success: false, error: err.message || 'Erreur API' }
  }
}

export async function dockerContainerStart(containerId) {
  return dockerContainerAction(containerId, 'start')
}

export async function dockerContainerStop(containerId) {
  return dockerContainerAction(containerId, 'stop')
}

export async function dockerContainerRestart(containerId) {
  return dockerContainerAction(containerId, 'restart')
}

export async function dockerContainerRemove(containerId) {
  return dockerContainerAction(containerId, 'remove')
}

export async function dockerContainerBuild(containerId) {
  return dockerContainerAction(containerId, 'build')
}

export async function dockerContainerPull(containerId) {
  return dockerContainerAction(containerId, 'pull')
}

export async function dockerContainerCompose(containerId) {
  return dockerContainerAction(containerId, 'compose')
}

export async function dockerContainerRecreate(containerId) {
  return dockerContainerAction(containerId, 'recreate')
}

export async function dockerContainerStats(containerId) {
  try {
    const res = await adminApiFetch(
      `/api/docker/stats/${encodeURIComponent(containerId)}`,
    )
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data.stats || null
  } catch (err) {
    console.error('dockerContainerStats:', err.message)
    throw err
  }
}

export async function dockerLogs(containerId, tail = 100) {
  try {
    const res = await adminApiFetch(
      `/api/docker/logs?container=${encodeURIComponent(containerId)}&tail=${tail}`,
    )
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data.logs || ''
  } catch (err) {
    console.error('dockerLogs:', err.message)
    throw err
  }
}

/**
 * Liste les conteneurs images Docker Hub (officielles + tierces) avec statut de mise à jour
 */
export async function dockerImageUpdates() {
  try {
    const res = await adminApiFetch('/api/docker/updates')
    const data = await res.json()
    if (!data.success) {
      throw new Error(data.error || 'Erreur API')
    }
    return {
      updates: data.updates || [],
      updateCount: data.updateCount ?? 0,
      count: data.count ?? 0,
      source: data.source || null,
      checkedAt: data.checkedAt || null,
    }
  } catch (err) {
    console.error('dockerImageUpdates:', err.message)
    throw err
  }
}

/**
 * Pull + recreate compose pour appliquer la dernière image du tag
 * @returns {{ success: boolean, error?: string, image?: string }}
 */
export async function dockerApplyImageUpdate(containerId) {
  try {
    const res = await adminApiFetch(
      `/api/docker/updates/${encodeURIComponent(containerId)}`,
      { method: 'POST' },
    )
    let data
    try {
      data = await res.json()
    } catch {
      return {
        success: false,
        error:
          res.status === 404
            ? 'Route API introuvable — redémarrer admin-api'
            : `Erreur ${res.status}`,
      }
    }
    if (!res.ok || !data.success) {
      return { success: false, error: data?.error || `Erreur ${res.status}` }
    }
    return { success: true, ...data }
  } catch (err) {
    console.error('dockerApplyImageUpdate:', err.message)
    return { success: false, error: err.message || 'Erreur API' }
  }
}

export async function dockerOrphans() {
  try {
    const res = await adminApiFetch('/api/docker/orphans')
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data.orphans || []
  } catch (err) {
    console.error('dockerOrphans:', err.message)
    throw err
  }
}

/**
 * @param {{ id?: string, ids?: string[], all?: boolean }} opts
 * @returns {{ success: boolean, removed?: number, error?: string }}
 */
export async function dockerOrphansRemove(opts = {}) {
  try {
    const res = await adminApiFetch('/api/docker/orphans/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    })
    let data
    try {
      data = await res.json()
    } catch {
      return {
        success: false,
        error:
          res.status === 404
            ? 'Route API introuvable — redémarrer admin-api'
            : `Erreur ${res.status}`,
      }
    }
    if (!res.ok || !data.success) {
      return { success: false, error: data?.error || `Erreur ${res.status}` }
    }
    return { success: true, removed: data.removed ?? 0, ...data }
  } catch (err) {
    console.error('dockerOrphansRemove:', err.message)
    return { success: false, error: err.message || 'Erreur API' }
  }
}

/**
 * Images dangling locales + conteneurs qui les référencent
 */
export async function dockerDanglingImages() {
  try {
    const res = await adminApiFetch('/api/docker/dangling-images')
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data
  } catch (err) {
    console.error('dockerDanglingImages:', err.message)
    throw err
  }
}

/**
 * @param {{ id?: string, allFree?: boolean }} opts
 */
export async function dockerDanglingImagesRemove(opts = {}) {
  try {
    const res = await adminApiFetch('/api/docker/dangling-images/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    })
    let data
    try {
      data = await res.json()
    } catch {
      return {
        success: false,
        error:
          res.status === 404
            ? 'Route API introuvable — redémarrer admin-api'
            : `Erreur ${res.status}`,
      }
    }
    if (!res.ok || !data.success) {
      return { success: false, error: data?.error || `Erreur ${res.status}` }
    }
    return { success: true, ...data }
  } catch (err) {
    console.error('dockerDanglingImagesRemove:', err.message)
    return { success: false, error: err.message || 'Erreur API' }
  }
}

/**
 * Vide le cache de build Docker (buildx prune -af)
 * @returns {{ success: boolean, spaceReclaimedFormatted?: string, error?: string }}
 */
export async function dockerBuilderPrune() {
  try {
    const res = await adminApiFetch('/api/docker/builder-prune', {
      method: 'POST',
    })
    let data
    try {
      data = await res.json()
    } catch {
      return {
        success: false,
        error:
          res.status === 404
            ? 'Route API introuvable — redémarrer admin-api'
            : `Erreur ${res.status}`,
      }
    }
    if (!res.ok || !data.success) {
      return { success: false, error: data?.error || `Erreur ${res.status}` }
    }
    return {
      success: true,
      spaceReclaimed: data.spaceReclaimed ?? 0,
      spaceReclaimedFormatted: data.spaceReclaimedFormatted || '0 B',
      output: data.output || '',
    }
  } catch (err) {
    console.error('dockerBuilderPrune:', err.message)
    return { success: false, error: err.message || 'Erreur API' }
  }
}
