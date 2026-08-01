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

export async function getLogSources() {
   const res = await adminApiFetch("/api/logs/sources");
   const data = await res.json();
   if (!data.success) throw new Error(data.error || "Erreur sources logs");
   return data.data;
}

export async function checkLogErrors({ kind, id, tail = 300 }) {
   const res = await adminApiFetch("/api/logs/check-errors", {
      method: "POST",
      body: JSON.stringify({ kind, id, tail }),
   });
   const data = await res.json();
   if (!data.success) throw new Error(data.error || "Erreur analyse");
   return data.data;
}
