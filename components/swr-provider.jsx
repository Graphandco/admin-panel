"use client";

import { useMemo, useState } from "react";
import { SWRConfig } from "swr";
import { manualSWRConfig } from "@/lib/swr";
import { useSettingsOptional } from "@/components/settings-provider";

const STORAGE_KEY = "admin-panel-swr-cache-v1";

const liveSWRConfig = {
   revalidateOnFocus: true,
   revalidateOnReconnect: true,
   revalidateIfStale: true,
   refreshInterval: 0,
   dedupingInterval: 2_000,
   shouldRetryOnError: false,
   keepPreviousData: true,
};

function createPersistedMap() {
   let entries = [];
   if (typeof window !== "undefined") {
      try {
         const raw = sessionStorage.getItem(STORAGE_KEY);
         const parsed = raw ? JSON.parse(raw) : [];
         if (Array.isArray(parsed)) entries = parsed;
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
   const cacheEnabled = ctx?.settings?.swrCacheEnabled !== false;
   const [provider] = useState(() => () => createPersistedMap());

   const value = useMemo(() => {
      if (cacheEnabled) {
         return { ...manualSWRConfig, provider };
      }
      clearPersistedCache();
      return { ...liveSWRConfig };
   }, [cacheEnabled, provider]);

   return <SWRConfig value={value}>{children}</SWRConfig>;
}
