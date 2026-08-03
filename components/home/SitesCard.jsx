"use client";

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
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { AGENCE_SITES_KEY } from "@/components/agence/SitesPage";

export default function SitesCard() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      mutate,
   } = useCachedSWR(AGENCE_SITES_KEY, () => agenceSitesList());
   const summary = data?.summary;
   const sites = data?.sites || [];
   const error = fetchError?.message || null;

   async function load() {
      await mutate();
   }

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

   const total = summary?.total ?? sites.length;
   const up = (summary?.up || 0) + (summary?.slow || 0);
   const down = summary?.down ?? 0;
   const boTotal = sites.filter((s) => s.backoffice?.trim()).length;
   const boUp = sites.filter((s) => {
      const st = s.monitor?.backoffice?.state;
      return st === "up" || st === "slow";
   }).length;

   return (
      <Link href="/monitoring/sites">
         <Card className="h-full cursor-pointer hover:border-muted-foreground/30 transition-colors">
            <CardHeader>
               <CardTitle className="flex items-center gap-1.5 md:gap-2 min-w-0">
                  <Globe
                     size={32}
                     className="size-8 md:size-8 shrink-0 text-emerald-500 p-1.5 md:p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md md:mr-2"
                  />
                  <span className="text-sm md:text-lg font-medium text-white truncate">
                     Sites
                  </span>
               </CardTitle>
               <CardAction>
                  {loading ? (
                     <Loader2Icon className="size-5 md:size-6 animate-spin text-muted-foreground" />
                  ) : (
                     <span className="text-xl md:text-2xl font-bold tabular-nums">
                        {up}
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
                           {up}
                        </span>{" "}
                        en ligne ·{" "}
                        <span
                           className={
                              down > 0
                                 ? "text-red-500 font-medium"
                                 : "text-slate-500 font-medium"
                           }
                        >
                           {down}
                        </span>{" "}
                        down
                        {summary?.avgMs != null ? (
                           <span className="hidden sm:inline">
                              {" "}
                              · {summary.avgMs} ms moy.
                           </span>
                        ) : null}
                     </>
                  )}
               </p>
            </CardContent>
            {!loading && boTotal > 0 && (
               <CardFooter className="hidden md:flex flex-wrap gap-1.5 text-xs text-muted-foreground bg-transparent">
                  <span>
                     {boUp}/{boTotal} backoffice
                     {boTotal > 1 ? "s" : ""} OK
                  </span>
                  <span className="opacity-50">· {total} sites</span>
               </CardFooter>
            )}
         </Card>
      </Link>
   );
}
