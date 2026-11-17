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

export async function appsList() {
   try {
      const res = await adminApiFetch("/api/apps");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      return data.apps || [];
   } catch (err) {
      console.error("appsList:", err.message);
      throw err;
   }
}

export async function appCreate(payload) {
   try {
      const res = await adminApiFetch("/api/apps", {
         method: "POST",
         body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      return data.app;
   } catch (err) {
      console.error("appCreate:", err.message);
      throw err;
   }
}

export async function appUpdate(id, payload) {
   try {
      const res = await adminApiFetch(`/api/apps/${id}`, {
         method: "PUT",
         body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      return data.app;
   } catch (err) {
      console.error("appUpdate:", err.message);
      throw err;
   }
}

export async function appDelete(id) {
   try {
      const res = await adminApiFetch(`/api/apps/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      return true;
   } catch (err) {
      console.error("appDelete:", err.message);
      throw err;
   }
}
