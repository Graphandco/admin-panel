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

export async function filesShortcuts() {
   const res = await adminApiFetch("/api/files/shortcuts");
   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Erreur API");
   return data;
}

export async function filesLs(dirPath) {
   const q = dirPath ? `?path=${encodeURIComponent(dirPath)}` : "";
   const res = await adminApiFetch(`/api/files/ls${q}`);
   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Erreur listing");
   return data;
}

export async function filesRead(filePath) {
   const res = await adminApiFetch(
      `/api/files/read?path=${encodeURIComponent(filePath)}`,
   );
   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Erreur lecture");
   return data;
}

export async function filesWrite(filePath, content) {
   const res = await adminApiFetch("/api/files/write", {
      method: "PUT",
      body: JSON.stringify({ path: filePath, content }),
   });
   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Erreur écriture");
   return data;
}
