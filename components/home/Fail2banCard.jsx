"use client";

import Link from "next/link";
import {
   Card,
   CardHeader,
   CardTitle,
   CardAction,
   CardContent,
} from "@/components/ui/card";
import { ShieldBan, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { getFail2banStatus } from "@/app/actions/security";
import { useCachedSWR } from "@/hooks/use-cached-swr";

export const FAIL2BAN_HOME_KEY = "vps-fail2ban-home";

export default function Fail2banCard() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      mutate,
   } = useCachedSWR(FAIL2BAN_HOME_KEY, () => getFail2banStatus());
   const error = fetchError?.message || null;

   const jails = data?.jails || [];
   const total24h =
      data?.bans24hTotal ??
      jails.reduce((s, j) => s + (Number(j.bans24h) || 0), 0);

   async function load(e) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
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

   return (
      <Link href="/vps/securite/fail2ban">
         <Card className="h-full cursor-pointer hover:border-muted-foreground/30 transition-colors">
            <CardHeader>
               <CardTitle className="flex items-center gap-1.5 md:gap-2 min-w-0">
                  <ShieldBan
                     size={32}
                     className="size-8 shrink-0 text-red-500 p-1.5 md:p-2 bg-red-500/10 border border-red-500/20 rounded-md md:mr-2"
                  />
                  <span className="text-sm md:text-lg font-medium text-white truncate">
                     Fail2Ban
                  </span>
               </CardTitle>
               <CardAction>
                  {loading && !data ? (
                     <Loader2Icon className="size-5 md:size-6 animate-spin text-muted-foreground" />
                  ) : (
                     <span className="text-xl md:text-2xl font-bold tabular-nums">
                        {total24h}
                     </span>
                  )}
               </CardAction>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
               {loading && !data ? (
                  <p className="text-muted-foreground text-xs">Chargement...</p>
               ) : jails.length === 0 ? (
                  <p className="text-muted-foreground text-xs">Aucune jail</p>
               ) : (
                  jails.map((j) => (
                     <div
                        key={j.name}
                        className="flex items-center justify-between gap-2 w-full text-xs"
                     >
                        <span className="text-white/90 truncate font-mono">
                           {j.name}
                        </span>
                        <span className="tabular-nums shrink-0 text-muted-foreground">
                           {Number(j.bans24h) || 0}
                        </span>
                     </div>
                  ))
               )}
               {!loading && data?.running === false ? (
                  <p className="text-xs text-amber-500">Service arrêté</p>
               ) : null}
            </CardContent>
         </Card>
      </Link>
   );
}
