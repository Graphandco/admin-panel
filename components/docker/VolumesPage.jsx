"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import {
   dockerVolumes,
   dockerVolumesPrune,
   dockerVolumesRemove,
} from "@/app/actions/docker";
import RefreshButton from "@/components/refresh-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
   CheckCircle2Icon,
   ChevronDownIcon,
   ChevronRightIcon,
   HardDriveIcon,
   Loader2Icon,
   SearchIcon,
   Trash2Icon,
   TriangleAlertIcon,
} from "lucide-react";

function formatDate(iso) {
   if (!iso) return "—";
   const d = new Date(iso);
   if (isNaN(d.getTime())) return "—";
   return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });
}

function SummaryCard({ label, value, hint, className }) {
   return (
      <Card className={cn("p-0", className)}>
         <CardContent className="px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold text-white mt-0.5">{value}</p>
            {hint ? (
               <p className="text-[11px] text-muted-foreground mt-0.5">
                  {hint}
               </p>
            ) : null}
         </CardContent>
      </Card>
   );
}

export default function VolumesPage() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("docker-volumes", () => dockerVolumes());

   const error = fetchError?.message || null;
   const volumes = data?.volumes || [];
   const bindMounts = data?.bindMounts || [];
   const summary = data?.summary;

   const [mounted, setMounted] = useState(false);
   const [search, setSearch] = useState("");
   const [filter, setFilter] = useState("all");
   const [expandedName, setExpandedName] = useState(null);
   const [showBinds, setShowBinds] = useState(false);
   const [confirmOne, setConfirmOne] = useState(null);
   const [confirmPrune, setConfirmPrune] = useState(false);
   const [removing, setRemoving] = useState(false);

   useEffect(() => {
      setMounted(true);
   }, []);

   const filteredVolumes = useMemo(() => {
      const q = search.trim().toLowerCase();
      return volumes.filter((v) => {
         if (filter === "unused" && !v.unused) return false;
         if (filter === "used" && v.unused) return false;
         if (!q) return true;
         const hay = [
            v.name,
            v.composeProject,
            v.composeVolume,
            v.driver,
            ...(v.containers || []).map(
               (c) =>
                  `${c.name} ${c.image} ${c.destination} ${c.project || ""}`,
            ),
         ]
            .join(" ")
            .toLowerCase();
         return hay.includes(q);
      });
   }, [volumes, search, filter]);

   async function load() {
      await mutate();
   }

   async function runRemoveOne() {
      if (!confirmOne) return;
      setRemoving(true);
      try {
         const res = await dockerVolumesRemove({ name: confirmOne.name });
         if (!res.success) {
            toast.error(res.error || "Échec de la suppression");
            return;
         }
         toast.success(
            `Volume « ${confirmOne.name} » supprimé (${res.sizeFormatted || ""})`,
         );
         setConfirmOne(null);
         await load();
      } finally {
         setRemoving(false);
      }
   }

   async function runPrune() {
      setRemoving(true);
      try {
         const res = await dockerVolumesPrune();
         if (!res.success) {
            toast.error(res.error || "Échec du prune");
            return;
         }
         toast.success(
            res.removed
               ? `${res.removed} volume(s) supprimé(s) · ${res.spaceReclaimedFormatted || "0 B"}`
               : "Aucun volume orphelin à supprimer",
         );
         setConfirmPrune(false);
         await load();
      } finally {
         setRemoving(false);
      }
   }

   const refreshPortal =
      mounted &&
      createPortal(
         <RefreshButton
            onClick={() => load()}
            loading={loading || isValidating}
            disabled={removing}
         />,
         document.getElementById("docker-refresh-portal"),
      );

   return (
      <>
         {refreshPortal}

         <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <SummaryCard
               label="Volumes nommés"
               value={loading ? "…" : (summary?.count ?? 0)}
               hint={
                  summary
                     ? `${summary.inUse} utilisé(s) · ${summary.unused} orphelin(s)`
                     : null
               }
            />
            <SummaryCard
               label="Espace total"
               value={loading ? "…" : summary?.totalSizeFormatted || "—"}
            />
            <SummaryCard
               label="Récupérable"
               value={loading ? "…" : summary?.reclaimableFormatted || "—"}
               hint={
                  summary?.unused
                     ? `${summary.unused} volume(s) orphelin(s)`
                     : "Aucun orphelin"
               }
            />
            <SummaryCard
               label="Bind mounts"
               value={loading ? "…" : (summary?.bindMountCount ?? 0)}
               hint="Chemins hôte montés dans les conteneurs"
            />
         </div>

         <Card className="p-0 md:p-0">
            <CardHeader className="flex flex-col gap-3 px-4 pt-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
               <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                     <HardDriveIcon className="size-4 text-muted-foreground" />
                     Volumes nommés
                     {!loading ? (
                        <span className="text-muted-foreground font-normal">
                           ({filteredVolumes.length}
                           {filteredVolumes.length !== volumes.length
                              ? ` / ${volumes.length}`
                              : ""}
                           )
                        </span>
                     ) : null}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                     Volumes Docker persistants. Les images ne sont pas liées
                     directement — seulement via les conteneurs qui les
                     montent.
                  </p>
               </div>
               <div className="flex flex-wrap items-center gap-2">
                  {(summary?.unused ?? 0) > 0 ? (
                     <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmPrune(true)}
                        disabled={removing || loading}
                     >
                        <Trash2Icon className="size-4" />
                        Prune orphelins
                     </Button>
                  ) : null}
               </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
               <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1 max-w-md">
                     <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                     <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher volume, conteneur, chemin…"
                        className="pl-8"
                     />
                  </div>
                  <div className="flex gap-1">
                     {[
                        { id: "all", label: "Tous" },
                        { id: "used", label: "Utilisés" },
                        { id: "unused", label: "Orphelins" },
                     ].map((f) => (
                        <Button
                           key={f.id}
                           type="button"
                           size="sm"
                           variant={filter === f.id ? "secondary" : "ghost"}
                           onClick={() => setFilter(f.id)}
                        >
                           {f.label}
                        </Button>
                     ))}
                  </div>
               </div>

               {error ? (
                  <p className="py-6 text-sm text-destructive">{error}</p>
               ) : loading ? (
                  <div className="flex justify-center py-12">
                     <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                  </div>
               ) : filteredVolumes.length === 0 ? (
                  <p className="py-8 text-sm text-center text-muted-foreground">
                     Aucun volume correspondant
                  </p>
               ) : (
                  <Table>
                     <TableHeader className="bg-muted text-white">
                        <TableRow>
                           <TableHead className="w-8" />
                           <TableHead>Nom</TableHead>
                           <TableHead>Statut</TableHead>
                           <TableHead className="hidden md:table-cell">
                              Conteneurs
                           </TableHead>
                           <TableHead className="hidden sm:table-cell">
                              Taille
                           </TableHead>
                           <TableHead className="hidden lg:table-cell">
                              Driver
                           </TableHead>
                           <TableHead className="w-[1%] text-right">
                              Action
                           </TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {filteredVolumes.map((vol) => {
                           const open = expandedName === vol.name;
                           const containerCount =
                              vol.containers?.length || vol.refCount || 0;
                           return (
                              <Fragment key={vol.name}>
                                 <TableRow
                                    className={cn(
                                       "cursor-pointer",
                                       open && "bg-muted/30",
                                    )}
                                    onClick={() =>
                                       setExpandedName(
                                          open ? null : vol.name,
                                       )
                                    }
                                 >
                                    <TableCell className="w-8 px-2">
                                       {open ? (
                                          <ChevronDownIcon className="size-4 text-muted-foreground" />
                                       ) : (
                                          <ChevronRightIcon className="size-4 text-muted-foreground" />
                                       )}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-white max-w-50 truncate">
                                       {vol.name}
                                    </TableCell>
                                    <TableCell>
                                       {vol.unused ? (
                                          <Badge
                                             variant="outline"
                                             className="gap-1 border-amber-500/40 text-amber-400"
                                          >
                                             <TriangleAlertIcon className="size-3" />
                                             Orphelin
                                          </Badge>
                                       ) : (
                                          <Badge
                                             variant="outline"
                                             className="gap-1 border-emerald-500/40 text-emerald-400"
                                          >
                                             <CheckCircle2Icon className="size-3" />
                                             Utilisé
                                          </Badge>
                                       )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-60">
                                       {containerCount ? (
                                          <span className="line-clamp-2">
                                             {vol.containers
                                                ?.map(
                                                   (c) =>
                                                      `${c.name}${c.state === "running" ? "" : ` (${c.state})`}`,
                                                )
                                                .join(", ")}
                                          </span>
                                       ) : (
                                          "—"
                                       )}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-muted-foreground whitespace-nowrap">
                                       {vol.sizeFormatted}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                                       {vol.driver}
                                    </TableCell>
                                    <TableCell
                                       className="text-right"
                                       onClick={(e) => e.stopPropagation()}
                                    >
                                       {vol.unused ? (
                                          <Button
                                             variant="ghost"
                                             size="icon-sm"
                                             className="text-destructive hover:text-destructive"
                                             onClick={() => setConfirmOne(vol)}
                                             disabled={removing}
                                             aria-label={`Supprimer ${vol.name}`}
                                          >
                                             <Trash2Icon className="size-4" />
                                          </Button>
                                       ) : null}
                                    </TableCell>
                                 </TableRow>
                                 {open ? (
                                    <TableRow className="hover:bg-transparent">
                                       <TableCell
                                          colSpan={7}
                                          className="bg-black/20 px-4 py-4"
                                       >
                                          <div className="grid gap-4 text-sm md:grid-cols-2">
                                             <div className="space-y-2">
                                                <p className="text-xs font-medium text-muted-foreground">
                                                   Détails
                                                </p>
                                                <dl className="space-y-1 text-sm">
                                                   <div className="flex gap-2">
                                                      <dt className="text-muted-foreground shrink-0">
                                                         Scope :
                                                      </dt>
                                                      <dd>{vol.scope}</dd>
                                                   </div>
                                                   {vol.composeProject ? (
                                                      <div className="flex gap-2">
                                                         <dt className="text-muted-foreground shrink-0">
                                                            Compose :
                                                         </dt>
                                                         <dd>
                                                            {vol.composeProject}
                                                            {vol.composeVolume
                                                               ? ` / ${vol.composeVolume}`
                                                               : ""}
                                                         </dd>
                                                      </div>
                                                   ) : null}
                                                   {vol.createdAt ? (
                                                      <div className="flex gap-2">
                                                         <dt className="text-muted-foreground shrink-0">
                                                            Créé :
                                                         </dt>
                                                         <dd>
                                                            {formatDate(
                                                               vol.createdAt,
                                                            )}
                                                         </dd>
                                                      </div>
                                                   ) : null}
                                                   {vol.mountpoint ? (
                                                      <div className="flex gap-2">
                                                         <dt className="text-muted-foreground shrink-0">
                                                            Mountpoint :
                                                         </dt>
                                                         <dd className="font-mono text-xs break-all">
                                                            {vol.mountpoint}
                                                         </dd>
                                                      </div>
                                                   ) : null}
                                                </dl>
                                             </div>
                                             <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                                                   Conteneurs attachés
                                                </p>
                                                {vol.containers?.length ? (
                                                   <ul className="space-y-2">
                                                      {vol.containers.map(
                                                         (c) => (
                                                            <li
                                                               key={`${c.id}-${c.destination}`}
                                                               className="rounded-md border border-border/60 bg-black/30 px-3 py-2"
                                                            >
                                                               <div className="flex flex-wrap items-center gap-2">
                                                                  <Link
                                                                     href="/docker"
                                                                     className="font-medium text-primary hover:underline"
                                                                     onClick={(
                                                                        e,
                                                                     ) =>
                                                                        e.stopPropagation()
                                                                     }
                                                                  >
                                                                     {c.name}
                                                                  </Link>
                                                                  <Badge
                                                                     variant="outline"
                                                                     className="text-[10px]"
                                                                  >
                                                                     {c.state}
                                                                  </Badge>
                                                                  {c.readOnly ? (
                                                                     <Badge
                                                                        variant="outline"
                                                                        className="text-[10px]"
                                                                     >
                                                                        RO
                                                                     </Badge>
                                                                  ) : null}
                                                               </div>
                                                               <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                                                                  {c.destination}
                                                               </p>
                                                               <p className="text-xs text-muted-foreground mt-0.5">
                                                                  Image :{" "}
                                                                  <span className="text-white/80">
                                                                     {c.image}
                                                                  </span>
                                                                  {c.project
                                                                     ? ` · ${c.project}${c.service ? `/${c.service}` : ""}`
                                                                     : ""}
                                                               </p>
                                                            </li>
                                                         ),
                                                      )}
                                                   </ul>
                                                ) : (
                                                   <p className="text-muted-foreground text-sm">
                                                      Aucun conteneur attaché
                                                   </p>
                                                )}
                                             </div>
                                          </div>
                                       </TableCell>
                                    </TableRow>
                                 ) : null}
                              </Fragment>
                           );
                        })}
                     </TableBody>
                  </Table>
               )}

               {data?.checkedAt ? (
                  <p className="text-[11px] text-muted-foreground text-right">
                     Dernière mise à jour : {formatDate(data.checkedAt)}
                  </p>
               ) : null}
            </CardContent>
         </Card>

         {bindMounts.length > 0 ? (
            <Card className="mt-6 p-0 md:p-0">
               <CardHeader className="px-4 pt-4 pb-2">
                  <button
                     type="button"
                     className="flex w-full items-center justify-between gap-2 text-left"
                     onClick={() => setShowBinds((v) => !v)}
                  >
                     <div>
                        <CardTitle className="text-base text-white">
                           Bind mounts ({bindMounts.length})
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 font-normal">
                           Chemins du système hôte montés directement — non
                           gérés comme volumes Docker nommés.
                        </p>
                     </div>
                     {showBinds ? (
                        <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground" />
                     ) : (
                        <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" />
                     )}
                  </button>
               </CardHeader>
               {showBinds ? (
                  <CardContent className="px-0 pb-0">
                     <Table>
                        <TableHeader className="bg-muted text-white">
                           <TableRow>
                              <TableHead>Source (hôte)</TableHead>
                              <TableHead>Destination</TableHead>
                              <TableHead>Conteneur</TableHead>
                              <TableHead className="hidden sm:table-cell">
                                 Image
                              </TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {bindMounts.map((b, i) => (
                              <TableRow key={`${b.source}-${b.destination}-${i}`}>
                                 <TableCell className="font-mono text-xs text-white max-w-55 break-all">
                                    {b.source}
                                 </TableCell>
                                 <TableCell className="font-mono text-xs text-muted-foreground max-w-45 break-all">
                                    {b.destination}
                                    {b.readOnly ? " (ro)" : ""}
                                 </TableCell>
                                 <TableCell>
                                    <Link
                                       href="/docker"
                                       className="text-sm text-primary hover:underline"
                                    >
                                       {b.container?.name}
                                    </Link>
                                    <span className="text-muted-foreground text-xs ml-1">
                                       ({b.container?.state})
                                    </span>
                                 </TableCell>
                                 <TableCell className="hidden sm:table-cell text-xs text-muted-foreground max-w-50 truncate">
                                    {b.container?.image}
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </CardContent>
               ) : null}
            </Card>
         ) : null}

         <ConfirmDialog
            open={!!confirmOne}
            onOpenChange={(open) => !open && setConfirmOne(null)}
            title="Supprimer ce volume ?"
            description={
               confirmOne
                  ? `Supprimer définitivement le volume « ${confirmOne.name} » (${confirmOne.sizeFormatted}) ? Cette action est irréversible.`
                  : null
            }
            confirmLabel="Supprimer"
            variant="destructive"
            confirming={removing}
            onConfirm={runRemoveOne}
         />

         <ConfirmDialog
            open={confirmPrune}
            onOpenChange={setConfirmPrune}
            title="Prune des volumes orphelins ?"
            description={`Supprimer ${summary?.unused || 0} volume(s) non utilisé(s) (${summary?.reclaimableFormatted || ""}) ? Les volumes encore attachés à un conteneur ne seront pas touchés.`}
            confirmLabel="Prune orphelins"
            variant="destructive"
            confirming={removing}
            onConfirm={runPrune}
         />
      </>
   );
}
