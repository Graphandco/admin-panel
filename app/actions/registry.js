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
 * Catalogue du registry Docker (repos + tags + digests)
 */
export async function getRegistryOverview() {
  try {
    const res = await adminApiFetch('/api/registry')
    const data = await res.json()
    if (!data.success) {
      return {
        online: false,
        repositories: [],
        repositoryCount: 0,
        tagCount: 0,
        label: data.label || 'DockerHub Graphandco',
        host: data.host || null,
        url: data.url || null,
        error: data.error || `Erreur ${res.status}`,
      }
    }
    return {
      online: true,
      repositories: data.repositories || [],
      repositoryCount: data.repositoryCount ?? 0,
      tagCount: data.tagCount ?? 0,
      label: data.label || 'DockerHub Graphandco',
      host: data.host || null,
      url: data.url || null,
      error: null,
    }
  } catch (err) {
    console.error('getRegistryOverview:', err.message)
    return {
      online: false,
      repositories: [],
      repositoryCount: 0,
      tagCount: 0,
      label: 'DockerHub Graphandco',
      host: null,
      url: null,
      error: err.message || 'Erreur lors du chargement du registry',
    }
  }
}

/**
 * Supprime un manifeste (par digest) dans le registry.
 * @returns {{ success: boolean, error?: string, affectedTags?: string[] }}
 */
export async function deleteRegistryManifest({ repository, digest, tag }) {
  try {
    const res = await adminApiFetch('/api/registry/manifest', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repository, digest, tag }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Erreur ${res.status}`,
        affectedTags: data.affectedTags || [],
      }
    }
    return {
      success: true,
      affectedTags: data.affectedTags || [],
      digest: data.digest,
      repository: data.repository,
    }
  } catch (err) {
    console.error('deleteRegistryManifest:', err.message)
    return { success: false, error: err.message || 'Erreur lors de la suppression' }
  }
}

/**
 * Lance le garbage collector du registry.
 * @returns {{ success: boolean, error?: string, output?: string, dryRun?: boolean }}
 */
export async function runRegistryGarbageCollect({ dryRun = false } = {}) {
  try {
    const res = await adminApiFetch('/api/registry/gc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || `Erreur ${res.status}` }
    }
    return {
      success: true,
      dryRun: data.dryRun,
      output: data.output || '',
    }
  } catch (err) {
    console.error('runRegistryGarbageCollect:', err.message)
    return { success: false, error: err.message || 'Erreur lors du garbage collect' }
  }
}

/**
 * Détail d'un tag (layers, history, taille…).
 */
export async function getRegistryTagDetail(repository, tag) {
  try {
    const qs = new URLSearchParams({ repository, tag })
    const res = await adminApiFetch(`/api/registry/tag?${qs}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || `Erreur ${res.status}`, tag: null }
    }
    return { success: true, repository: data.repository, tag: data.tag }
  } catch (err) {
    console.error('getRegistryTagDetail:', err.message)
    return { success: false, error: err.message || 'Erreur', tag: null }
  }
}
