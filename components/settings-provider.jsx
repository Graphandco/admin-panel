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

export function SettingsProvider({ children }) {
   const [settings, setSettings] = useState(FALLBACK);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const reload = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const s = await getAdminSettings();
         setSettings({ ...FALLBACK, ...s });
      } catch (err) {
         setError(err.message || "Erreur chargement réglages");
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      reload();
   }, [reload]);

   useEffect(() => {
      if (typeof document === "undefined") return;
      document.documentElement.dataset.density =
         settings.uiDensity === "compact" ? "compact" : "comfortable";
   }, [settings.uiDensity]);

   const save = useCallback(async (partial) => {
      const res = await updateAdminSettings(partial);
      if (!res.success) {
         return res;
      }
      setSettings({ ...FALLBACK, ...res.settings });
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
