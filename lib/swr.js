/**
 * Options SWR : cache entre navigations.
 * - 1er visit d'une clé → fetch
 * - revisite / focus / reconnect → pas de refetch
 * - Actualiser → mutate()
 * - F5 → sessionStorage restaure le cache (provider), sinon refetch
 */
export const manualSWRConfig = {
   revalidateOnFocus: false,
   revalidateOnReconnect: false,
   revalidateIfStale: false,
   revalidateOnMount: undefined,
   refreshInterval: 0,
   dedupingInterval: 2_000,
   shouldRetryOnError: true,
   errorRetryCount: 2,
   errorRetryInterval: 1_500,
   keepPreviousData: true,
};

/**
 * Mobile / PWA : affiche le cache si présent, rafraîchit en soft,
 * retries sur erreurs réseau (évite les "Failed to fetch" figés).
 */
export const mobileSWRConfig = {
   revalidateOnFocus: false,
   revalidateOnReconnect: true,
   revalidateIfStale: true,
   revalidateOnMount: true,
   refreshInterval: 0,
   dedupingInterval: 5_000,
   shouldRetryOnError: true,
   errorRetryCount: 3,
   errorRetryInterval: 2_000,
   keepPreviousData: true,
};
