"use client";

import { useMemo, useState } from "react";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
   CheckIcon,
   Ban,
   Loader2Icon,
   ExternalLinkIcon,
   LayoutDashboardIcon,
   TimerIcon,
   AlertTriangleIcon,
   CircleHelpIcon,
   LineChartIcon,
} from "lucide-react";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { wordpressSites } from "@/app/actions/wordpress";
import { agenceSitesList } from "@/app/actions/agence-sites";
import { WORDPRESS_SITES_KEY } from "@/components/wordpress/SitesRecapCard";
import { AGENCE_SITES_KEY } from "@/components/agence/SitesPage";
import { SiteLatencyHistory } from "@/components/agence/SiteLatencyHistory";

function hostKey(url) {
   if (!url || typeof url !== "string") return "";
   try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      return u.hostname.replace(/^www\./i, "").toLowerCase();
   } catch {
      return url
         .replace(/^https?:\/\//i, "")
         .replace(/^www\./i, "")
         .split("/")[0]
         .toLowerCase();
   }
}

function stripHttps(url) {
   if (!url || typeof url !== "string") return url || "";
   return url.replace(/^https?:\/\//i, "").replace(/\/$/, "").trim();
}

function formatMs(ms) {
   if (ms == null) return "—";
   return `${ms} ms`;
}

function formatUptime(pct) {
   if (pct == null) return "—";
   return `${pct}%`;
}

function StateBadge({ state, status }) {
   const cfg = {
      up: {
         label: status ?? "OK",
         className: "bg-green-500/20 text-green-600 dark:text-green-400",
         Icon: CheckIcon,
      },
      slow: {
         label: status ?? "Lent",
         className: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
         Icon: AlertTriangleIcon,
      },
      down: {
         label: status ?? "Down",
         className: "bg-red-500/20 text-red-600 dark:text-red-400",
         Icon: Ban,
      },
      unknown: {
         label: "—",
         className: "bg-muted text-muted-foreground",
         Icon: CircleHelpIcon,
      },
   }[state || "unknown"];

   const Icon = cfg.Icon;
   return (
      <span
         className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            cfg.className,
         )}
      >
         <Icon className="size-3.5" />
         {cfg.label}
      </span>
   );
}

function Sparkline({ points }) {
   if (!points?.length) {
      return <span className="text-muted-foreground text-xs">—</span>;
   }
   const values = points.map((p) => (p.ok ? (p.ms ?? 0) : null));
   const nums = values.filter((v) => v != null);
   if (!nums.length) {
      return <span className="text-muted-foreground text-xs">—</span>;
   }
   const max = Math.max(...nums, 1);
   const w = 64;
   const h = 20;
   const step = w / Math.max(values.length - 1, 1);
   const coords = values
      .map((v, i) => {
         if (v == null) return null;
         const x = i * step;
         const y = h - (v / max) * (h - 2) - 1;
         return `${x},${y}`;
      })
      .filter(Boolean);
   if (coords.length < 2) {
      return <span className="text-muted-foreground text-xs">—</span>;
   }
   return (
      <svg width={w} height={h} className="inline-block align-middle">
         <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-sky-400"
            points={coords.join(" ")}
         />
      </svg>
   );
}

/**
 * Sites du multisite WP enrichis avec le monitoring (latence / uptime).
 */
