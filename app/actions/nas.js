"use server";

const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://admin-api:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function adminApiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (ADMIN_API_KEY) {
    headers["X-API-Key"] = ADMIN_API_KEY;
  }
  return fetch(`${ADMIN_API_URL}${path}`, { ...options, headers });
}

/**
 * Récupère les stats du NAS Unraid (RAM, loadavg, uptime)
 */
export async function getNasStats() {
  try {
    const res = await adminApiFetch("/api/nas/stats");
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Erreur ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error("getNasStats:", err.message);
    throw err;
  }
}
