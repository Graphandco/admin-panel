export const UI_DENSITY_STORAGE_KEY = "admin-ui-density";
export const UI_DENSITY_COOKIE = "admin-ui-density";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function normalizeUiDensity(value) {
   return value === "compact" ? "compact" : "comfortable";
}

/** @returns {"compact"|"comfortable"|null} */
export function readStoredUiDensity() {
   if (typeof window === "undefined") return null;
   try {
      const raw = localStorage.getItem(UI_DENSITY_STORAGE_KEY);
      if (raw === "compact" || raw === "comfortable") return raw;
   } catch {
      /* ignore */
   }
   return null;
}

/** Persist density for next document request (cookie) + same-tab (localStorage). */
export function persistUiDensity(value) {
   const density = normalizeUiDensity(value);
   if (typeof document !== "undefined") {
      document.documentElement.dataset.density = density;
      document.cookie = `${UI_DENSITY_COOKIE}=${density};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
   }
   if (typeof window !== "undefined") {
      try {
         localStorage.setItem(UI_DENSITY_STORAGE_KEY, density);
      } catch {
         /* ignore */
      }
   }
   return density;
}

/** Inline head script: apply density before first paint when cookie SSR missed. */
export const UI_DENSITY_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(UI_DENSITY_STORAGE_KEY)};var d=localStorage.getItem(k);if(d==="compact"||d==="comfortable")document.documentElement.dataset.density=d;}catch(e){}})();`;
