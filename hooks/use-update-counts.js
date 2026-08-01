"use client";

import useSWR, { mutate as globalMutate } from "swr";
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

async function fetchCounts() {
   return getNotificationCounts();
}

export function useUpdateCounts() {
   return useSWR(UPDATE_COUNTS_KEY, fetchCounts, {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 0,
      dedupingInterval: 10_000,
      fallbackData: empty,
   });
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
   await globalMutate(UPDATE_COUNTS_KEY, data, false);
   return data;
}
