"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
   ChartLegend,
   ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ReferenceLine } from "recharts";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
   getSystemStats,
   getSystemStatsHistory,
   getSystemStorage,
} from "@/app/actions/system";
import {
   AlertTriangleIcon,
   CheckCircle2Icon,
   ExternalLinkIcon,
   HardDriveIcon,
   Loader2Icon,
   ServerIcon,
   ShieldAlertIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import RefreshButton from "@/components/refresh-button";
import { SemiGauge } from "@/components/charts/semi-gauge";

function formatBytes(val) {
   if (val == null || val < 1024) return `${val ?? 0} B`;
   const k = 1024;
   const sizes = ["B", "KB", "MB", "GB", "TB"];
   const i = Math.floor(Math.log(val) / Math.log(k));
   return `${(val / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
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

function formatLoad(loadavg) {
   if (!loadavg) return "—";
   const fmt = (n) =>
      typeof n === "number" && !Number.isNaN(n) ? n.toFixed(2) : "—";
   return `${fmt(loadavg.m1)} · ${fmt(loadavg.m5)} · ${fmt(loadavg.m15)}`;
}

function formatCheckedAt(iso) {
   if (!iso) return null;
   try {
      return new Date(iso).toLocaleString("fr-FR", {
         dateStyle: "short",
         timeStyle: "short",
      });
   } catch {
      return null;
   }
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
         i === 0
            ? "Aujourd'hui"
            : i === 1
              ? "Hier"
              : d.toLocaleDateString("fr-FR", {
                   weekday: "short",
                   day: "numeric",
                   month: "short",
                });
      opts.push({ value, label });
   }
   return opts;
}

function gaugeColor(percent, threshold = 90) {
   if (percent >= threshold) return "#ef4444";
   if (percent >= Math.max(0, threshold - 15)) return "#f59e0b";
   return "#22c55e";
}

function resourceTone(percent, threshold) {
   if (percent == null) return "muted";
   if (percent >= threshold) return "critical";
   if (percent >= Math.max(0, threshold - 15)) return "warning";
   return "ok";
}

function ResourceStatusBadge({ label, percent, threshold }) {
   const tone = resourceTone(percent, threshold);
   const cfg = {
      ok: {
         className: "bg-green-500/15 text-green-500",
         Icon: CheckCircle2Icon,
         text: "OK",
      },
      warning: {
         className: "bg-amber-500/15 text-amber-500",
         Icon: AlertTriangleIcon,
         text: "Élevé",
      },
      critical: {
         className: "bg-red-500/15 text-red-500",
         Icon: ShieldAlertIcon,
         text: "Alerte",
      },
      muted: {
         className: "bg-muted text-muted-foreground",
         Icon: ServerIcon,
         text: "—",
      },
   }[tone];
   const Icon = cfg.Icon;
   return (
      <span
         className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
            cfg.className,
         )}
         title={`${label} : ${percent ?? "—"}% (seuil ${threshold}%)`}
      >
         <Icon className="size-3" />
         {label} {percent != null ? `${percent}%` : "—"}
      </span>
   );
}

function QuickLink({ href, label, hint }) {
   return (
      <Link
         href={href}
         className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
      >
         {label}
         {hint ? (
            <span className="text-[10px] text-muted-foreground/80 hidden sm:inline">
               · {hint}
            </span>
         ) : null}
         <ExternalLinkIcon className="size-3 opacity-60" />
      </Link>
   );
}

function GaugeCard({ title, percent, threshold, detail, sub }) {
   const isMobile = useIsMobile();
   const size = isMobile ? 100 : 128;
   const gaugeH = Math.round(size * 0.62);
   const color = gaugeColor(percent ?? 0, threshold);

   return (
      <Card className="min-w-0">
         <CardHeader className="pb-1">
            <CardTitle className="text-sm md:text-base">{title}</CardTitle>
            {detail ? (
               <p className="text-xs text-muted-foreground">{detail}</p>
            ) : null}
         </CardHeader>
         <CardContent className="flex flex-col items-center pt-0 pb-4">
            <SemiGauge
               value={percent ?? 0}
               width={size}
               height={gaugeH}
               color={color}
            />
            {sub ? (
               <p className="text-[11px] md:text-xs text-center text-muted-foreground mt-1">
                  {sub}
               </p>
            ) : null}
         </CardContent>
      </Card>
   );
}

function SummaryRow({ label, summary, threshold, color }) {
   if (!summary) {
      return (
         <p className="text-xs text-muted-foreground">
            {label} : aucune donnée
         </p>
      );
   }
   return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
         <span className="font-medium text-white">{label}</span>
         <span className="text-muted-foreground">
            min <strong className="text-foreground tabular-nums">{summary.min}%</strong>
         </span>
         <span className="text-muted-foreground">
            moy <strong className="text-foreground tabular-nums">{summary.avg}%</strong>
         </span>
         <span className="text-muted-foreground">
            max{" "}
            <strong
               className={cn(
                  "tabular-nums",
                  summary.max >= threshold ? "text-red-400" : "text-foreground",
               )}
            >
               {summary.max}%
            </strong>
         </span>
         <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
         />
      </div>
   );
}

const historyChartConfig = {
   cpu_percent: { label: "CPU", color: "#3b82f6" },
   mem_percent: { label: "RAM", color: "#ef4444" },
   disk_percent: { label: "Disque", color: "#22c55e" },
};

function MetricsHistoryChart({ data, loading, thresholds }) {
   const chartData = (data || []).map((r) => ({
      ...r,
      time: r.ts
         ? new Date(r.ts).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
           })
         : "",
   }));

   if (loading) {
      return (
         <Card>
            <CardContent className="flex justify-center py-12">
               <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </CardContent>
         </Card>
      );
   }

   if (chartData.length === 0) {
      return null;
   }

   const refThreshold = Math.round(
      ((thresholds?.cpu ?? 90) +
         (thresholds?.ram ?? 90) +
         (thresholds?.disk ?? 85)) /
         3,
   );

   return (
      <Card>
         <CardContent className="py-4">
            <ChartContainer config={historyChartConfig} className="h-64 w-full">
               <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
               >
                  <XAxis
                     dataKey="time"
                     tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 10,
                     }}
                     tickLine={false}
                     minTickGap={28}
                  />
                  <YAxis
                     domain={[0, 100]}
                     tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 10,
                     }}
                     tickFormatter={(v) => `${v}%`}
                     width={40}
                  />
                  <ReferenceLine
                     y={refThreshold}
                     stroke="#f59e0b"
                     strokeDasharray="4 4"
                     strokeOpacity={0.6}
                  />
                  <ChartTooltip
                     content={
                        <ChartTooltipContent formatter={(v) => `${v}%`} />
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
            <p className="text-[10px] text-muted-foreground text-center mt-2">
               Ligne ambre = moyenne des seuils d&apos;alerte (
               {refThreshold}%)
            </p>
         </CardContent>
      </Card>
   );
}

function ProcessBars({ processes }) {
   const maxRss = Math.max(...(processes || []).map((p) => p.rss || 0), 1);
   if (!processes?.length) {
      return (
         <p className="text-sm text-muted-foreground text-center py-4">
            Aucun processus
         </p>
      );
   }
   return (
      <ul className="space-y-3">
         {processes.map((p, i) => {
            const pct = Math.round(((p.rss || 0) / maxRss) * 100);
            return (
               <li key={`${p.pid}-${i}`}>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                     <div className="min-w-0 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4 shrink-0">
                           {i + 1}.
                        </span>
                        <span className="text-sm font-medium text-white truncate">
                           {p.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                           pid {p.pid}
                        </span>
                     </div>
                     <span className="text-xs tabular-nums text-white shrink-0">
                        {p.rssFormatted}
                     </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden ml-6">
                     <div
                        className="h-full rounded-full bg-red-500/80"
                        style={{ width: `${pct}%` }}
                     />
                  </div>
                  {p.cmd && p.cmd !== p.name ? (
                     <p
                        className="ml-6 mt-0.5 text-[10px] text-muted-foreground truncate"
                        title={p.cmd}
                     >
                        {p.cmd}
                     </p>
                  ) : null}
               </li>
            );
         })}
      </ul>
   );
}

function StorageChips({ storage, loading }) {
   const docker = storage?.docker;
   if (loading && !storage) {
      return (
         <div className="flex justify-center py-4">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
         </div>
      );
   }
   if (!docker) return null;

   const chips = [
      {
         label: "Images",
         value: docker.images?.sizeFormatted,
         hint: `${docker.images?.count ?? 0} image(s)`,
      },
      {
         label: "Volumes",
         value: docker.volumes?.sizeFormatted,
         hint: `${docker.volumes?.unused ?? 0} inutilisé(s)`,
      },
      {
         label: "Build cache",
         value: docker.buildCache?.sizeFormatted,
         hint: `${docker.buildCache?.count ?? 0} entrée(s)`,
      },
   ];

   return (
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
         {chips.map((c) => (
            <div
               key={c.label}
               className="rounded-lg border border-border/60 px-3 py-2.5 min-w-0"
            >
               <p className="text-xs text-muted-foreground">{c.label}</p>
               <p className="text-sm font-semibold text-white tabular-nums mt-0.5">
                  {c.value || "—"}
               </p>
               <p className="text-[10px] text-muted-foreground mt-0.5">
                  {c.hint}
               </p>
            </div>
         ))}
      </div>
   );
}

export default function VpsStatsPage() {
   const today = new Date().toISOString().slice(0, 10);
   const [selectedDate, setSelectedDate] = useState(today);
   const selectedDateLabel =
      getDateOptions().find((o) => o.value === selectedDate)?.label ??
      selectedDate;

   const {
      data: stats,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("vps-stats", () => getSystemStats());
   const error = fetchError?.message || null;

   const { data: history, isLoading: loadingHistory } = useCachedSWR(
      ["vps-stats-history", selectedDate],
      () => getSystemStatsHistory(selectedDate),
   );

   const { data: storage, isLoading: loadingStorage } = useCachedSWR(
      "vps-storage-overview",
      () => getSystemStorage(),
      { revalidateOnFocus: false },
   );

   useAutoRefresh(mutate);

   const thresholds = stats?.thresholds || {
      cpu: 90,
      ram: 90,
      disk: 85,
   };
   const host = stats?.host || {};
   const historyPoints = history?.data || [];
   const historySummary = history?.summary || null;
   const lastCollectedAt = history?.lastCollectedAt;

   const cpuSub = useMemo(() => {
      const cores = host.cores || host.cpuCores;
      const threads = host.threads;
      if (!cores && !host.loadavg) return null;
      const load = formatLoad(host.loadavg);
      const coresLabel = cores
         ? `${cores} cœur${cores > 1 ? "s" : ""}${
              threads && threads !== cores ? ` · ${threads} threads` : ""
           }`
         : null;
      return [load !== "—" ? `Load ${load}` : null, coresLabel]
         .filter(Boolean)
         .join(" · ");
   }, [host]);

   if (error) {
      return (
         <div>
            <h1 className="text-2xl font-bold text-white mb-4">Stats VPS</h1>
            <Card>
               <CardContent className="py-6">
                  <div className="text-destructive flex items-center gap-3">
                     <p>{error}</p>
                     <Button variant="outline" size="sm" onClick={() => mutate()}>
                        Réessayer
                     </Button>
                  </div>
               </CardContent>
            </Card>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <header className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-2 min-w-0">
               <h1 className="text-2xl font-bold text-white">Stats VPS</h1>
               <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {stats?.uptime != null ? (
                     <span className="rounded-md bg-muted/50 px-2 py-1">
                        Uptime {formatUptime(stats.uptime)}
                     </span>
                  ) : null}
                  {host.hostname ? (
                     <span className="rounded-md bg-muted/50 px-2 py-1">
                        {host.hostname}
                     </span>
                  ) : null}
                  {host.loadavg ? (
                     <span className="rounded-md bg-muted/50 px-2 py-1">
                        Load {formatLoad(host.loadavg)}
                     </span>
                  ) : null}
                  {lastCollectedAt ? (
                     <span className="rounded-md bg-muted/50 px-2 py-1">
                        Dernière collecte {formatCheckedAt(lastCollectedAt)}
                     </span>
                  ) : null}
               </div>
               {!loading && stats ? (
                  <div className="flex flex-wrap gap-1.5">
                     <ResourceStatusBadge
                        label="CPU"
                        percent={stats.cpu?.percent}
                        threshold={thresholds.cpu}
                     />
                     <ResourceStatusBadge
                        label="RAM"
                        percent={stats.memory?.percent}
                        threshold={thresholds.ram}
                     />
                     <ResourceStatusBadge
                        label="Disque"
                        percent={stats.disk?.percent}
                        threshold={thresholds.disk}
                     />
                  </div>
               ) : null}
               <div className="flex flex-wrap gap-2 pt-1">
                  <QuickLink href="/vps/systeme" label="Système" hint="détails hôte" />
                  <QuickLink href="/vps/stockage" label="Stockage" hint="Docker" />
                  <QuickLink href="/monitoring/alertes" label="Alertes" hint="VPS" />
               </div>
            </div>
            <RefreshButton onClick={() => mutate()} loading={loading || isValidating} />
         </header>

         {loading && !stats ? (
            <Card>
               <CardContent className="flex items-center justify-center py-16">
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               </CardContent>
            </Card>
         ) : (
            <>
               <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3">
                  <GaugeCard
                     title="CPU"
                     percent={stats?.cpu?.percent}
                     threshold={thresholds.cpu}
                     detail={
                        stats?.cpu?.percent != null
                           ? `${stats.cpu.percent}% utilisé`
                           : undefined
                     }
                     sub={cpuSub}
                  />
                  <GaugeCard
                     title="Mémoire RAM"
                     percent={stats?.memory?.percent}
                     threshold={thresholds.ram}
                     detail={
                        stats?.memory
                           ? `${stats.memory.usedFormatted} / ${stats.memory.totalFormatted}`
                           : undefined
                     }
                     sub={
                        stats?.swap?.total > 0
                           ? `Swap ${stats.swap.usedFormatted} / ${stats.swap.totalFormatted} (${stats.swap.percent}%)`
                           : null
                     }
                  />
                  <GaugeCard
                     title="Espace disque"
                     percent={stats?.disk?.percent}
                     threshold={thresholds.disk}
                     detail={
                        stats?.disk
                           ? `${stats.disk.usedFormatted} / ${stats.disk.totalFormatted}`
                           : undefined
                     }
                     sub="Partition racine · voir Stockage pour le détail"
                  />
               </div>

               <div className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                     <div>
                        <h2 className="text-lg font-semibold text-white">
                           Historique
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                           Collecte toutes les 15 min · conservation 7 jours
                        </p>
                     </div>
                     <div className="space-y-2 min-w-45">
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

                  {historyPoints.length === 0 && !loadingHistory ? (
                     <Card>
                        <CardContent className="py-8 text-center space-y-2">
                           <p className="text-sm text-muted-foreground">
                              Aucune donnée historique pour {selectedDateLabel}.
                           </p>
                           <p className="text-xs text-muted-foreground max-w-md mx-auto">
                              Configurez le cron{" "}
                              <code className="text-[11px]">
                                 /api/system/collect-metrics
                              </code>{" "}
                              (voir admin-api/CRON.md). Les graphiques apparaîtront
                              après quelques collectes.
                           </p>
                        </CardContent>
                     </Card>
                  ) : (
                     <>
                        {historySummary ? (
                           <Card>
                              <CardHeader className="pb-2">
                                 <CardTitle className="text-sm">
                                    Résumé · {selectedDateLabel}
                                 </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 pb-4">
                                 <SummaryRow
                                    label="CPU"
                                    summary={historySummary.cpu}
                                    threshold={thresholds.cpu}
                                    color="#3b82f6"
                                 />
                                 <SummaryRow
                                    label="RAM"
                                    summary={historySummary.mem}
                                    threshold={thresholds.ram}
                                    color="#ef4444"
                                 />
                                 <SummaryRow
                                    label="Disque"
                                    summary={historySummary.disk}
                                    threshold={thresholds.disk}
                                    color="#22c55e"
                                 />
                              </CardContent>
                           </Card>
                        ) : null}

                        <MetricsHistoryChart
                           data={historyPoints}
                           loading={loadingHistory}
                           thresholds={thresholds}
                        />
                     </>
                  )}
               </div>

               <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <ServerIcon className="size-4 text-muted-foreground" />
                           Top processus — RAM
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <ProcessBars processes={stats?.topRamProcesses} />
                     </CardContent>
                  </Card>

                  <Card>
                     <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                           <CardTitle className="text-base flex items-center gap-2">
                              <HardDriveIcon className="size-4 text-muted-foreground" />
                              Docker sur disque
                           </CardTitle>
                           <Link
                              href="/vps/stockage"
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                           >
                              Détail
                              <ExternalLinkIcon className="size-3" />
                           </Link>
                        </div>
                     </CardHeader>
                     <CardContent>
                        <StorageChips
                           storage={storage}
                           loading={loadingStorage}
                        />
                     </CardContent>
                  </Card>
               </div>
            </>
         )}
      </div>
   );
}
