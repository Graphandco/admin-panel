"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { getSystemStats } from "@/app/actions/system";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const chartConfig = {
   used: { label: "Utilisée", color: "#ef4444" },
   free: { label: "Libre", color: "#22c55e" },
};

const PROCESS_COLORS = [
   "#ef4444",
   "#f97316",
   "#eab308",
   "#84cc16",
   "#22c55e",
];

function formatBytes(val) {
   if (val == null || val < 1024) return `${val} B`;
   const k = 1024;
   const sizes = ["B", "KB", "MB", "GB", "TB"];
   const i = Math.floor(Math.log(val) / Math.log(k));
   return `${(val / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function tooltipFormatter(value) {
   if (typeof value === "number" && value >= 1024) return formatBytes(value);
   if (typeof value === "number" && value <= 100) return `${value} %`;
   return value?.toLocaleString?.() ?? value;
}

function StatMiniCard({ title, data, fillUsed, loading, isMobile }) {
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
   const free = Math.max(0, total - used);
   const chartData = [
      { name: "used", value: used, fill: fillUsed },
      { name: "free", value: free, fill: "#22c55e" },
   ];
   const percent = total > 0 ? Math.round((used / total) * 100) : 0;
   const displayPercent = data.percent ?? percent;
   const label =
      total >= 1024
         ? `${formatBytes(used)} / ${formatBytes(total)} (${displayPercent}%)`
         : `${displayPercent}%`;

   return (
      <Card className="h-full min-w-0">
         <CardHeader className="py-1.5 px-2 md:py-2 md:px-3">
            <CardTitle className="text-xs md:text-sm font-medium text-white">
               {title}
            </CardTitle>
         </CardHeader>
         <CardContent className="px-1.5 pb-2 pt-0 md:px-2 md:pb-3 flex flex-col items-center">
            <ChartContainer
               config={chartConfig}
               className={cn(
                  "mx-auto !aspect-square !min-h-0 w-full p-0",
                  isMobile ? "max-w-[56px]" : "max-w-[96px]",
               )}
            >
               <PieChart
                  accessibilityLayer
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
               >
                  <Pie
                     data={chartData}
                     dataKey="value"
                     nameKey="name"
                     cx="50%"
                     cy="50%"
                     innerRadius="58%"
                     outerRadius="88%"
                     paddingAngle={2}
                  >
                     {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                     ))}
                  </Pie>
                  <ChartTooltip
                     content={
                        <ChartTooltipContent
                           formatter={tooltipFormatter}
                           nameKey="name"
                        />
                     }
                  />
               </PieChart>
            </ChartContainer>
            <p className="text-center text-[10px] md:text-xs font-medium text-foreground mt-0.5 md:mt-1 w-full leading-tight break-words">
               {label}
            </p>
         </CardContent>
      </Card>
   );
}

function TopProcMiniCard({ processes, loading, isMobile }) {
   const chartData = (processes || []).map((p, i) => ({
      name: p.name,
      value: p.rss,
      fill: PROCESS_COLORS[i % PROCESS_COLORS.length],
   }));
   const total = chartData.reduce((s, p) => s + p.value, 0);

   if (loading || chartData.length === 0) {
      return (
         <Card className="h-full min-w-0">
            <CardHeader className="py-1.5 px-2 md:py-2 md:px-3">
               <CardTitle className="text-[11px] md:text-xs font-medium text-muted-foreground">
                  Top process
               </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-3 md:py-4">
               {loading ? (
                  <Loader2Icon className="size-5 md:size-6 animate-spin text-muted-foreground" />
               ) : (
                  <span className="text-xs text-muted-foreground">—</span>
               )}
            </CardContent>
         </Card>
      );
   }

   return (
      <Card className="h-full min-w-0">
         <CardHeader className="py-1.5 px-2 md:py-2 md:px-3">
            <CardTitle className="text-xs md:text-sm font-medium text-white">
               Top process
            </CardTitle>
         </CardHeader>
         <CardContent className="px-1.5 pb-2 pt-0 md:px-2 md:pb-3 flex flex-col items-center">
            <ChartContainer
               config={chartConfig}
               className={cn(
                  "mx-auto !aspect-square !min-h-0 w-full p-0",
                  isMobile ? "max-w-[56px]" : "max-w-[96px]",
               )}
            >
               <PieChart
                  accessibilityLayer
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
               >
                  <Pie
                     data={chartData}
                     dataKey="value"
                     nameKey="name"
                     cx="50%"
                     cy="50%"
                     innerRadius="58%"
                     outerRadius="88%"
                     paddingAngle={2}
                  >
                     {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                     ))}
                  </Pie>
                  <ChartTooltip
                     content={
                        <ChartTooltipContent
                           hideLabel
                           formatter={(value, name) => (
                              <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                                 <span className="text-muted-foreground">
                                    {name}
                                 </span>
                                 <span className="font-mono font-medium text-foreground tabular-nums">
                                    {formatBytes(value)}
                                 </span>
                              </div>
                           )}
                           nameKey="name"
                        />
                     }
                  />
               </PieChart>
            </ChartContainer>
            <p className="text-center text-[10px] md:text-xs font-medium text-foreground mt-0.5 md:mt-1 w-full leading-tight break-words">
               {formatBytes(total)}
            </p>
         </CardContent>
      </Card>
   );
}

export default function VpsStatsHomeCards() {
   const isMobile = useIsMobile();
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const data = await getSystemStats();
         setStats(data);
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
         className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-6 min-w-0 w-full cursor-pointer"
      >
         <StatMiniCard
            title="RAM"
            data={stats?.memory}
            fillUsed="#ef4444"
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
            fillUsed="#3b82f6"
            loading={loading}
            isMobile={isMobile}
         />
         <StatMiniCard
            title="Disque"
            data={stats?.disk}
            fillUsed="#ef4444"
            loading={loading}
            isMobile={isMobile}
         />
         <TopProcMiniCard
            processes={stats?.topRamProcesses}
            loading={loading}
            isMobile={isMobile}
         />
      </Link>
   );
}
