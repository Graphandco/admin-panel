"use client";

import Link from "next/link";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSystemStats } from "@/app/actions/system";
import RefreshButton from "@/components/refresh-button";
import {
   ActivityIcon,
   ChartColumnIncreasing,
   ClockIcon,
   CpuIcon,
   HardDriveIcon,
   Loader2Icon,
   MonitorIcon,
   NetworkIcon,
   PieChartIcon,
   ServerIcon,
   ShieldIcon,
} from "lucide-react";

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
                  <p className="text-xs md:text-base font-semibold text-foreground leading-snug wrap-break-word">
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

function DetailRow({ label, value }) {
   return (
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-4 py-2.5 border-b border-white/5 last:border-0">
         <dt className="text-xs sm:text-sm text-muted-foreground sm:w-40 shrink-0">
            {label}
         </dt>
         <dd className="text-sm text-white font-medium wrap-break-word min-w-0">
            {value || "—"}
         </dd>
      </div>
   );
}

function QuickLink({ href, icon: Icon, label, hint }) {
   return (
      <Link
         href={href}
         className="flex items-start gap-3 rounded-lg border border-white/10 bg-card/40 px-4 py-3 hover:bg-card/70 transition-colors"
      >
         <Icon className="size-5 shrink-0 text-primary mt-0.5" />
         <div className="min-w-0">
            <p className="text-sm font-medium text-white">{label}</p>
            {hint ? (
               <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
            ) : null}
         </div>
      </Link>
   );
}

function MetricChip({ label, value, hint }) {
   return (
      <div className="rounded-lg border border-white/10 bg-card/40 px-4 py-3 min-w-0">
         <p className="text-xs text-muted-foreground">{label}</p>
         <p className="text-lg font-semibold text-white tabular-nums mt-0.5 truncate">
            {value}
         </p>
         {hint ? (
            <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
         ) : null}
      </div>
   );
}

