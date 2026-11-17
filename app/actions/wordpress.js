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

async function parseJson(res) {
   const text = await res.text();
   try {
      return JSON.parse(text);
   } catch {
      throw new Error(
         res.ok
            ? "Réponse invalide"
            : `API ${res.status}: ${(text || res.statusText).slice(0, 200)}`,
      );
   }
}

/**
 * Liste des sites du multisite WordPress
 */
export async function wordpressSites() {
   try {
      const res = await adminApiFetch("/api/wordpress/sites");
      const data = await parseJson(res);
      if (!data.success) throw new Error(data.error || "Erreur API");
      return data.sites || [];
   } catch (err) {
      console.error("wordpressSites:", err.message);
      throw err;
   }
}

/**
 * Infos générales (version WP, multisite, siteurl)
 */
export async function wordpressInfo() {
   try {
      const res = await adminApiFetch("/api/wordpress/info");
      const data = await parseJson(res);
      if (!data.success) throw new Error(data.error || "Erreur API");
      return {
         version: data.version || null,
         siteurl: data.siteurl || null,
         multisite: !!data.multisite,
      };
   } catch (err) {
      console.error("wordpressInfo:", err.message);
      throw err;
   }
}

/**
 * Liste unifiée des plugins (multisite)
 * @param {{ url?: string, status?: string }} [options]
 * @returns {Promise<{ plugins: Array, summary?: object }>}
 */
export async function wordpressPlugins(options = {}) {
   try {
      const params = new URLSearchParams();
      if (options.url) params.set("url", options.url);
      if (options.status) params.set("status", options.status);
      if (!options.url) params.set("network", "1");
      const path =
         "/api/wordpress/plugins" +
         (params.toString() ? `?${params}` : "");
      const res = await adminApiFetch(path);
      const data = await parseJson(res);
      if (!data.success) {
         throw new Error(data.stderr || data.error || "Erreur API");
      }
      return {
         plugins: data.plugins || [],
         summary: data.summary || null,
         errors: data.errors || [],
      };
   } catch (err) {
      console.error("wordpressPlugins:", err.message);
      throw err;
   }
}

/**
 * Met à jour un plugin WordPress via WP-CLI
 */
export async function wordpressPluginUpdate(options = {}) {
   try {
      const res = await adminApiFetch("/api/wordpress/plugins/update", {
         method: "POST",
         body: JSON.stringify({
            plugin: options.plugin,
            url: options.url || null,
         }),
      });
      const data = await parseJson(res);
      if (!data.success) {
         throw new Error(
            data.error || data.stderr || "Erreur lors de la mise à jour",
         );
      }
      return { success: true };
   } catch (err) {
      console.error("wordpressPluginUpdate:", err.message);
      throw err;
   }
}
