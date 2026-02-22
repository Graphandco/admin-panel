"use client";

import { useEffect, useState } from "react";
import {
   Card,
   CardHeader,
   CardTitle,
   CardAction,
   CardContent,
} from "@/components/ui/card";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { wordpressSites } from "@/app/actions/wordpress";
import Image from "next/image";

export default function SitesRecapCard() {
   const [sites, setSites] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const list = await wordpressSites();
         setSites(list);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      load();
   }, []);

   const count = sites.length;

   if (error) {
      return (
         <Card>
            <CardContent className="py-6">
               <div className="text-destructive flex items-center gap-3">
                  <p>{error}</p>
                  <button
                     onClick={load}
                     className="inline-flex items-center gap-1 text-sm underline"
                  >
                     <RefreshCwIcon className="size-4" />
                     Réessayer
                  </button>
               </div>
            </CardContent>
         </Card>
      );
   }

   return (
      <Card className="h-min">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <div className="size-10 p-2 bg-[#21759b]/10 border border-[#21759b]/20 rounded-md flex items-center justify-center">
                  <Image
                     src="/wordpress.svg"
                     alt="WordPress"
                     width={28}
                     height={28}
                     className="opacity-90"
                  />
               </div>
               <span className="text-lg font-medium text-white">
                  Sites multisite
               </span>
            </CardTitle>
            <CardAction>
               {loading ? (
                  <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
               ) : (
                  <span className="text-2xl font-bold">{count}</span>
               )}
            </CardAction>
         </CardHeader>
         <CardContent>
            <p className="text-muted-foreground text-sm">
               {count} site{count > 1 ? "s" : ""} dans le réseau
            </p>
         </CardContent>
      </Card>
   );
}
