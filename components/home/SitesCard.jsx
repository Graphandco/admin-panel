"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
   Card,
   CardHeader,
   CardTitle,
   CardAction,
   CardContent,
   CardFooter,
} from "@/components/ui/card";
import { Globe, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { agenceSitesList } from "@/app/actions/agence-sites";
import { checkHomepageSitesStats } from "@/app/actions/sites";

export default function SitesCard() {
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const websites = await agenceSitesList();
         const result = await checkHomepageSitesStats(websites);
         setStats(result);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
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

   const total = stats?.sitesTotal ?? 0;
   const active = stats?.sitesActive ?? 0;
   const inactive = total - active;
   const backofficesActive = stats?.backofficesActive ?? 0;
   const backofficesTotal = stats?.backofficesTotal ?? 0;

   return (
      <Link href="/agence/sites">
         <Card className="h-full cursor-pointer hover:border-muted-foreground/30 transition-colors">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Globe
                     size={32}
                     className="text-emerald-500 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md mr-2"
                  />
                  <span className="text-lg font-medium text-white">Sites</span>
               </CardTitle>
               <CardAction>
                  {loading ? (
                     <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                  ) : (
                     <span className="text-2xl font-bold">{active}</span>
                  )}
               </CardAction>
            </CardHeader>
            <CardContent className="space-y-1">
               <p className="text-muted-foreground text-sm">
                  {loading ? (
                     "Chargement..."
                  ) : (
                     <>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                           {active}
                        </span>{" "}
                        actifs ·{" "}
                        <span className="text-slate-500 font-medium">
                           {inactive}
                        </span>{" "}
                        inactifs
                     </>
                  )}
               </p>
            </CardContent>
            {!loading && backofficesTotal > 0 && (
               <CardFooter className="flex flex-wrap gap-1.5 text-xs text-muted-foreground bg-transparent">
                  <span>
                     {backofficesActive}/{backofficesTotal} backoffice
                     {backofficesTotal > 1 ? "s" : ""} actif
                     {backofficesTotal > 1 ? "s" : ""}
                  </span>
               </CardFooter>
            )}
         </Card>
      </Link>
   );
}
