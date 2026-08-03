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
   shouldRetryOnError: false,
   keepPreviousData: true,
};
