"use client";

import useSWR from "swr";

/**
 * useSWR utilisant la config globale (SwrProvider).
 * Cache on/off = réglages → SWRConfig.
 * Actualiser = mutate().
 */
export function useCachedSWR(key, fetcher, options = {}) {
   return useSWR(key, fetcher, options);
}
