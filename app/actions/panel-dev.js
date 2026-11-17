"use server";

const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://admin-api:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function adminApiFetch(path, options = {}) {
   const headers = { ...options.headers };
   if (ADMIN_API_KEY) {
      headers["X-API-Key"] = ADMIN_API_KEY;
   }
   return fetch(`${ADMIN_API_URL}${path}`, { ...options, headers });
}

export async function getPanelDevStatus() {
   try {
      const res = await adminApiFetch("/api/panel-dev/status");
      const data = await res.json();
      if (!data.success) {
         throw new Error(data.error || "Erreur API");
      }
      return {
         running: !!data.running,
         status: data.status || "unknown",
         containerId: data.containerId || null,
         startedAt: data.startedAt || null,
         url: data.url || "https://dev.vps.graphandco.com",
      };
   } catch (err) {
      console.error("getPanelDevStatus:", err.message);
      throw err;
   }
}

export async function startPanelDev() {
   try {
      const res = await adminApiFetch("/api/panel-dev/start", { method: "POST" });
      const data = await res.json();
      if (!data.success) {
         return { success: false, error: data.error || "Erreur API" };
      }
      return {
         success: true,
         running: !!data.running,
         status: data.status,
         url: data.url,
      };
   } catch (err) {
      console.error("startPanelDev:", err.message);
      return { success: false, error: err.message || "Erreur API" };
   }
}

export async function stopPanelDev() {
   try {
      const res = await adminApiFetch("/api/panel-dev/stop", { method: "POST" });
      const data = await res.json();
      if (!data.success) {
         return { success: false, error: data.error || "Erreur API" };
      }
      return {
         success: true,
         running: !!data.running,
         status: data.status,
         url: data.url,
      };
   } catch (err) {
      console.error("stopPanelDev:", err.message);
      return { success: false, error: err.message || "Erreur API" };
   }
}
