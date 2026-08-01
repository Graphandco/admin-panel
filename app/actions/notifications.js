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
 * @returns {Promise<{
 *   apt: number,
 *   docker: number,
 *   wordpress: number,
 *   total: number,
 *   checkedAt: string|null,
 *   items: Array<{ id: string, label: string, count: number, href: string }>
 * }>}
 */
export async function getNotificationCounts() {
   const res = await adminApiFetch("/api/notifications/counts");
   const data = await res.json();
   if (!data.success) throw new Error(data.error || "Erreur compteurs");
   return data.data;
}

/**
 * @param {'apt'|'docker'|'wordpress'|null} [kind]
 */
export async function refreshNotificationCounts(kind = null) {
   const res = await adminApiFetch("/api/notifications/refresh", {
      method: "POST",
      body: JSON.stringify(kind ? { kind } : {}),
   });
   const data = await res.json();
   if (!data.success) throw new Error(data.error || "Erreur refresh");
   return data.data;
}
