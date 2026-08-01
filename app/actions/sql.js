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

export async function sqlListDatabases(engine) {
   const res = await adminApiFetch(
      `/api/sql/databases?engine=${encodeURIComponent(engine)}`,
   );
   const data = await res.json();
   if (!data.success) throw new Error(data.error || "Erreur API");
   return data.databases || [];
}

export async function sqlListTables(engine, database) {
   const res = await adminApiFetch(
      `/api/sql/tables?engine=${encodeURIComponent(engine)}&database=${encodeURIComponent(database)}`,
   );
   const data = await res.json();
   if (!data.success) throw new Error(data.error || "Erreur API");
   return data.tables || [];
}

export async function sqlRunQuery({ engine, database, sql, limit }) {
   const res = await adminApiFetch("/api/sql/query", {
      method: "POST",
      body: JSON.stringify({ engine, database, sql, limit }),
   });
   const data = await res.json();
   if (!data.success) {
      return {
         success: false,
         error: data.error || "Erreur SQL",
         durationMs: data.durationMs,
      };
   }
   return data;
}
