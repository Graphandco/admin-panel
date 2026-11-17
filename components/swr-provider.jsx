"use client";

import { useMemo, useState } from "react";
import { SWRConfig } from "swr";
import { manualSWRConfig, mobileSWRConfig } from "@/lib/swr";
import { useSettingsOptional } from "@/components/settings-provider";
import { useIsMobile } from "@/hooks/use-mobile";

const STORAGE_KEY = "admin-panel-swr-cache-v1";

/** Clés trop volatiles pour le cache session (badges / alertes). */
const NEVER_PERSIST_KEYS = new Set(["notification-counts", "alerts-overview"]);

function createPersistedMap() {
   let entries = [];
   if (typeof window !== "undefined") {
      try {
         const raw = sessionStorage.getItem(STORAGE_KEY);
         const parsed = raw ? JSON.parse(raw) : [];
         if (Array.isArray(parsed)) {
            entries = parsed.filter(([key]) => !NEVER_PERSIST_KEYS.has(key));
         }
      } catch {
         entries = [];
      }
   }

   const map = new Map(entries);

   const persist = () => {
      if (typeof window === "undefined") return;
      try {
         const serializable = [];
         for (const [key, value] of map.entries()) {
            if (NEVER_PERSIST_KEYS.has(key)) continue;
            if (!value || typeof value !== "object") continue;
            serializable.push([
               key,
               {
                  ...value,
                  isValidating: false,
                  isLoading: false,
                  error: undefined,
               },
            ]);
         }
         sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
      } catch {
         /* quota */
      }
   };

   const origSet = map.set.bind(map);
   const origDelete = map.delete.bind(map);
   const origClear = map.clear.bind(map);

   map.set = (key, value) => {
      origSet(key, value);
      persist();
      return map;
   };
   map.delete = (key) => {
      const ok = origDelete(key);
      persist();
      return ok;
   };
   map.clear = () => {
      origClear();
      persist();
   };

   return map;
}

function clearPersistedCache() {
   try {
      sessionStorage.removeItem(STORAGE_KEY);
   } catch {
      /* ignore */
   }
}

export function SwrProvider({ children }) {
   const ctx = useSettingsOptional();
   const isMobile = useIsMobile();
   const settingsCache = ctx?.settings?.swrCacheEnabled !== false;
   const [provider] = useState(() => () => createPersistedMap());

   const value = useMemo(() => {
      // Cache désactivé dans les réglages → mode live sans sessionStorage
      if (!settingsCache) {
         clearPersistedCache();
         return {
            ...mobileSWRConfig,
            // desktop live: un peu plus agressif sur le focus
            revalidateOnFocus: !isMobile,
         };
      }

      // Mobile / PWA : garder le cache session (évite fail-to-fetch à froid),
      // mais revalider en arrière-plan + retries réseau.
      if (isMobile) {
         return { ...mobileSWRConfig, provider };
      }

      // Desktop : cache manuel (pas de refetch auto)
      return { ...manualSWRConfig, provider };
   }, [settingsCache, isMobile, provider]);

   return <SWRConfig value={value}>{children}</SWRConfig>;
}
