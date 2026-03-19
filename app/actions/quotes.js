'use server';

const pathModule = require('path');
const fs = require('fs/promises');

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://admin-api:3000';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const QUOTES_DIR = process.env.QUOTES_DIR || pathModule.join(process.cwd(), 'quotes');

function adminApiFetch(apiPath, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (ADMIN_API_KEY) {
    headers['X-API-Key'] = ADMIN_API_KEY;
  }
  return fetch(`${ADMIN_API_URL}${apiPath}`, { ...options, headers });
}

export async function quotesList() {
  try {
    const res = await adminApiFetch('/api/quotes');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erreur API');
    return data.quotes || [];
  } catch (err) {
    console.error('quotesList:', err.message);
    throw err;
  }
}

export async function quoteDeleteWithFile(id) {
  try {
    const res = await adminApiFetch(`/api/quotes/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erreur API');
    const filename = data.filename;
    if (filename) {
      const filepath = pathModule.join(QUOTES_DIR, filename);
      try {
        await fs.unlink(filepath);
      } catch (fileErr) {
        if (fileErr.code !== 'ENOENT') console.warn('quote file delete:', fileErr.message);
      }
    }
    return true;
  } catch (err) {
    console.error('quoteDeleteWithFile:', err.message);
    throw err;
  }
}
