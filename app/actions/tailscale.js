'use server'

// Support both TAILSCALE and TAILSACLE (typo) for backward compatibility with .env
const TAILSCALE_API_URL =
  (process.env.TAILSCALE_API_URL || process.env.TAILSACLE_API_URL || 'https://api.tailscale.com/api/v2').replace(/\/$/, '')
const TAILSCALE_API_KEY = process.env.TAILSCALE_API_KEY || process.env.TAILSACLE_API_KEY
const TAILSCALE_TAILNET = process.env.TAILSCALE_TAILNET || process.env.TAILSACLE_TAILNET

async function tailscaleFetch(path, options = {}) {
  if (!TAILSCALE_API_KEY) {
    throw new Error('TAILSCALE_API_KEY (ou TAILSACLE_API_KEY) est requis')
  }
  const url = path.startsWith('http') ? path : `${TAILSCALE_API_URL}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TAILSCALE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Tailscale API ${res.status}: ${errBody || res.statusText}`)
  }
  return res.json()
}

/**
 * Récupère les infos du tailnet.
 * GET /tailnet/{tailnet} retourne 405 - on utilise /devices qui fonctionne.
 * Doc: https://tailscale.com/api-docs
 */
export async function getTailnetInfo() {
  if (!TAILSCALE_API_KEY) {
    return {
      tailnet: null,
      error: 'TAILSCALE_API_KEY (ou TAILSACLE_API_KEY) non défini dans .env',
    }
  }
  if (!TAILSCALE_TAILNET) {
    return {
      tailnet: null,
      error: 'TAILSCALE_TAILNET (ou TAILSACLE_TAILNET) non défini dans .env (ex: springbok-arcturus.ts.net)',
    }
  }
  try {
    const path = `/tailnet/${encodeURIComponent(TAILSCALE_TAILNET)}/devices`
    const data = await tailscaleFetch(path)
    const devices = data.devices ?? []
    return {
      tailnet: TAILSCALE_TAILNET,
      name: TAILSCALE_TAILNET,
      deviceCount: devices.length,
      devices,
    }
  } catch (err) {
    console.error('getTailnetInfo:', err.message)
    return {
      tailnet: TAILSCALE_TAILNET,
      error: err.message,
    }
  }
}

/**
 * Liste les appareils du tailnet (fallback si tailnet endpoint échoue)
 */
export async function getTailscaleDevices() {
  if (!TAILSCALE_TAILNET) {
    return { devices: [], error: 'TAILSCALE_TAILNET non défini' }
  }
  try {
    const data = await tailscaleFetch(`/tailnet/${encodeURIComponent(TAILSCALE_TAILNET)}/devices`)
    return { devices: data.devices ?? [], error: null }
  } catch (err) {
    console.error('getTailscaleDevices:', err.message)
    return { devices: [], error: err.message }
  }
}
