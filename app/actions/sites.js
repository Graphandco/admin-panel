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
 * Vérifie le statut HTTP d'une URL avec mesure du temps de réponse.
 */
async function checkUrlWithTiming({ name, host }) {
   const start = performance.now();
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
      const responseTimeMs = Math.round(performance.now() - start);
      return { name, host, status: res.status, responseTimeMs };
   } catch {
      const responseTimeMs = Math.round(performance.now() - start);
      return { name, host, status: null, responseTimeMs };
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

/**
 * Vérifie le statut des sites et backoffices pour la page d'accueil.
 * @param {{ address: string, backoffice?: string }[]} websites
 * @returns {{ sitesActive: number, sitesTotal: number, backofficesActive: number, backofficesTotal: number }}
 */
export async function checkHomepageSitesStats(websites) {
   const sitesToCheck = websites
      .filter((w) => w.address?.trim())
      .map((w) => ({
         host: w.address.startsWith("http") ? w.address : `https://${w.address}`,
      }));
   const backofficesToCheck = websites
      .filter((w) => w.backoffice?.trim())
      .map((w) => ({
         host: w.backoffice.startsWith("http")
            ? w.backoffice
            : `https://${w.backoffice}`,
      }));

   const [siteResults, backofficeResults] = await Promise.all([
      Promise.all(sitesToCheck.map((s) => checkUrl({ name: "", host: s.host }))),
      Promise.all(
         backofficesToCheck.map((s) => checkUrl({ name: "", host: s.host })),
      ),
   ]);

   const sitesActive = siteResults.filter((r) => r.status === 200).length;
   const backofficesActive = backofficeResults.filter(
      (r) => r.status === 200,
   ).length;

   return {
      sitesActive,
      sitesTotal: sitesToCheck.length,
      backofficesActive,
      backofficesTotal: backofficesToCheck.length,
   };
}

/**
 * Vérifie le statut et le temps de réponse des sites Agence.
 * @param {{ id: number, address: string, ... }[]} sites
 */
export async function checkAgenceSitesStatus(sites) {
   const toCheck = sites
      .filter((s) => s.address?.trim())
      .map((s) => ({
         id: s.id,
         name: s.address,
         host: s.address.startsWith("http") ? s.address : `https://${s.address}`,
      }));
   const results = await Promise.all(
      toCheck.map(async (item) => {
         const { id, name, host } = item;
         const { status, responseTimeMs } = await checkUrlWithTiming({
            name,
            host,
         });
         return { id, host, status, responseTimeMs };
      }),
   );
   return results;
}
