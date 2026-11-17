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
 * Statut SeaweedFS (VPS + NAS) et accès public/privé des buckets.
 */
export async function getSeaweedfsStatus() {
   try {
      const res = await adminApiFetch("/api/seaweedfs/status");
      const data = await res.json();
      if (!res.ok) {
         throw new Error(data.error || `Erreur ${res.status}`);
      }
      return data;
   } catch (err) {
      console.error("getSeaweedfsStatus:", err.message);
      throw err;
   }
}
