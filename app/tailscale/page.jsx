"use client";

import { useEffect, useState } from "react";
import { getTailnetInfo } from "@/app/actions/tailscale";
import { StatusCards } from "@/components/tailscale/StatusCards";
import { DevicesTab, isDeviceActive } from "@/components/tailscale/DevicesTab";

export default function TailscalePage() {
   const [devices, setDevices] = useState([]);
   const [tailnet, setTailnet] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

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
      load();
   }, []);

   const active = devices.filter(isDeviceActive).length;
   const inactive = devices.length - active;

   return (
      <>
         <StatusCards
            total={devices.length}
            active={active}
            inactive={inactive}
            loading={loading}
            onRefresh={load}
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
