"use client";

import { useEffect, useState, useCallback } from "react";
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
   RefreshCwIcon,
   ExternalLinkIcon,
   LayoutDashboardIcon,
   PencilIcon,
   ActivityIcon,
   TimerIcon,
   AlertTriangleIcon,
   CircleHelpIcon,
} from "lucide-react";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
   agenceSitesList,
   agenceSitesCheckNow,
   agenceSiteUpdate,
} from "@/app/actions/agence-sites";
import { toast } from "sonner";
import RefreshButton from "@/components/refresh-button";

const AUTO_REFRESH_MS = 60_000;

function stripHttps(url) {
   if (!url || typeof url !== "string") return url || "";
   return url.replace(/^https?:\/\//i, "").trim();
}

function formatMs(ms) {
   if (ms == null) return "—";
   return `${ms} ms`;
}

function formatUptime(pct) {
   if (pct == null) return "—";
   return `${pct}%`;
}

function formatCheckedAt(iso) {
   if (!iso) return null;
   try {
      return new Date(iso).toLocaleString("fr-FR", {
         day: "2-digit",
         month: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
      });
   } catch {
      return null;
   }
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
   const values = points.map((p) => (p.ok ? p.ms ?? 0 : null));
   const nums = values.filter((v) => v != null);
   const max = Math.max(...(nums.length ? nums : [1]), 1);
   const w = 72;
   const h = 22;
   const step = points.length > 1 ? w / (points.length - 1) : w;

   const path = points
      .map((p, i) => {
         const x = i * step;
         const y =
            p.ok && p.ms != null
               ? h - (p.ms / max) * (h - 2) - 1
               : h - 1;
         return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

   const lastOk = points[points.length - 1]?.ok;
   return (
      <svg
         width={w}
         height={h}
         className="inline-block align-middle"
         aria-hidden
      >
         <path
            d={path}
            fill="none"
            stroke={lastOk ? "#22c55e" : "#ef4444"}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
         />
      </svg>
   );
}

function KpiCard({ label, value, hint, tone }) {
   const tones = {
      green: "text-green-500",
      red: "text-red-500",
      amber: "text-amber-500",
      muted: "text-muted-foreground",
      white: "text-white",
   };
   return (
      <Card className="p-0">
         <CardContent className="py-3 px-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={cn("text-2xl font-bold tabular-nums", tones[tone] || tones.white)}>
               {value}
            </p>
            {hint ? (
               <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
            ) : null}
         </CardContent>
      </Card>
   );
}

export default function SitesPage() {
   const [sites, setSites] = useState([]);
   const [summary, setSummary] = useState(null);
   const [checkedAt, setCheckedAt] = useState(null);
   const [loading, setLoading] = useState(true);
   const [checking, setChecking] = useState(false);
   const [error, setError] = useState(null);
   const [editSite, setEditSite] = useState(null);
   const [editForm, setEditForm] = useState({
      address: "",
      backoffice: "",
   });
   const [saving, setSaving] = useState(false);

   const applyPayload = useCallback((data) => {
      setSites(data.sites || []);
      setSummary(data.summary || null);
      setCheckedAt(data.checkedAt || null);
   }, []);

   const load = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const data = await agenceSitesList();
         applyPayload(data);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }, [applyPayload]);

   async function runCheck() {
      setChecking(true);
      setError(null);
      try {
         const data = await agenceSitesCheckNow();
         applyPayload(data);
         toast.success("Checks terminés");
      } catch (err) {
         toast.error(err.message || "Erreur lors des checks");
      } finally {
         setChecking(false);
      }
   }

   useEffect(() => {
      load();
      const id = setInterval(() => {
         agenceSitesList()
            .then(applyPayload)
            .catch(() => {});
      }, AUTO_REFRESH_MS);
      return () => clearInterval(id);
   }, [load, applyPayload]);

   function openEdit(site) {
      setEditSite(site);
      setEditForm({
         address: site.address ?? "",
         backoffice: site.backoffice ?? "",
      });
   }

   async function handleSaveEdit() {
      if (!editSite) return;
      setSaving(true);
      try {
         await agenceSiteUpdate(editSite.id, editForm);
         setEditSite(null);
         await load();
         toast.success("Le site a été mis à jour");
      } catch (err) {
         toast.error(err.message || "Erreur lors de l'enregistrement");
      } finally {
         setSaving(false);
      }
   }

   if (error && !sites.length) {
      return (
         <div>
            <h1 className="text-2xl font-bold text-white mb-4">Sites</h1>
            <Card className="p-6">
               <div className="text-destructive flex items-center gap-3">
                  <p>{error}</p>
                  <button
                     onClick={load}
                     className="inline-flex items-center gap-1 text-sm underline"
                  >
                     <RefreshCwIcon className="size-4" />
                     Réessayer
                  </button>
               </div>
            </Card>
         </div>
      );
   }

   const reachable = (summary?.up || 0) + (summary?.slow || 0);

   return (
      <div>
         <header className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <div>
               <h1 className="text-2xl font-bold text-white">Sites</h1>
               {checkedAt ? (
                  <p className="text-xs text-muted-foreground mt-0.5">
                     Dernière synchro · {formatCheckedAt(checkedAt)}
                     <span className="opacity-60"> · auto 60s</span>
                  </p>
               ) : null}
            </div>
            <div className="flex items-center gap-3">
               <RefreshButton onClick={load} loading={loading} />
               <Button
                  size="sm"
                  variant="outline"
                  onClick={runCheck}
                  disabled={checking || loading}
               >
                  {checking ? (
                     <Loader2Icon className="size-4 mr-1.5 animate-spin" />
                  ) : (
                     <ActivityIcon className="size-4 mr-1.5" />
                  )}
                  Vérifier maintenant
               </Button>
            </div>
         </header>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <KpiCard
               label="En ligne"
               value={loading && !summary ? "…" : reachable}
               hint={
                  summary
                     ? `${summary.up} OK · ${summary.slow} lents`
                     : undefined
               }
               tone="green"
            />
            <KpiCard
               label="Down"
               value={loading && !summary ? "…" : summary?.down ?? 0}
               tone={(summary?.down || 0) > 0 ? "red" : "muted"}
            />
            <KpiCard
               label="Lents"
               value={loading && !summary ? "…" : summary?.slow ?? 0}
               hint="≥ 700 ms"
               tone={(summary?.slow || 0) > 0 ? "amber" : "muted"}
            />
            <KpiCard
               label="Latence moy."
               value={
                  loading && !summary
                     ? "…"
                     : summary?.avgMs != null
                       ? `${summary.avgMs} ms`
                       : "—"
               }
               hint={`${summary?.total ?? 0} sites`}
               tone="white"
            />
         </div>

         <Card className="mb-6 p-0 md:p-0">
            <CardContent className="px-0">
               <Table>
                  <TableHeader className="bg-muted text-white">
                     <TableRow>
                        <TableHead className="pl-2">Site</TableHead>
                        <TableHead className="hidden sm:table-cell">Client</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="hidden md:table-cell">
                           <span className="inline-flex items-center gap-1">
                              <TimerIcon className="size-3.5" />
                              Latence
                           </span>
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">Uptime 24h</TableHead>
                        <TableHead className="hidden xl:table-cell">Tendance</TableHead>
                        <TableHead>BO</TableHead>
                        <TableHead className="w-12 pe-2"></TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading && sites.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={8} className="text-center py-8">
                              <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                           </TableCell>
                        </TableRow>
                     ) : sites.length === 0 ? (
                        <TableRow>
                           <TableCell
                              colSpan={8}
                              className="text-center py-8 text-muted-foreground"
                           >
                              Aucun site
                           </TableCell>
                        </TableRow>
                     ) : (
                        sites.map((site) => {
                           const fullUrl = site.address?.startsWith("http")
                              ? site.address
                              : `https://${site.address}`;
                           const displayUrl = stripHttps(site.address);
                           const m = site.monitor || {};
                           const backofficeUrl = site.backoffice?.trim();
                           const client =
                              site.client_company ||
                              site.client_name ||
                              "—";
                           return (
                              <TableRow key={site.id}>
                                 <TableCell className="pl-2">
                                    <a
                                       href={fullUrl}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="inline-flex items-center gap-1 text-white hover:underline"
                                    >
                                       {displayUrl || "—"}
                                       <ExternalLinkIcon className="size-3.5" />
                                    </a>
                                 </TableCell>
                                 <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                                    {client}
                                 </TableCell>
                                 <TableCell>
                                    <StateBadge
                                       state={m.state}
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
                                    <Sparkline points={m.sparkline} />
                                 </TableCell>
                                 <TableCell>
                                    {backofficeUrl ? (
                                       <span className="inline-flex items-center gap-1.5">
                                          <a
                                             href={
                                                backofficeUrl.startsWith("http")
                                                   ? backofficeUrl
                                                   : `https://${backofficeUrl}`
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
                                    <button
                                       type="button"
                                       onClick={() => openEdit(site)}
                                       className={cn(
                                          "inline-flex items-center justify-center size-8 rounded",
                                          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                       )}
                                       title="Modifier"
                                    >
                                       <PencilIcon className="size-4" />
                                    </button>
                                 </TableCell>
                              </TableRow>
                           );
                        })
                     )}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>

         <Dialog open={!!editSite} onOpenChange={(v) => !v && setEditSite(null)}>
            <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                  <DialogTitle>Modifier le site</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                     <Label htmlFor="edit-address">Adresse du site</Label>
                     <Input
                        id="edit-address"
                        value={editForm.address}
                        onChange={(e) =>
                           setEditForm((f) => ({
                              ...f,
                              address: e.target.value,
                           }))
                        }
                        placeholder="exemple.com"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="edit-backoffice">Backoffice</Label>
                     <Input
                        id="edit-backoffice"
                        value={editForm.backoffice}
                        onChange={(e) =>
                           setEditForm((f) => ({
                              ...f,
                              backoffice: e.target.value,
                           }))
                        }
                        placeholder="exemple.com/wp-admin"
                     />
                  </div>
                  <div className="flex gap-2 pt-2">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditSite(null)}
                     >
                        Annuler
                     </Button>
                     <Button onClick={handleSaveEdit} disabled={saving}>
                        {saving ? (
                           <Loader2Icon className="size-4 mr-2 animate-spin" />
                        ) : null}
                        Enregistrer
                     </Button>
                  </div>
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}
