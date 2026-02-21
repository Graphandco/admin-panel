"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getTailnetInfo } from "@/app/actions/tailscale";
import { StatusCards } from "@/components/tailscale/StatusCards";
import { DevicesTab, isDeviceActive } from "@/components/tailscale/DevicesTab";
import { buttonVariants } from "@/components/ui/button";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <button
         onClick={load}
         disabled={loading}
         className={cn(buttonVariants({}))}
      >
         {loading ? (
            <Loader2Icon className="size-4 mr-1 animate-spin" />
         ) : (
            <RefreshCwIcon className="size-4 mr-1" />
         )}
         Actualiser
      </button>
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
