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

export async function getFail2banStatus() {
   try {
      const res = await adminApiFetch("/api/security/fail2ban");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur API");
      return data.data;
   } catch (err) {
      console.error("getFail2banStatus:", err.message);
      throw err;
   }
}

export async function getFirewallStatus() {
   try {
      const res = await adminApiFetch("/api/security/firewall");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur API");
      return data.data;
   } catch (err) {
      console.error("getFirewallStatus:", err.message);
      throw err;
   }
}

export async function getAptUpdates() {
   try {
      const res = await adminApiFetch("/api/security/updates");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur API");
      return data.data;
   } catch (err) {
      console.error("getAptUpdates:", err.message);
      throw err;
   }
}

/**
 * @param {{ package?: string, all?: boolean }} opts
 * @returns {Promise<{ success: boolean, error?: string, upgraded?: string[], message?: string, stdout?: string, stderr?: string }>}
 */
export async function upgradeAptPackages(opts) {
   try {
      const res = await adminApiFetch("/api/security/updates/upgrade", {
         method: "POST",
         body: JSON.stringify(opts),
      });
      let data;
      try {
         data = await res.json();
      } catch {
         return {
            success: false,
            error:
               res.status === 404
                  ? "Route API introuvable — redémarrer admin-api"
                  : `Réponse API invalide (${res.status})`,
         };
      }
      if (!data.success) {
         return {
            success: false,
            error: data.error || "Échec de la mise à jour",
            stdout: data.stdout,
            stderr: data.stderr,
         };
      }
      return { success: true, ...data.data };
   } catch (err) {
      console.error("upgradeAptPackages:", err.message);
      return {
         success: false,
         error: err.message || "Erreur réseau vers admin-api",
      };
   }
}

export async function getSshStatus() {
   try {
      const res = await adminApiFetch("/api/security/ssh");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur API");
      return data.data;
   } catch (err) {
      console.error("getSshStatus:", err.message);
      throw err;
   }
}
