"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { getNasStats } from "@/app/actions/nas";
import {
   Loader2Icon,
   HardDriveIcon,
   ClockIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RefreshButton from "@/components/refresh-button";

const chartConfig = {
   used: { label: "Utilisée", color: "#ef4444" },
   free: { label: "Libre", color: "#22c55e" },
};

function formatBytes(val) {
   if (val == null || val < 1024) return "0 B";
   const k = 1024;
   const sizes = ["B", "KB", "MB", "GB", "TB"];
   const i = Math.floor(Math.log(val) / Math.log(k));
   return `${(val / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function tooltipFormatter(value) {
   if (typeof value === "number" && value >= 1024) return formatBytes(value);
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

function NasStatsCards({ data, loading, name }) {
   if (!data?.configured) {
      return (
         <Card>
            <CardContent className="py-8">
               <div className="flex items-start gap-4">
                  <HardDriveIcon className="size-10 text-muted-foreground shrink-0" />
                  <div>
                     <p className="font-medium text-white mb-1">
                        {name} — Non configuré
                     </p>
                     <p className="text-sm text-muted-foreground">
                        {data?.message ||
                           `Ajoutez NAS_${name.toUpperCase().replace(/ /g, "_")}_IP dans le .env de l'admin-api.`}
                     </p>
                  </div>
               </div>
            </CardContent>
         </Card>
      );
   }

   if (data?.error) {
      return (
         <Card>
            <CardContent className="py-8">
               <div className="flex items-start gap-4">
                  <HardDriveIcon className="size-10 text-destructive shrink-0" />
                  <div>
                     <p className="font-medium text-white mb-1">{name}</p>
                     <p className="text-sm text-destructive">{data.error}</p>
                     <p className="text-xs text-muted-foreground mt-1">
                        Host: {data.host}
                     </p>
                  </div>
               </div>
            </CardContent>
         </Card>
      );
   }

   const stats = data?.stats || {};
   const mem = stats.memory || {};
   const disk = stats.disk || {};
   const disks =
      Array.isArray(stats.disks) && stats.disks.length > 0
         ? stats.disks
         : disk?.total
           ? [disk]
           : [];

   const memData = [
      { name: "used", value: mem.used || 0, fill: "#ef4444" },
      {
         name: "free",
         value: Math.max(0, (mem.total || 0) - (mem.used || 0)),
         fill: "#22c55e",
      },
   ];
   const hasMem = (mem.total || 0) > 0;
   const hasDisks = disks.some((d) => (d.total || 0) > 0);
   const singleDisk = disks.length === 1 ? disks[0] : null;
   const diskData = singleDisk
      ? [
           { name: "used", value: singleDisk.used || 0, fill: "#ef4444" },
           {
              name: "free",
              value: Math.max(
                 0,
                 (singleDisk.total || 0) - (singleDisk.used || 0),
              ),
              fill: "#22c55e",
           },
        ]
      : null;

   return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card>
            <CardHeader>
               <CardTitle className="text-base">Mémoire RAM</CardTitle>
               <p className="text-sm text-muted-foreground">
                  {mem.usedFormatted} / {mem.totalFormatted} ({mem.percent}%)
               </p>
            </CardHeader>
            <CardContent>
               {loading ? (
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               ) : (
                  <ChartContainer
                     config={chartConfig}
                     className="min-h-45 w-full"
                  >
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
               )}
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle className="text-base">Espace disque</CardTitle>
               {singleDisk ? (
                  <p className="text-sm text-muted-foreground">
                     {singleDisk.total
                        ? `${singleDisk.usedFormatted} / ${singleDisk.totalFormatted} (${singleDisk.percent}%)${singleDisk.mount ? ` — ${singleDisk.mount}` : ""}`
                        : "Aucune partition principale détectée"}
                  </p>
               ) : (
                  <p className="text-sm text-muted-foreground">
                     {hasDisks
                        ? `${disks.length} volume${disks.length > 1 ? "s" : ""}`
                        : "Aucune partition principale détectée"}
                  </p>
               )}
            </CardHeader>
            <CardContent>
               {loading ? (
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               ) : !hasDisks ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                     —
                  </p>
               ) : singleDisk && diskData ? (
                  <ChartContainer
                     config={chartConfig}
                     className="min-h-45 w-full"
                  >
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
               ) : (
                  <div className="space-y-4 py-1">
                     {disks.map((d) => (
                        <div key={d.mount || d.totalFormatted}>
                           <div className="flex items-baseline justify-between gap-2 mb-1.5">
                              <span className="text-sm font-medium text-white font-mono">
                                 {d.mount || "—"}
                              </span>
                              <span className="text-xs text-muted-foreground tabular-nums">
                                 {d.usedFormatted} / {d.totalFormatted} (
                                 {d.percent}%)
                              </span>
                           </div>
                           <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                              <div
                                 className="h-full rounded-full bg-red-500 transition-[width]"
                                 style={{
                                    width: `${Math.min(100, Math.max(0, d.percent || 0))}%`,
                                    backgroundColor:
                                       (d.percent || 0) >= 90
                                          ? "#ef4444"
                                          : (d.percent || 0) >= 75
                                            ? "#f59e0b"
                                            : "#22c55e",
                                 }}
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle className="text-base">Uptime</CardTitle>
               <ClockIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {loading ? (
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               ) : (
                  <>
                     <div className="text-2xl font-bold text-white">
                        {formatUptime(stats.uptime)}
                     </div>
                     <p className="text-xs text-muted-foreground mt-1">
                        Host: {data.host}
                     </p>
                  </>
               )}
            </CardContent>
         </Card>
      </div>
   );
}

export default function NasPage() {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [mounted, setMounted] = useState(false);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const res = await getNasStats();
         setData(res);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      setMounted(true);
      load();
   }, []);

   const refreshButton = (
      <RefreshButton onClick={load} loading={loading} />
   );

   const unraidConfigured = data?.unraid?.configured;
   const synologyConfigured = data?.synology?.configured;
   const anyConfigured = unraidConfigured || synologyConfigured;

   if (error) {
      return (
         <>
            {mounted &&
               typeof document !== "undefined" &&
               document.getElementById("nas-refresh-portal") &&
               createPortal(
                  refreshButton,
                  document.getElementById("nas-refresh-portal"),
               )}
            <Card>
               <CardContent className="py-8">
                  <div className="text-destructive flex flex-col gap-3">
                     <p>{error}</p>
                     <Button variant="outline" size="sm" onClick={load}>
                        Réessayer
                     </Button>
                  </div>
               </CardContent>
            </Card>
         </>
      );
   }

   if (!anyConfigured && data && !loading) {
      return (
         <>
            {mounted &&
               typeof document !== "undefined" &&
               document.getElementById("nas-refresh-portal") &&
               createPortal(
                  refreshButton,
                  document.getElementById("nas-refresh-portal"),
               )}
            <Card>
               <CardContent className="py-8">
                  <div className="flex items-start gap-4">
                     <HardDriveIcon className="size-10 text-muted-foreground shrink-0" />
                     <div>
                        <p className="font-medium text-white mb-1">
                           Aucun NAS configuré
                        </p>
                        <p className="text-sm text-muted-foreground">
                           Ajoutez NAS_UNRAID_IP et/ou NAS_SYNOLOGY_IP dans le
                           .env de l'admin-api.
                        </p>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </>
      );
   }

   return (
      <>
         {mounted &&
            typeof document !== "undefined" &&
            document.getElementById("nas-refresh-portal") &&
            createPortal(
               refreshButton,
               document.getElementById("nas-refresh-portal"),
            )}
         <div className="space-y-8">
            <section>
               <h2 className="text-lg font-semibold text-white mb-4">
                  NAS Unraid
               </h2>
               <NasStatsCards
                  data={data?.unraid}
                  loading={loading && !data}
                  name="Unraid"
               />
            </section>
            <section>
               <h2 className="text-lg font-semibold text-white mb-4">
                  NAS Synology
               </h2>
               <NasStatsCards
                  data={data?.synology}
                  loading={loading && !data}
                  name="Synology"
               />
            </section>
         </div>
      </>
   );
}
