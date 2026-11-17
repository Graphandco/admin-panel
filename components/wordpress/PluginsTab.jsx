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
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
   CardAction,
} from "@/components/ui/card";
import RefreshButton from "@/components/refresh-button";
import {
   Loader2Icon,
   ArrowUpCircle,
   PackageIcon,
   PowerIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
   wordpressPlugins,
   wordpressPluginUpdate,
} from "@/app/actions/wordpress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
   mutateUpdateCounts,
   refreshAndMutateUpdateCounts,
} from "@/hooks/use-update-counts";
import { WORDPRESS_PLUGINS_KEY } from "@/components/wordpress/PluginsCard";

function StatusBadge({ plugin }) {
   if (plugin.active) {
      return (
         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400">
            Actif
            {plugin.active_count > 0 ? ` · ${plugin.active_count}` : ""}
         </span>
      );
   }
   return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-600 dark:text-slate-400">
         Inactif
      </span>
   );
}

function ProBadge() {
   return (
      <span className="inline-flex items-center px-1.5 py-0 rounded text-[10px] font-semibold uppercase tracking-wide bg-violet-500/20 text-violet-600 dark:text-violet-400">
         Pro
      </span>
   );
}

function UpdateBadge({ update, updateVersion }) {
   if (!update || update !== "available") return null;
   return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400">
         <ArrowUpCircle className="size-3.5" />
         {updateVersion ? `v${updateVersion}` : "Update"}
      </span>
   );
}

function MiniStat({ icon: Icon, iconClass, label, value, loading, tone }) {
   return (
      <Card className="h-min">
         <CardHeader>
            <CardTitle className="flex items-center gap-2 min-w-0">
               <div
                  className={cn(
                     "size-10 p-2 rounded-md flex items-center justify-center border",
                     iconClass,
                  )}
               >
                  <Icon className="size-5 opacity-90" />
               </div>
               <span className="text-sm md:text-base font-medium text-white truncate">
                  {label}
               </span>
            </CardTitle>
            <CardAction>
               {loading ? (
                  <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
               ) : (
                  <span
                     className={cn(
                        "text-xl md:text-2xl font-bold tabular-nums",
                        tone,
                     )}
                  >
                     {value}
                  </span>
               )}
            </CardAction>
         </CardHeader>
      </Card>
   );
}

