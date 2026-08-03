"use client";

import Link from "next/link";
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

function InfoCard({ title, icon: Icon, iconClass, value, sub, loading }) {
   return (
      <Card className="h-full min-w-0">
         <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 min-w-0">
               <Icon
                  size={32}
                  className={`size-8 shrink-0 p-1.5 md:p-2 border rounded-md md:mr-1 ${iconClass}`}
               />
               <span className="text-sm md:text-lg font-medium text-white truncate">
                  {title}
               </span>
            </CardTitle>
         </CardHeader>
         <CardContent className="space-y-1">
            {loading ? (
               <Loader2Icon className="size-4 md:size-5 animate-spin text-muted-foreground" />
            ) : (
               <>
                  <p className="text-xs md:text-base font-semibold text-foreground leading-snug wrap-break-word line-clamp-3 md:line-clamp-none">
                     {value || "—"}
                  </p>
                  {sub ? (
                     <p className="text-[10px] md:text-xs text-muted-foreground">
                        {sub}
                     </p>
                  ) : null}
               </>
            )}
         </CardContent>
      </Card>
   );
}

export default function SystemInfoHomeCards() {
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

   const cpuSub =
      host?.cores || host?.cpuCores
         ? `${host.cores ?? host.cpuCores} cœur${
              (host.cores ?? host.cpuCores) > 1 ? "s" : ""
           }${
              host.threads && host.threads !== (host.cores ?? host.cpuCores)
                 ? ` · ${host.threads} threads`
                 : " vCPU"
           }`
         : null;

   return (
      <Link
         href="/vps/stats"
         className="grid gap-3 md:gap-6 grid-cols-2 md:grid-cols-3 min-w-0 cursor-pointer"
      >
         <InfoCard
            title="Système"
            icon={MonitorIcon}
            iconClass="text-violet-500 bg-violet-500/10 border-violet-500/20"
            value={host?.os}
            loading={loading}
         />
         <InfoCard
            title="Kernel"
            icon={ServerIcon}
            iconClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
            value={host?.kernel}
            loading={loading}
         />
         <InfoCard
            title="Processeur"
            icon={CpuIcon}
            iconClass="text-sky-500 bg-sky-500/10 border-sky-500/20"
            value={host?.cpu || host?.cpuModel}
            sub={cpuSub}
            loading={loading}
         />
      </Link>
   );
}
