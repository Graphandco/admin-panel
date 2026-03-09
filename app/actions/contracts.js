'use server';

const pathModule = require('path');
const fs = require('fs/promises');

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://admin-api:3000';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const CONTRACTS_DIR = process.env.CONTRACTS_DIR || pathModule.join(process.cwd(), 'contracts');

function adminApiFetch(apiPath, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (ADMIN_API_KEY) {
    headers['X-API-Key'] = ADMIN_API_KEY;
  }
  return fetch(`${ADMIN_API_URL}${apiPath}`, { ...options, headers });
}

export async function contractsList() {
  try {
    const res = await adminApiFetch('/api/contracts');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erreur API');
    return data.contracts || [];
  } catch (err) {
    console.error('contractsList:', err.message);
    throw err;
  }
}

export async function contractDeleteWithFile(id) {
  try {
    const res = await adminApiFetch(`/api/contracts/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erreur API');
    const filename = data.filename;
    if (filename) {
      const filepath = pathModule.join(CONTRACTS_DIR, filename);
      try {
        await fs.unlink(filepath);
      } catch (fileErr) {
        if (fileErr.code !== 'ENOENT') console.warn('contract file delete:', fileErr.message);
      }
    }
    return true;
  } catch (err) {
    console.error('contractDeleteWithFile:', err.message);
    throw err;
  }
}