export default function PluginsTab() {
   const [updatingPlugin, setUpdatingPlugin] = useState(null);
   const [filter, setFilter] = useState("updates");

   const {
      data,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR(WORDPRESS_PLUGINS_KEY, () => wordpressPlugins());

   const plugins = data?.plugins || [];
   const summary = data?.summary || {
      total: plugins.length,
      active: plugins.filter((p) => p.active).length,
      updates: plugins.filter((p) => p.update === "available").length,
   };
   const error = fetchError?.message || null;

   const filtered = useMemo(() => {
      if (filter === "updates") {
         return plugins.filter((p) => p.update === "available");
      }
      if (filter === "active") {
         return plugins.filter((p) => p.active);
      }
      if (filter === "inactive") {
         return plugins.filter((p) => !p.active);
      }
      return plugins;
   }, [plugins, filter]);

   async function loadPlugins() {
      await mutate();
   }

   async function handleUpdate(p) {
      if (!p.name || p.update !== "available" || p.is_pro) return;
      setUpdatingPlugin(p.name);
      try {
         await wordpressPluginUpdate({ plugin: p.name });
         // Optimistic : retire le flag update tout de suite
         await mutate(
            (current) => {
               if (!current?.plugins) return current;
               const nextPlugins = current.plugins.map((row) =>
                  row.name === p.name
                     ? { ...row, update: "none", update_version: null }
                     : row,
               );
               const updates = nextPlugins.filter(
                  (row) => row.update === "available",
               ).length;
               return {
                  ...current,
                  plugins: nextPlugins,
                  summary: {
                     ...(current.summary || {}),
                     total: nextPlugins.length,
                     active: nextPlugins.filter((row) => row.active).length,
                     updates,
                  },
               };
            },
            { revalidate: false },
         );
         toast.success(`${p.title || p.name} mis à jour`);
         // Rescan compteurs notifications (badge) + refresh liste
         try {
            await refreshAndMutateUpdateCounts("wordpress");
         } catch {
            await mutateUpdateCounts();
         }
         await mutate();
      } catch (err) {
         toast.error(err.message || "Erreur lors de la mise à jour");
         await mutate();
      } finally {
         setUpdatingPlugin(null);
      }
   }

   if (error) {
      return (
         <Card className="p-6">
            <div className="text-destructive flex items-center gap-3">
               <p>{error}</p>
               <Button variant="outline" size="sm" onClick={loadPlugins}>
                  Réessayer
               </Button>
            </div>
         </Card>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
               Extensions du réseau — Actif = activé sur au moins un site.
            </p>
            <RefreshButton
               onClick={loadPlugins}
               loading={loading || isValidating}
            />
         </div>

         <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <MiniStat
               icon={PackageIcon}
               iconClass="bg-[#21759b]/10 border-[#21759b]/20 text-[#21759b]"
               label="Extensions"
               value={summary.total}
               loading={loading}
            />
            <MiniStat
               icon={PowerIcon}
               iconClass="bg-green-500/10 border-green-500/20 text-green-500"
               label="Actives"
               value={summary.active}
               loading={loading}
               tone="text-green-500"
            />
            <MiniStat
               icon={ArrowUpCircle}
               iconClass="bg-amber-500/10 border-amber-500/20 text-amber-500"
               label="Mises à jour"
               value={summary.updates}
               loading={loading}
               tone="text-amber-500"
            />
         </div>

         <div className="flex flex-wrap gap-2">
            {[
               { id: "updates", label: "À mettre à jour" },
               { id: "active", label: "Actives" },
               { id: "inactive", label: "Inactives" },
               { id: "all", label: "Toutes" },
            ].map((f) => (
               <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                     "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                     filter === f.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted",
                  )}
               >
                  {f.label}
               </button>
            ))}
         </div>

         <Card className="p-0 md:p-0">
            <CardContent className="px-0">
               <Table>
                  <TableHeader className="bg-muted text-white">
                     <TableRow>
                        <TableHead>
                           <span className="pl-2">Plugin</span>
                        </TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Mise à jour</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow>
                           <TableCell colSpan={4} className="text-center py-8">
                              <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                           </TableCell>
                        </TableRow>
                     ) : filtered.length === 0 ? (
                        <TableRow>
                           <TableCell
                              colSpan={4}
                              className="text-center py-8 text-muted-foreground"
                           >
                              Aucun plugin
                           </TableCell>
                        </TableRow>
                     ) : (
                        filtered.map((p) => (
                           <TableRow key={p.name}>
                              <TableCell className="text-sm">
                                 <div className="pl-2">
                                    <span className="inline-flex items-center gap-1.5 flex-wrap font-medium">
                                       {p.title || p.name}
                                       {p.is_pro ? <ProBadge /> : null}
                                    </span>
                                    {p.active_sites?.length > 0 ? (
                                       <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                          {p.active_sites
                                             .slice(0, 3)
                                             .map((s) => s.name || s.url)
                                             .join(" · ")}
                                          {p.active_sites.length > 3
                                             ? ` +${p.active_sites.length - 3}`
                                             : ""}
                                       </p>
                                    ) : null}
                                 </div>
                              </TableCell>
                              <TableCell className="text-sm font-mono text-muted-foreground">
                                 {p.version || "—"}
                              </TableCell>
                              <TableCell>
                                 <StatusBadge plugin={p} />
                              </TableCell>
                              <TableCell>
                                 <div className="flex flex-wrap items-center gap-2">
                                    <UpdateBadge
                                       update={p.update}
                                       updateVersion={p.update_version}
                                    />
                                    {p.update === "available" && (
                                       <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleUpdate(p)}
                                          disabled={
                                             p.is_pro ||
                                             updatingPlugin != null
                                          }
                                          className="shrink-0"
                                          title={
                                             p.is_pro
                                                ? "Mise à jour manuelle requise (extension Pro)"
                                                : undefined
                                          }
                                       >
                                          {updatingPlugin === p.name ? (
                                             <Loader2Icon className="size-4 animate-spin" />
                                          ) : (
                                             "Mettre à jour"
                                          )}
                                       </Button>
                                    )}
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))
                     )}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>
      </div>
   );
}
