"use server";

const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://admin-api:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function adminApiFetch(path, options = {}) {
   const headers = { "Content-Type": "application/json", ...options.headers };
   if (ADMIN_API_KEY) {
      headers["X-API-Key"] = ADMIN_API_KEY;
   }
   return fetch(`${ADMIN_API_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store",
   });
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
 * @returns {Promise<{
 *   data: object,
 *   refreshed: object,
 *   ok: string[],
 *   failed: Array<{ kind: string, error: string }>
 * }>}
 */
export async function refreshNotificationCounts(kind = null) {
   const res = await adminApiFetch("/api/notifications/refresh", {
      method: "POST",
      body: JSON.stringify(kind ? { kind } : {}),
   });
   const payload = await res.json();
   if (!payload.success) throw new Error(payload.error || "Erreur refresh");

   const refreshed = payload.refreshed || {};
   const ok = [];
   const failed = [];

   if (kind) {
      // single-kind: refreshed = { kind, count, checkedAt } ou { kind, error }
      if (refreshed.error) {
         failed.push({ kind, error: refreshed.error });
      } else {
         ok.push(kind);
      }
   } else {
      for (const k of ["apt", "docker", "wordpress"]) {
         const entry = refreshed[k];
         if (entry?.error) failed.push({ kind: k, error: entry.error });
         else if (entry && entry.count != null) ok.push(k);
         else failed.push({ kind: k, error: entry?.error || "Aucun résultat" });
      }
   }

   return {
      data: payload.data,
      refreshed,
      ok,
      failed,
   };
}
