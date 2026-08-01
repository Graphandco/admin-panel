"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getTailnetInfo } from "@/app/actions/tailscale";
import { StatusCards } from "@/components/tailscale/StatusCards";
import { DevicesTab, isDeviceActive } from "@/components/tailscale/DevicesTab";
import RefreshButton from "@/components/refresh-button";

export default function TailscalePage() {
   const [devices, setDevices] = useState([]);
   const [tailnet, setTailnet] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [mounted, setMounted] = useState(false);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const info = await getTailnetInfo();
         if (info.error) {
            setError(info.error);
            setDevices([]);
            setTailnet(info.tailnet);
         } else {
            setDevices(info.devices ?? []);
            setTailnet(info.tailnet);
         }
      } catch (err) {
         setError(err.message ?? "Erreur lors du chargement");
         setDevices([]);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      setMounted(true);
      load();
   }, []);

   const active = devices.filter(isDeviceActive).length;
   const inactive = devices.length - active;

   const refreshButton = (
      <RefreshButton onClick={load} loading={loading} />
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
