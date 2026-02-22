'use server'

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://admin-api:3000'
const ADMIN_API_KEY = process.env.ADMIN_API_KEY

function adminApiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (ADMIN_API_KEY) {
    headers['X-API-Key'] = ADMIN_API_KEY
  }
  return fetch(`${ADMIN_API_URL}${path}`, { ...options, headers })
}

export async function clientsList() {
  try {
    const res = await adminApiFetch('/api/clients')
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data.clients || []
  } catch (err) {
    console.error('clientsList:', err.message)
    throw err
  }
}

export async function clientGet(id) {
  try {
    const res = await adminApiFetch(`/api/clients/${id}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data.client
  } catch (err) {
    console.error('clientGet:', err.message)
    throw err
  }
}

export async function clientCreate(form) {
  try {
    const res = await adminApiFetch('/api/clients', {
      method: 'POST',
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data.client
  } catch (err) {
    console.error('clientCreate:', err.message)
    throw err
  }
}

export async function clientUpdate(id, form) {
  try {
    const res = await adminApiFetch(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return data.client
  } catch (err) {
    console.error('clientUpdate:', err.message)
    throw err
  }
}

export async function clientDelete(id) {
  try {
    const res = await adminApiFetch(`/api/clients/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Erreur API')
    return true
  } catch (err) {
    console.error('clientDelete:', err.message)
    throw err
  }
}
