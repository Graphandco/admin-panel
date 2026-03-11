"use client";

import { useEffect, useState } from "react";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import {
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
   ChartLegend,
   ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis } from "recharts";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getSystemStats, getSystemStatsHistory } from "@/app/actions/system";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const chartConfig = {
   used: {
      label: "Utilisée",
      color: "#ef4444",
   },
   free: {
      label: "Libre",
      color: "#22c55e",
   },
};

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

function formatUptime(seconds) {
   if (!seconds || seconds < 0) return "—";
   const days = Math.floor(seconds / 86400);
   const hours = Math.floor((seconds % 86400) / 3600);
   const mins = Math.floor((seconds % 3600) / 60);
   const parts = [];
   if (days > 0) parts.push(`${days} j`);
   if (hours > 0) parts.push(`${hours} h`);
   parts.push(`${mins} min`);
   return parts.join(" ");
}

function getDateOptions() {
   const opts = [];
   for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const value = `${yyyy}-${mm}-${dd}`;
      const label =
         i === 0 ? "Aujourd'hui" : i === 1 ? "Hier" : d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
      opts.push({ value, label });
   }
   return opts;
}

const historyChartConfig = {
   cpu_percent: { label: "CPU", color: "#3b82f6" },
   mem_percent: { label: "RAM", color: "#ef4444" },
   disk_percent: { label: "Disque", color: "#22c55e" },
};

