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

export async function agenceSitesList() {
   try {
      const res = await adminApiFetch("/api/sites");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur API");
      return data.sites || [];
   } catch (err) {
      console.error("agenceSitesList:", err.message);
      throw err;
   }
}

export async function agenceSiteUpdate(id, payload) {
   try {
      const res = await adminApiFetch(`/api/sites/${id}`, {
         method: "PUT",
         body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur API");
      return data.site;
   } catch (err) {
      console.error("agenceSiteUpdate:", err.message);
      throw err;
   }
}
