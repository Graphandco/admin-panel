"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, Cell, XAxis, YAxis, PieChart, Pie } from "recharts";
import {
   dockerPs,
   dockerStatsAll,
   dockerContainerStats,
} from "@/app/actions/docker";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";

function getContainerName(names) {
   if (!names?.length) return "-";
   return names[0].replace(/^\//, "");
}

const chartConfigPie = {
   used: { label: "Utilisée", color: "#ef4444" },
   free: { label: "Libre", color: "#22c55e" },
};

function formatBytes(val) {
   if (val == null || val < 1024) return `${val} B`;
   const k = 1024;
   const sizes = ["B", "KB", "MB", "GB", "TB"];
   const i = Math.floor(Math.log(val) / Math.log(k));
   return `${(val / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatUptime(seconds) {
   if (seconds == null || seconds < 0) return "—";
   const days = Math.floor(seconds / 86400);
   const hours = Math.floor((seconds % 86400) / 3600);
   const mins = Math.floor((seconds % 3600) / 60);
   const parts = [];
   if (days > 0) parts.push(`${days} j`);
   if (hours > 0) parts.push(`${hours} h`);
   parts.push(`${mins} min`);
   return parts.join(" ");
}

function tooltipFormatter(value) {
   if (typeof value === "number" && value >= 1024) return formatBytes(value);
   if (typeof value === "number" && value <= 100) return `${value} %`;
   return value?.toLocaleString?.() ?? value;
}

function getRamBarColor(percent) {
   if (percent < 50) return "#22c55e";
   if (percent < 80) return "#f59e0b";
   return "#ef4444";
}

function StatMiniCard({ title, value, fillUsed, loading }) {
   if (loading) {
      return (
         <Card className="h-full min-w-0">
            <CardHeader className="py-2 px-3">
               <CardTitle className="text-xs font-medium text-muted-foreground">
                  {title}
               </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-4">
               <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </CardContent>
         </Card>
      );
   }
   if (!value) {
      return (
         <Card className="h-full min-w-0">
            <CardHeader className="py-2 px-3">
               <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
               <span className="text-muted-foreground">—</span>
            </CardContent>
         </Card>
      );
   }
   const isPercent = typeof value === "object" && value?.total === 100;
   const used = value?.used ?? 0;
   const total = value?.total ?? 1;
   const percent = value?.percent ?? (total > 0 ? Math.round((used / total) * 100) : 0);
   const free = Math.max(0, total - used);
   const chartData = [
      { name: "used", value: used, fill: fillUsed },
      { name: "free", value: free, fill: "#22c55e" },
   ];
   const label = isPercent
      ? `${percent}%`
      : total >= 1024
        ? `${formatBytes(used)} / ${formatBytes(total)} (${percent}%)`
        : `${percent}%`;

   return (
      <Card className="h-full min-w-0">
         <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm font-medium text-white">
               {title}
            </CardTitle>
         </CardHeader>
         <CardContent className="px-2 pb-3 pt-0">
            <ChartContainer
               config={chartConfigPie}
               className="min-h-[110px] w-full"
            >
               <PieChart accessibilityLayer>
                  <Pie
                     data={chartData}
                     dataKey="value"
                     nameKey="name"
                     cx="50%"
                     cy="50%"
                     innerRadius={28}
                     outerRadius={42}
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
            <p className="text-center text-xs font-medium text-foreground mt-1">
               {label}
            </p>
         </CardContent>
      </Card>
   );
}

function UptimeCard({ uptime, loading }) {
   if (loading) {
      return (
         <Card className="h-full min-w-0">
            <CardHeader className="py-2 px-3">
               <CardTitle className="text-xs font-medium text-muted-foreground">
                  Uptime
               </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-4">
               <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </CardContent>
         </Card>
      );
   }
   return (
      <Card className="h-full min-w-0">
         <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm font-medium text-white">
               Uptime
            </CardTitle>
         </CardHeader>
         <CardContent className="flex items-center justify-center py-6">
            <span className="text-lg font-semibold text-foreground tabular-nums">
               {formatUptime(uptime)}
            </span>
         </CardContent>
      </Card>
   );
}

function RamUsageBarChart({ stats, loading }) {
   const chartData = useMemo(() => {
      if (!stats?.length) return [];
      return stats
         .sort((a, b) => (b.memory?.used ?? 0) - (a.memory?.used ?? 0))
         .map((s) => ({
            name: s.name || s.id?.slice(0, 12),
            value: s.memory?.used ?? 0,
            percent: s.memory?.percent ?? 0,
            fill: getRamBarColor(s.memory?.percent ?? 0),
         }));
   }, [stats]);

   if (loading || chartData.length === 0) return null;

   const chartConfig = {
      value: { label: "RAM", color: "hsl(var(--chart-1))" },
   };

   const barHeight = 32;
   const chartHeight = Math.max(200, chartData.length * barHeight);

   return (
      <Card className="mb-4">
         <CardContent className="py-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
               Utilisation RAM par conteneur
            </h3>
            <div className="max-w-2xl">
               <ChartContainer
                  config={chartConfig}
                  className="w-full min-h-0"
                  style={{ height: chartHeight }}
               >
                  <BarChart
                     data={chartData}
                     layout="vertical"
                     margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                  >
                     <XAxis
                        type="number"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        tickFormatter={(v) => formatBytes(v)}
                     />
                     <YAxis
                        type="category"
                        dataKey="name"
                        width={220}
                        interval={0}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        tickLine={false}
                     />
                     <ChartTooltip
                        content={
                           <ChartTooltipContent
                              formatter={(v, _n, _i, _idx, payload) =>
                                 `${formatBytes(v)} (${payload?.percent ?? 0}%)`
                              }
                           />
                        }
                     />
                     <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={20}
                        barCategoryGap={8}
                     >
                        {chartData.map((entry, i) => (
                           <Cell key={i} fill={entry.fill} />
                        ))}
                     </Bar>
                  </BarChart>
               </ChartContainer>
            </div>
         </CardContent>
      </Card>
   );
}

export default function DockerStatsPage() {
   const [containers, setContainers] = useState([]);
   const [allStats, setAllStats] = useState([]);
   const [selectedId, setSelectedId] = useState("");
   const [containerStats, setContainerStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [loadingStats, setLoadingStats] = useState(false);
   const [loadingDetail, setLoadingDetail] = useState(false);
   const [error, setError] = useState(null);

   const runningContainers = containers.filter((c) => c.state === "running");
   const selectedContainer = containers.find((c) => c.id === selectedId);
   const selectedLabel = selectedContainer
      ? `${getContainerName(selectedContainer.names)} (${selectedContainer.state})`
      : null;

   async function loadContainersAndStats() {
      setLoading(true);
      setError(null);
      try {
         const [list, stats] = await Promise.all([
            dockerPs(),
            dockerStatsAll(),
         ]);
         setContainers(list);
         setAllStats(stats);
         if (!selectedId && list.filter((c) => c.state === "running").length > 0) {
            const firstRunning = list.find((c) => c.state === "running");
            if (firstRunning) setSelectedId(firstRunning.id);
         }
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   async function loadContainerStats() {
      if (!selectedId) {
         setContainerStats(null);
         return;
      }
      setLoadingDetail(true);
      try {
         const stats = await dockerContainerStats(selectedId);
         setContainerStats(stats);
      } catch {
         setContainerStats(null);
      } finally {
         setLoadingDetail(false);
      }
   }

   useEffect(() => {
      loadContainersAndStats();
   }, []);

   useEffect(() => {
      loadContainerStats();
   }, [selectedId]);

   return (
      <div>
         <header className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Stats</h1>
            <button
               onClick={loadContainersAndStats}
               disabled={loading}
               className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
               {loading ? (
                  <Loader2Icon className="size-4 animate-spin" />
               ) : (
                  <RefreshCwIcon className="size-4" />
               )}
               Rafraîchir
            </button>
         </header>

         {error ? (
            <Card>
               <CardContent className="py-6">
                  <div className="text-destructive flex items-center gap-3">
                     <p>{error}</p>
                     <button
                        onClick={loadContainersAndStats}
                        className="inline-flex items-center gap-1 text-sm underline"
                     >
                        <RefreshCwIcon className="size-4" />
                        Réessayer
                     </button>
                  </div>
               </CardContent>
            </Card>
         ) : (
            <>
               <RamUsageBarChart stats={allStats} loading={loading} />

               <Card>
                  <CardContent className="pt-6 space-y-4">
                     <div className="space-y-2 min-w-[200px]">
                        <Label htmlFor="container">Conteneur</Label>
                        <Select
                           value={selectedId}
                           onValueChange={setSelectedId}
                           disabled={loading}
                        >
                           <SelectTrigger id="container">
                              <SelectValue placeholder="Sélectionner un conteneur">
                                 {selectedLabel}
                              </SelectValue>
                           </SelectTrigger>
                           <SelectContent>
                              {runningContainers.map((c) => (
                                 <SelectItem key={c.id} value={c.id}>
                                    {getContainerName(c.names)} ({c.state})
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>

                     {selectedId && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[500px]">
                           <StatMiniCard
                              title="RAM"
                              value={containerStats?.memory}
                              fillUsed="#ef4444"
                              loading={loadingDetail}
                           />
                           <StatMiniCard
                              title="CPU"
                              value={
                                 containerStats?.cpu
                                    ? {
                                         used: containerStats.cpu.percent,
                                         total: 100,
                                         percent: containerStats.cpu.percent,
                                      }
                                    : null
                              }
                              fillUsed="#3b82f6"
                              loading={loadingDetail}
                           />
                           <UptimeCard
                              uptime={containerStats?.uptime}
                              loading={loadingDetail}
                           />
                        </div>
                     )}
                  </CardContent>
               </Card>
            </>
         )}
      </div>
   );
}
