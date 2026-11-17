"use client";

import { useCachedSWR } from "@/hooks/use-cached-swr";
import { getAlertsOverview } from "@/app/actions/alerts";

export const ALERTS_OVERVIEW_KEY = "alerts-overview";

const empty = {
   checkedAt: null,
   total: 0,
   critical: 0,
   warnings: 0,
   items: [],
   summary: {
      sitesDown: 0,
      sitesSlow: 0,
      containersDown: 0,
      vpsAlerts: 0,
      sitesTotal: 0,
   },
};

export function useAlertsOverview() {
   const swr = useCachedSWR(ALERTS_OVERVIEW_KEY, () => getAlertsOverview(), {
      dedupingInterval: 30_000,
      revalidateIfStale: true,
      revalidateOnMount: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
   });
   return {
      ...swr,
      data: swr.data ?? empty,
   };
}