export default function WordPressSitesTable() {
   const [historySite, setHistorySite] = useState(null);

   const wpSwr = useCachedSWR(WORDPRESS_SITES_KEY, () => wordpressSites());
   const monSwr = useCachedSWR(AGENCE_SITES_KEY, () => agenceSitesList());

   const loading = wpSwr.isLoading || monSwr.isLoading;
   const error = wpSwr.error?.message || monSwr.error?.message || null;

   const rows = useMemo(() => {
      const wpSites = wpSwr.data || [];
      const monitored = monSwr.data?.sites || [];
      const byHost = new Map();
      for (const s of monitored) {
         const key = hostKey(s.address);
         if (key) byHost.set(key, s);
      }

      return [...wpSites]
         .map((wp) => {
            const key = hostKey(wp.url);
            const mon = key ? byHost.get(key) : null;
            const fullUrl = wp.url?.startsWith("http")
               ? wp.url
               : wp.url
                 ? `https://${wp.url}`
                 : null;
            const backoffice =
               mon?.backoffice?.trim() ||
               (fullUrl ? `${fullUrl.replace(/\/?$/, "")}/wp-admin` : null);
            return {
               key: wp.blog_id ?? wp.url,
               name: wp.site_name || safeHost(wp.url),
               url: fullUrl,
               displayUrl: stripHttps(wp.url),
               monitor: mon?.monitor || null,
               monitorId: mon?.id ?? null,
               address: mon?.address || wp.url,
               backoffice,
            };
         })
         .sort((a, b) => a.name.localeCompare(b.name, "fr"));
   }, [wpSwr.data, monSwr.data]);

   if (error) {
      return (
         <Card className="p-6">
            <p className="text-destructive text-sm">{error}</p>
         </Card>
      );
   }

   return (
      <>
         <Card className="p-0 md:p-0">
            <CardContent className="px-0">
               <Table>
                  <TableHeader className="bg-muted text-white">
                     <TableRow>
                        <TableHead className="pl-2">Site</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="hidden md:table-cell">
                           <span className="inline-flex items-center gap-1">
                              <TimerIcon className="size-3.5" />
                              Latence
                           </span>
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                           Uptime 24h
                        </TableHead>
                        <TableHead className="hidden xl:table-cell">
                           Tendance
                        </TableHead>
                        <TableHead>BO</TableHead>
                        <TableHead className="w-12 pe-2" />
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading && rows.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={7} className="text-center py-8">
                              <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                           </TableCell>
                        </TableRow>
                     ) : rows.length === 0 ? (
                        <TableRow>
                           <TableCell
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground"
                           >
                              Aucun site WordPress
                           </TableCell>
                        </TableRow>
                     ) : (
                        rows.map((site) => {
                           const m = site.monitor || {};
                           return (
                              <TableRow key={site.key}>
                                 <TableCell className="pl-2">
                                    <div>
                                       <span className="font-medium text-white">
                                          {site.name}
                                       </span>
                                       {site.url ? (
                                          <a
                                             href={site.url}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
                                          >
                                             {site.displayUrl || "—"}
                                             <ExternalLinkIcon className="size-3" />
                                          </a>
                                       ) : null}
                                    </div>
                                 </TableCell>
                                 <TableCell>
                                    <StateBadge
                                       state={m.state || "unknown"}
                                       status={m.status}
                                    />
                                 </TableCell>
                                 <TableCell className="hidden md:table-cell tabular-nums text-sm">
                                    {formatMs(m.responseMs)}
                                 </TableCell>
                                 <TableCell className="hidden lg:table-cell tabular-nums text-sm">
                                    {formatUptime(m.uptime24h)}
                                    {m.uptime7d != null ? (
                                       <span className="text-muted-foreground text-xs ml-1">
                                          · 7j {formatUptime(m.uptime7d)}
                                       </span>
                                    ) : null}
                                 </TableCell>
                                 <TableCell className="hidden xl:table-cell">
                                    {site.monitorId ? (
                                       <button
                                          type="button"
                                          onClick={() => setHistorySite(site)}
                                          className="inline-flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-muted/50"
                                          title="Voir l’historique de latence"
                                       >
                                          <Sparkline points={m.sparkline} />
                                          <LineChartIcon className="size-3.5 text-muted-foreground" />
                                       </button>
                                    ) : (
                                       <span className="text-muted-foreground text-xs">
                                          —
                                       </span>
                                    )}
                                 </TableCell>
                                 <TableCell>
                                    {site.backoffice ? (
                                       <span className="inline-flex items-center gap-1.5">
                                          <a
                                             href={
                                                site.backoffice.startsWith(
                                                   "http",
                                                )
                                                   ? site.backoffice
                                                   : `https://${site.backoffice}`
                                             }
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="inline-flex text-white hover:opacity-80"
                                             title="Ouvrir le backoffice"
                                          >
                                             <LayoutDashboardIcon className="size-4" />
                                          </a>
                                          {m.backoffice ? (
                                             <StateBadge
                                                state={m.backoffice.state}
                                                status={m.backoffice.status}
                                             />
                                          ) : (
                                             <span className="text-muted-foreground">
                                                —
                                             </span>
                                          )}
                                       </span>
                                    ) : (
                                       <span className="text-muted-foreground">
                                          —
                                       </span>
                                    )}
                                 </TableCell>
                                 <TableCell className="pe-2">
                                    {site.monitorId ? (
                                       <button
                                          type="button"
                                          onClick={() => setHistorySite(site)}
                                          className={cn(
                                             "inline-flex items-center justify-center size-8 rounded xl:hidden",
                                             "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                          )}
                                          title="Historique latence"
                                       >
                                          <LineChartIcon className="size-4" />
                                       </button>
                                    ) : null}
                                 </TableCell>
                              </TableRow>
                           );
                        })
                     )}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>

         <Dialog
            open={!!historySite}
            onOpenChange={(v) => !v && setHistorySite(null)}
         >
            <DialogContent className="sm:max-w-3xl">
               <DialogHeader>
                  <DialogTitle>
                     Latence ·{" "}
                     {historySite
                        ? historySite.displayUrl || historySite.name
                        : ""}
                  </DialogTitle>
               </DialogHeader>
               {historySite?.monitorId ? (
                  <SiteLatencyHistory
                     websiteId={historySite.monitorId}
                     kind="site"
                     className="pt-1"
                  />
               ) : null}
            </DialogContent>
         </Dialog>
      </>
   );
}

function safeHost(url) {
   try {
      return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
   } catch {
      return url || "—";
   }
}
