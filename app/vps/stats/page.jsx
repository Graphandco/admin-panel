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
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { getSystemStats } from "@/app/actions/system";
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

export default function VpsStatsPage() {
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
         <header className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Stats VPS</h1>
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
         )}
      </div>
   );
}
