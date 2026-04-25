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

async function dockerContainerAction(containerId, action) {
  const endpoints = {
    start: 'start',
    stop: 'stop',
    remove: 'remove',
    build: 'build',
    restart: 'restart',
  }
  const path = `/api/docker/container/${containerId}/${endpoints[action]}`
  const res = await adminApiFetch(path, { method: 'POST' })
  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(res.status === 404 ? 'Route API introuvable — redémarrer admin-api' : `Erreur ${res.status}`)
  }
  if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`)
  if (!data.success) throw new Error(data.error || 'Erreur API')
  return data
}

export async function dockerContainerStart(containerId) {
  try {
    return await dockerContainerAction(containerId, 'start')
  } catch (err) {
    console.error('dockerContainerStart:', err.message)
    throw err
  }
}

export async function dockerContainerStop(containerId) {
  try {
    return await dockerContainerAction(containerId, 'stop')
  } catch (err) {
    console.error('dockerContainerStop:', err.message)
    throw err
  }
}

export async function dockerContainerRestart(containerId) {
  try {
    return await dockerContainerAction(containerId, 'restart')
  } catch (err) {
    console.error('dockerContainerRestart:', err.message)
    throw err
  }
}

export async function dockerContainerRemove(containerId) {
  try {
    return await dockerContainerAction(containerId, 'remove')
  } catch (err) {
    console.error('dockerContainerRemove:', err.message)
    throw err
  }
}

export async function dockerContainerBuild(containerId) {
  try {
    return await dockerContainerAction(containerId, 'build')
  } catch (err) {
    console.error('dockerContainerBuild:', err.message)
    throw err
  }
}

export async function dockerContainerCompose(containerId) {
  try {
    return await dockerContainerAction(containerId, 'compose')
  } catch (err) {
    console.error('dockerContainerCompose:', err.message)
    throw err
  }
}

export async function dockerContainerStats(containerId) {
  try {
    const res = await adminApiFetch(`/api/docker/stats/${encodeURIComponent(containerId)}`)
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
      `/api/docker/logs?container=${encodeURIComponent(containerId)}&tail=${tail}`
    )
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data.logs || ''
  } catch (err) {
    console.error('dockerLogs:', err.message)
    throw err
  }
}