function MetricsHistoryChart({ data, loading }) {
   const chartData = (data || []).map((r) => ({
      ...r,
      time: r.ts ? new Date(r.ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "",
   }));

   if (loading) return null;
   if (chartData.length === 0) {
      return (
         <Card>
            <CardContent className="py-8">
               <p className="text-sm text-muted-foreground text-center">
                  Aucune donnée pour cette période. Configurez le cron de collecte (voir CRON.md).
               </p>
            </CardContent>
         </Card>
      );
   }

   return (
      <Card>
         <CardContent className="py-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
               Historique des métriques (24 h)
            </h3>
            <ChartContainer config={historyChartConfig} className="h-[280px] w-full">
               <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <XAxis
                     dataKey="time"
                     tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                     tickLine={false}
                  />
                  <YAxis
                     domain={[0, 100]}
                     tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                     tickFormatter={(v) => `${v}%`}
                  />
                  <ChartTooltip
                     content={
                        <ChartTooltipContent
                           formatter={(v) => `${v}%`}
                        />
                     }
                  />
                  <Line
                     type="monotone"
                     dataKey="cpu_percent"
                     stroke="#3b82f6"
                     strokeWidth={2}
                     dot={false}
                     name="CPU"
                  />
                  <Line
                     type="monotone"
                     dataKey="mem_percent"
                     stroke="#ef4444"
                     strokeWidth={2}
                     dot={false}
                     name="RAM"
                  />
                  <Line
                     type="monotone"
                     dataKey="disk_percent"
                     stroke="#22c55e"
                     strokeWidth={2}
                     dot={false}
                     name="Disque"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
               </LineChart>
            </ChartContainer>
         </CardContent>
      </Card>
   );
}

export default function VpsStatsPage() {
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [historyData, setHistoryData] = useState([]);
   const [loadingHistory, setLoadingHistory] = useState(false);
   const today = new Date().toISOString().slice(0, 10);
   const [selectedDate, setSelectedDate] = useState(today);
   const selectedDateLabel = getDateOptions().find((o) => o.value === selectedDate)?.label ?? selectedDate;

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

   async function loadHistory() {
      setLoadingHistory(true);
      try {
         const data = await getSystemStatsHistory(selectedDate);
         setHistoryData(data);
      } catch {
         setHistoryData([]);
      } finally {
         setLoadingHistory(false);
      }
   }

   useEffect(() => {
      load();
   }, []);

   useEffect(() => {
      loadHistory();
   }, [selectedDate]);

   if (error) {
      return (
         <div>
            <h1 className="text-2xl font-bold text-white mb-4">
               Stats VPS
            </h1>
            <Card>
               <CardContent className="py-6">
                  <div className="text-destructive flex items-center gap-3">
                     <p>{error}</p>
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={load}
                        className="inline-flex items-center gap-1"
                     >
                        <RefreshCwIcon className="size-4" />
                        Réessayer
                     </Button>
                  </div>
               </CardContent>
            </Card>
         </div>
      );
   }

   const memData = stats
      ? [
           { name: "used", value: stats.memory.used, fill: "#ef4444" },
           {
              name: "free",
              value: Math.max(0, stats.memory.total - stats.memory.used),
              fill: "#22c55e",
           },
        ]
      : [];
   const diskData = stats
      ? [
           { name: "used", value: stats.disk.used, fill: "#ef4444" },
           {
              name: "free",
              value: Math.max(0, stats.disk.total - stats.disk.used),
              fill: "#22c55e",
           },
        ]
      : [];
   const cpuData = stats
      ? [
           { name: "used", value: stats.cpu.percent, fill: "#3b82f6" },
           {
              name: "free",
              value: Math.max(0, 100 - stats.cpu.percent),
              fill: "#22c55e",
           },
        ]
      : [];

   return (
      <div>
         <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
               <h1 className="text-2xl font-bold text-white">Stats VPS</h1>
               {stats?.uptime != null && (
                  <span className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium">
                     Uptime : {formatUptime(stats.uptime)}
                  </span>
               )}
            </div>
            <Button
               variant="outline"
               size="sm"
               onClick={load}
               disabled={loading}
               className="inline-flex items-center gap-1"
            >
               {loading ? (
                  <Loader2Icon className="size-4 animate-spin" />
               ) : (
                  <RefreshCwIcon className="size-4" />
               )}
               Actualiser
            </Button>
         </header>

         {loading ? (
            <Card>
               <CardContent className="flex items-center justify-center py-16">
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               </CardContent>
            </Card>
         ) : (
            <>
            <div className="grid gap-6 md:grid-cols-3">
               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">Mémoire RAM</CardTitle>
                     <p className="text-sm text-muted-foreground">
                        {stats?.memory.usedFormatted} / {stats?.memory.totalFormatted} ({stats?.memory.percent}%)
                     </p>
                  </CardHeader>
                  <CardContent>
                     <ChartContainer config={chartConfig} className="min-h-[180px] w-full">
                        <PieChart accessibilityLayer>
                           <Pie
                              data={memData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={2}
                           >
                              {memData.map((entry, index) => (
                                 <Cell key={index} fill={entry.fill} />
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
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">CPU</CardTitle>
                     <p className="text-sm text-muted-foreground">
                        {stats?.cpu.percent}% utilisé
                     </p>
                  </CardHeader>
                  <CardContent>
                     <ChartContainer config={chartConfig} className="min-h-[180px] w-full">
                        <PieChart accessibilityLayer>
                           <Pie
                              data={cpuData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={2}
                           >
                              {cpuData.map((entry, index) => (
                                 <Cell key={index} fill={entry.fill} />
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
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">Espace disque</CardTitle>
                     <p className="text-sm text-muted-foreground">
                        {stats?.disk.usedFormatted} / {stats?.disk.totalFormatted} ({stats?.disk.percent}%)
                     </p>
                  </CardHeader>
                  <CardContent>
                     <ChartContainer config={chartConfig} className="min-h-[180px] w-full">
                        <PieChart accessibilityLayer>
                           <Pie
                              data={diskData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={2}
                           >
                              {diskData.map((entry, index) => (
                                 <Cell key={index} fill={entry.fill} />
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
                  </CardContent>
               </Card>
            </div>

            <div className="mt-6 space-y-4">
               <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2 min-w-[180px]">
                     <Label htmlFor="metrics-date">Période</Label>
                     <Select
                        value={selectedDate}
                        onValueChange={setSelectedDate}
                        disabled={loadingHistory}
                     >
                        <SelectTrigger id="metrics-date">
                           <SelectValue placeholder="Choisir une date">
                              {selectedDateLabel}
                           </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                           {getDateOptions().map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                 {o.label}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               </div>
               {loadingHistory ? (
                  <Card>
                     <CardContent className="flex items-center justify-center py-12">
                        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
                     </CardContent>
                  </Card>
               ) : (
                  <MetricsHistoryChart data={historyData} loading={loadingHistory} />
               )}
            </div>
            </>
         )}
      </div>
   );
}
