"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
   Card,
   CardHeader,
   CardTitle,
   CardAction,
   CardContent,
} from "@/components/ui/card";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { getTailnetInfo } from "@/app/actions/tailscale";
import { isDeviceActive } from "@/components/tailscale/DevicesTab";

export default function TailscaleCard() {
   const [info, setInfo] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const data = await getTailnetInfo();
         if (data.error) {
            setError(data.error);
            setInfo(null);
         } else {
            setInfo(data);
            setError(null);
         }
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
         setInfo(null);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      load();
   }, []);

   if (error) {
      return (
         <Card className="h-full">
            <CardContent className="py-4 md:py-6">
               <div className="text-destructive flex items-center gap-3">
                  <p className="text-xs md:text-sm">{error}</p>
                  <button
                     onClick={load}
                     className="inline-flex items-center gap-1 text-xs md:text-sm underline"
                  >
                     <RefreshCwIcon className="size-4" />
                     Réessayer
                  </button>
               </div>
            </CardContent>
         </Card>
      );
   }

   const devices = info?.devices ?? [];
   const total = devices.length;
   const connected = devices.filter(isDeviceActive).length;
   const inactive = total - connected;

   return (
      <Link href="/tailscale">
         <Card className="h-full cursor-pointer hover:border-muted-foreground/30 transition-colors">
            <CardHeader>
               <CardTitle className="flex items-center gap-1.5 md:gap-2 min-w-0">
                  <div className="size-8 shrink-0 p-1.5 md:p-2 bg-sky-500/10 border border-sky-500/20 rounded-md flex items-center justify-center md:mr-2">
                     <Image
                        src="/tailscale.png"
                        alt="Tailscale"
                        width={20}
                        height={20}
                        className="size-5"
                     />
                  </div>
                  <span className="text-sm md:text-lg font-medium text-white truncate">
                     Tailscale
                  </span>
               </CardTitle>
               <CardAction>
                  {loading ? (
                     <Loader2Icon className="size-5 md:size-6 animate-spin text-muted-foreground" />
                  ) : (
                     <span className="text-xl md:text-2xl font-bold tabular-nums">
                        {connected}
                     </span>
                  )}
               </CardAction>
            </CardHeader>
            <CardContent className="space-y-1">
               <p className="text-muted-foreground text-xs md:text-sm">
                  {loading ? (
                     "Chargement..."
                  ) : (
                     <>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                           {connected}
                        </span>{" "}
                        connectés ·{" "}
                        <span className="text-slate-500 font-medium">
                           {inactive}
                        </span>{" "}
                        inactifs
                     </>
                  )}
               </p>
            </CardContent>
         </Card>
      </Link>
   );
}
