"use client";

import { mutate as globalMutate } from "swr";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import {
   getNotificationCounts,
   refreshNotificationCounts,
} from "@/app/actions/notifications";

export const UPDATE_COUNTS_KEY = "notification-counts";

const empty = {
   apt: 0,
   docker: 0,
   wordpress: 0,
   total: 0,
   checkedAt: null,
   items: [
      {
         id: "apt",
         label: "Paquets système",
         count: 0,
         href: "/vps/securite/mises-a-jour",
      },
      {
         id: "docker",
         label: "Images Docker",
         count: 0,
         href: "/docker/registry",
      },
      {
         id: "wordpress",
         label: "Plugins WordPress",
         count: 0,
         href: "/wordpress/plugins",
      },
   ],
};

export function useUpdateCounts() {
   // Pas de fallbackData : avec revalidateIfStale:false, empty serait
   // traité comme cache et bloquerait le 1er fetch / écraserait l'UI.
   const swr = useCachedSWR(UPDATE_COUNTS_KEY, () => getNotificationCounts(), {
      dedupingInterval: 10_000,
   });
   return {
      ...swr,
      data: swr.data ?? empty,
   };
}

/** Recharge les compteurs depuis la DB (après upgrade). */
export function mutateUpdateCounts() {
   return globalMutate(UPDATE_COUNTS_KEY);
}

/**
 * Force un rescan API puis met à jour le cache SWR.
 * @param {'apt'|'docker'|'wordpress'|null} [kind]
 */
export async function refreshAndMutateUpdateCounts(kind = null) {
   const data = await refreshNotificationCounts(kind);
   await globalMutate(UPDATE_COUNTS_KEY, data, { revalidate: false });
   return data;
}
