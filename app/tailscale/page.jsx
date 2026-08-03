"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { getTailnetInfo } from "@/app/actions/tailscale";
import { StatusCards } from "@/components/tailscale/StatusCards";
import { DevicesTab, isDeviceActive } from "@/components/tailscale/DevicesTab";
import RefreshButton from "@/components/refresh-button";

export default function TailscalePage() {
   const {
      data: info,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("tailscale-info", () => getTailnetInfo());
   const devices = info?.error ? [] : (info?.devices ?? []);
   const tailnet = info?.tailnet ?? null;
   const error = info?.error || fetchError?.message || null;
   const [mounted, setMounted] = useState(false);

   async function load() {
      await mutate();
   }

   useEffect(() => {
      setMounted(true);
   }, []);

   const active = devices.filter(isDeviceActive).length;
   const inactive = devices.length - active;

   const refreshButton = (
      <RefreshButton onClick={load} loading={loading || isValidating} />
   );

   return (
      <>
         {mounted &&
            typeof document !== "undefined" &&
            createPortal(
               refreshButton,
               document.getElementById("tailscale-refresh-portal"),
            )}
         <StatusCards
            total={devices.length}
            active={active}
            inactive={inactive}
         />
         <DevicesTab
            devices={devices}
            tailnet={tailnet}
            loading={loading}
            error={error}
            onRefresh={load}
         />
      </>
   );
}
