"use client";

import { useEffect } from "react";
import { useSettingsOptional } from "@/components/settings-provider";

/**
 * Déclenche mutate() périodiquement si auto-refresh est activé dans les réglages.
 * @param {() => void | Promise<void>} mutate
 */
export function useAutoRefresh(mutate) {
   const ctx = useSettingsOptional();
   const enabled = ctx?.settings?.autoRefreshEnabled;
   const seconds = ctx?.settings?.autoRefreshSeconds || 60;

   useEffect(() => {
      if (!enabled || !mutate) return;
      const ms = Math.max(15, seconds) * 1000;
      const id = setInterval(() => {
         try {
            mutate();
         } catch {
            /* ignore */
         }
      }, ms);
      return () => clearInterval(id);
   }, [enabled, seconds, mutate]);
}
