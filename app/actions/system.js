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

export async function getSystemStats() {
   try {
      const res = await adminApiFetch("/api/system/stats");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur API");
      return data.stats;
   } catch (err) {
      console.error("getSystemStats:", err.message);
      throw err;
   }
}
