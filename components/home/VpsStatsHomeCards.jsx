"use client";

import Link from "next/link";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSystemStats } from "@/app/actions/system";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SemiGauge } from "@/components/charts/semi-gauge";

function formatBytes(val) {
   if (val == null || val < 1024) return `${val} B`;
   const k = 1024;
   const sizes = ["B", "KB", "MB", "GB", "TB"];
   const i = Math.floor(Math.log(val) / Math.log(k));
   return `${(val / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function gaugeColor(percent) {
   if (percent >= 90) return "#ef4444";
   if (percent >= 75) return "#f59e0b";
   return "#22c55e";
}

function StatMiniCard({ title, data, loading, isMobile }) {
   if (loading || !data) {
      return (
         <Card className="h-full min-w-0">
            <CardHeader className="py-1.5 px-2 md:py-2 md:px-3">
               <CardTitle className="text-[11px] md:text-xs font-medium text-muted-foreground">
                  {title}
               </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-3 md:py-4">
               <Loader2Icon className="size-5 md:size-6 animate-spin text-muted-foreground" />
            </CardContent>
         </Card>
      );
   }
   const used = data.used ?? 0;
   const total = data.total ?? 1;
   const percent =
      data.percent != null
         ? Math.round(data.percent)
         : total > 0
           ? Math.round((used / total) * 100)
           : 0;
   const label =
      total >= 1024
         ? `${formatBytes(used)} / ${formatBytes(total)} (${percent}%)`
         : `${percent}%`;

   const size = isMobile ? 88 : 128;
   const gaugeH = Math.round(size * 0.62);

   return (
      <Card className="h-full min-w-0 overflow-visible">
         <CardHeader className="py-1 px-2 md:py-1.5 md:px-3">
            <CardTitle className="text-xs md:text-sm font-medium text-white">
               {title}
            </CardTitle>
         </CardHeader>
         <CardContent className="px-1 pb-2 pt-0 md:px-2 md:pb-2.5 flex flex-col items-center overflow-visible">
            <div className="w-full flex justify-center">
               <SemiGauge
                  value={percent}
                  width={size}
                  height={gaugeH}
                  startAngle={-110}
                  endAngle={110}
                  color={gaugeColor(percent)}
               />
            </div>
            <p className="text-center text-[10px] md:text-xs font-medium text-foreground mt-1 w-full leading-tight wrap-break-word">
               {label}
            </p>
         </CardContent>
      </Card>
   );
}

export default function VpsStatsHomeCards() {
   const isMobile = useIsMobile();
   const {
      data: stats,
      error: fetchError,
      isLoading: loading,
      mutate,
   } = useCachedSWR("vps-stats", () => getSystemStats());
   const error = fetchError?.message || null;

   async function load() {
      await mutate();
   }

   if (error) {
      return (
         <Card className="h-full">
            <CardContent className="py-4">
               <div className="text-destructive text-xs flex flex-col gap-2">
                  <p className="truncate">{error}</p>
                  <button
                     onClick={load}
                     className="inline-flex items-center gap-1 text-xs underline"
                  >
                     <RefreshCwIcon className="size-3" />
                     Réessayer
                  </button>
               </div>
            </CardContent>
         </Card>
      );
   }

   return (
      <Link
         href="/vps/stats"
         className="grid grid-cols-3 gap-2 md:gap-6 min-w-0 w-full cursor-pointer"
      >
         <StatMiniCard
            title="RAM"
            data={stats?.memory}
            loading={loading}
            isMobile={isMobile}
         />
         <StatMiniCard
            title="CPU"
            data={
               stats?.cpu
                  ? {
                       used: stats.cpu.percent,
                       total: 100,
                       percent: stats.cpu.percent,
                    }
                  : null
            }
            loading={loading}
            isMobile={isMobile}
         />
         <StatMiniCard
            title="Disque"
            data={stats?.disk}
            loading={loading}
            isMobile={isMobile}
         />
      </Link>
   );
}
