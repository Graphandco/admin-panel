"use server";

const CHECK_TIMEOUT_MS = 10000;

/**
 * Vérifie le statut HTTP d'une URL.
 * @returns {Promise<{ name: string, host: string, status: number | null }>}
 */
async function checkUrl({ name, host }) {
   try {
      const controller = new AbortController();
      const timeout = setTimeout(
         () => controller.abort(),
         CHECK_TIMEOUT_MS,
      );
      const res = await fetch(host, {
         method: "HEAD",
         signal: controller.signal,
         redirect: "follow",
         cache: "no-store",
      });
      clearTimeout(timeout);
      return { name, host, status: res.status };
   } catch {
      return { name, host, status: null };
   }
}

/**
 * Vérifie le statut HTTP de tous les sites.
 * @param {{ name: string, host: string }[]} sites
 */
export async function checkSitesStatus(sites) {
   const results = await Promise.all(sites.map(checkUrl));
   return results;
}
