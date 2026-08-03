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

export async function getAdminSettings() {
   const res = await adminApiFetch("/api/settings");
   const data = await res.json();
   if (!data.success) throw new Error(data.error || "Erreur réglages");
   return data.settings;
}

/**
 * @returns {{ success: boolean, settings?: object, error?: string }}
 */
export async function updateAdminSettings(partial) {
   try {
      const res = await adminApiFetch("/api/settings", {
         method: "PUT",
         body: JSON.stringify(partial),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
         return { success: false, error: data?.error || `Erreur ${res.status}` };
      }
      return { success: true, settings: data.settings };
   } catch (err) {
      return { success: false, error: err.message || "Erreur API" };
   }
}
