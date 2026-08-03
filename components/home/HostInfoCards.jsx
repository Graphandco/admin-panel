"use client";

import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSystemStats } from "@/app/actions/system";
import {
   CpuIcon,
   Loader2Icon,
   MonitorIcon,
   RefreshCwIcon,
   ServerIcon,
} from "lucide-react";

function InfoCard({ title, icon: Icon, value, loading, subtitle }) {
   return (
      <Card className="h-full min-w-0">
         <CardHeader className="py-3 px-4 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
               <Icon className="size-4 shrink-0" />
               {title}
            </CardTitle>
         </CardHeader>
         <CardContent className="px-4 pb-4 pt-1">
            {loading ? (
               <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
            ) : (
               <>
                  <p
                     className="text-base font-semibold text-white leading-snug wrap-break-word"
                     title={value || undefined}
                  >
                     {value || "—"}
                  </p>
                  {subtitle ? (
                     <p className="text-xs text-muted-foreground mt-1">
                        {subtitle}
                     </p>
                  ) : null}
               </>
            )}
         </CardContent>
      </Card>
   );
}

export default function HostInfoCards() {
   const {
      data: stats,
      error: fetchError,
      isLoading: loading,
      mutate,
   } = useCachedSWR("vps-stats", () => getSystemStats());
   const host = stats?.host || null;
   const error = fetchError?.message || null;

   async function load() {
      await mutate();
   }

   if (error) {
      return (
         <Card>
            <CardContent className="py-4 text-destructive text-sm flex items-center gap-3">
               <p>{error}</p>
               <button
                  onClick={load}
                  className="inline-flex items-center gap-1 underline"
               >
                  <RefreshCwIcon className="size-4" />
                  Réessayer
               </button>
            </CardContent>
         </Card>
      );
   }

   const cpuSubtitle =
      host?.cores || host?.threads
         ? [
              host.cores
                 ? `${host.cores} cœur${host.cores > 1 ? "s" : ""}`
                 : null,
              host.threads && host.threads !== host.cores
                 ? `${host.threads} threads`
                 : null,
           ]
              .filter(Boolean)
              .join(" · ")
         : null;

   return (
      <div className="grid gap-6 sm:grid-cols-3">
         <InfoCard
            title="Système"
            icon={MonitorIcon}
            value={host?.os}
            loading={loading}
         />
         <InfoCard
            title="Kernel"
            icon={ServerIcon}
            value={host?.kernel}
            loading={loading}
         />
         <InfoCard
            title="Processeur"
            icon={CpuIcon}
            value={host?.cpu}
            subtitle={cpuSubtitle}
            loading={loading}
         />
      </div>
   );
}
