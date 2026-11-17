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

export async function getAlertsOverview() {
   const res = await adminApiFetch("/api/alerts/overview");
   const data = await res.json();
   if (!data.success) throw new Error(data.error || "Erreur alertes");
   return data.data;
}