export default function SystemePage() {
   const {
      data: stats,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("vps-stats", () => getSystemStats());

   useAutoRefresh(mutate);

   const host = stats?.host || null;
   const error = fetchError?.message || null;

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
      <div className="grid gap-6">
         <header className="flex flex-wrap justify-between items-center gap-4">
            <div>
               <h1 className="text-2xl font-bold text-white">Système</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Identité et caractéristiques du VPS
               </p>
            </div>
            <div className="flex items-center gap-3">
               {stats?.uptime != null && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card text-primary border border-primary text-sm font-medium">
                     <ClockIcon className="size-3.5" />
                     Uptime : {formatUptime(stats.uptime)}
                  </span>
               )}
               <RefreshButton
                  onClick={() => mutate()}
                  loading={loading || isValidating}
               />
            </div>
         </header>

         {error ? (
            <Card>
               <CardContent className="py-6 text-destructive text-sm">
                  {error}
               </CardContent>
            </Card>
         ) : null}

         <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-3 min-w-0">
            <InfoCard
               title="Système"
               icon={MonitorIcon}
               iconClass="text-violet-500 bg-violet-500/10 border-violet-500/20"
               value={host?.os}
               sub={host?.versionId ? `VERSION_ID ${host.versionId}` : null}
               loading={loading && !host}
            />
            <InfoCard
               title="Kernel"
               icon={ServerIcon}
               iconClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
               value={host?.kernel}
               loading={loading && !host}
            />
            <InfoCard
               title="Processeur"
               icon={CpuIcon}
               iconClass="text-sky-500 bg-sky-500/10 border-sky-500/20"
               value={host?.cpu || host?.cpuModel}
               sub={cpuSub}
               loading={loading && !host}
            />
         </div>

         <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 min-w-0">
            <MetricChip
               label="Hostname"
               value={loading && !host ? "…" : host?.hostname || "—"}
            />
            <MetricChip
               label="Architecture"
               value={loading && !host ? "…" : host?.arch || "—"}
            />
            <MetricChip
               label="Load average"
               value={loading && !host ? "…" : formatLoad(host?.loadavg)}
               hint="1 · 5 · 15 min"
            />
            <MetricChip
               label="Fuseau horaire"
               value={loading && !host ? "…" : host?.timezone || "—"}
            />
         </div>

         <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] min-w-0">
            <Card>
               <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                     <ActivityIcon className="size-4 text-muted-foreground" />
                     Détails hôte
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  {loading && !host ? (
                     <div className="flex justify-center py-8">
                        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                     </div>
                  ) : (
                     <dl>
                        <DetailRow label="OS" value={host?.os} />
                        <DetailRow
                           label="Version"
                           value={host?.versionId}
                        />
                        <DetailRow label="Kernel" value={host?.kernel} />
                        <DetailRow
                           label="CPU"
                           value={host?.cpu || host?.cpuModel}
                        />
                        <DetailRow
                           label="Cœurs / threads"
                           value={
                              host?.cores || host?.threads
                                 ? `${host.cores ?? "—"} / ${host.threads ?? "—"}`
                                 : null
                           }
                        />
                        <DetailRow label="Arch" value={host?.arch} />
                        <DetailRow label="Hostname" value={host?.hostname} />
                        <DetailRow
                           label="Virtualisation"
                           value={host?.virt}
                        />
                        <DetailRow label="Timezone" value={host?.timezone} />
                        <DetailRow
                           label="Load average"
                           value={formatLoad(host?.loadavg)}
                        />
                        <DetailRow
                           label="Uptime"
                           value={formatUptime(stats?.uptime)}
                        />
                     </dl>
                  )}
               </CardContent>
            </Card>

            <div className="grid gap-6 content-start">
               <Card>
                  <CardHeader>
                     <CardTitle className="text-white flex items-center gap-2">
                        <HardDriveIcon className="size-4 text-muted-foreground" />
                        Ressources (instantané)
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {loading && !stats ? (
                        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                     ) : (
                        <>
                           <div>
                              <div className="flex justify-between text-sm mb-1">
                                 <span className="text-muted-foreground">
                                    RAM
                                 </span>
                                 <span className="tabular-nums text-white">
                                    {stats?.memory?.usedFormatted || "—"} /{" "}
                                    {stats?.memory?.totalFormatted || "—"}
                                    {stats?.memory?.percent != null
                                       ? ` (${stats.memory.percent}%)`
                                       : ""}
                                 </span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                 <div
                                    className="h-full bg-red-500"
                                    style={{
                                       width: `${Math.min(100, stats?.memory?.percent || 0)}%`,
                                    }}
                                 />
                              </div>
                           </div>
                           <div>
                              <div className="flex justify-between text-sm mb-1">
                                 <span className="text-muted-foreground">
                                    CPU
                                 </span>
                                 <span className="tabular-nums text-white">
                                    {stats?.cpu?.percent != null
                                       ? `${stats.cpu.percent}%`
                                       : "—"}
                                 </span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                 <div
                                    className="h-full bg-sky-500"
                                    style={{
                                       width: `${Math.min(100, stats?.cpu?.percent || 0)}%`,
                                    }}
                                 />
                              </div>
                           </div>
                           <div>
                              <div className="flex justify-between text-sm mb-1">
                                 <span className="text-muted-foreground">
                                    Disque
                                 </span>
                                 <span className="tabular-nums text-white">
                                    {stats?.disk?.usedFormatted || "—"} /{" "}
                                    {stats?.disk?.totalFormatted || "—"}
                                    {stats?.disk?.percent != null
                                       ? ` (${stats.disk.percent}%)`
                                       : ""}
                                 </span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                 <div
                                    className="h-full bg-emerald-500"
                                    style={{
                                       width: `${Math.min(100, stats?.disk?.percent || 0)}%`,
                                    }}
                                 />
                              </div>
                           </div>
                        </>
                     )}
                  </CardContent>
               </Card>

               <div className="grid gap-2">
                  <p className="text-xs text-muted-foreground px-1">
                     Raccourcis
                  </p>
                  <QuickLink
                     href="/vps/stats"
                     icon={ChartColumnIncreasing}
                     label="Stats VPS"
                     hint="Historique CPU / RAM / disque"
                  />
                  <QuickLink
                     href="/vps/stockage"
                     icon={PieChartIcon}
                     label="Stockage"
                     hint="Disque hôte et usage Docker"
                  />
                  <QuickLink
                     href="/vps/securite/mises-a-jour"
                     icon={ShieldIcon}
                     label="Mises à jour"
                     hint="Paquets apt upgradables"
                  />
                  <QuickLink
                     href="/monitoring/sites"
                     icon={NetworkIcon}
                     label="Monitoring sites"
                     hint="Disponibilité HTTP"
                  />
               </div>
            </div>
         </div>
      </div>
   );
}
