"use client";

import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react";
import {
   getAdminSettings,
   updateAdminSettings,
} from "@/app/actions/settings";
import {
   normalizeUiDensity,
   persistUiDensity,
   readStoredUiDensity,
} from "@/lib/ui-density";

const SettingsContext = createContext(null);

const FALLBACK = {
   swrCacheEnabled: true,
   vpsAlertCpuPercent: 90,
   vpsAlertRamPercent: 90,
   vpsAlertDiskPercent: 85,
   telegramSites: true,
   telegramVps: true,
   telegramDocker: true,
   telegramBuildCache: true,
   siteMonitorIntervalMinutes: 5,
   updateChecksIntervalHours: 6,
   autoRefreshEnabled: false,
   autoRefreshSeconds: 60,
   buildCacheAlertGb: 20,
   uiDensity: "comfortable",
};

function initialSettings() {
   const stored = readStoredUiDensity();
   if (!stored) return FALLBACK;
   return { ...FALLBACK, uiDensity: stored };
}

export function SettingsProvider({ children }) {
   const [settings, setSettings] = useState(initialSettings);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const reload = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const s = await getAdminSettings();
         const next = {
            ...FALLBACK,
            ...s,
            uiDensity: normalizeUiDensity(s?.uiDensity),
         };
         setSettings(next);
         persistUiDensity(next.uiDensity);
      } catch (err) {
         setError(err.message || "Erreur chargement réglages");
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      const stored = readStoredUiDensity();
      if (stored) persistUiDensity(stored);
   }, []);

   useEffect(() => {
      reload();
   }, [reload]);

   const save = useCallback(async (partial) => {
      const res = await updateAdminSettings(partial);
      if (!res.success) {
         return res;
      }
      const next = {
         ...FALLBACK,
         ...res.settings,
         uiDensity: normalizeUiDensity(res.settings?.uiDensity),
      };
      setSettings(next);
      persistUiDensity(next.uiDensity);
      return res;
   }, []);

   const value = useMemo(
      () => ({
         settings,
         loading,
         error,
         reload,
         save,
      }),
      [settings, loading, error, reload, save],
   );

   return (
      <SettingsContext.Provider value={value}>
         {children}
      </SettingsContext.Provider>
   );
}

export function useSettings() {
   const ctx = useContext(SettingsContext);
   if (!ctx) {
      throw new Error("useSettings must be used within SettingsProvider");
   }
   return ctx;
}

/** Safe for components that may render outside provider during SSR edge cases */
export function useSettingsOptional() {
   return useContext(SettingsContext);
}
