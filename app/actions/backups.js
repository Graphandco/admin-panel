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
 * Récupère la liste des snapshots Restic depuis le dépôt configuré (VPS → NAS)
 * @param withStats - si true, récupère taille et nb fichiers (lent). Par défaut: false (rapide)
 */
export async function getBackupSnapshots(withStats = false) {
  try {
    const path = `/api/backups/snapshots${withStats ? "?withStats=true" : ""}`;
    const res = await adminApiFetch(path);
    const data = await res.json();
    if (!res.ok) {
      const detail = data.stderr ? `\n\nDétails:\n${data.stderr}` : "";
      throw new Error((data.error || "Erreur API") + detail);
    }
    return data;
  } catch (err) {
    console.error("getBackupSnapshots:", err.message);
    throw err;
  }
}
