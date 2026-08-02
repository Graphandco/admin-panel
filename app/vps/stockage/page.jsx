"use client";

import { useEffect, useState } from "react";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSystemStorage } from "@/app/actions/system";
import { Loader2Icon } from "lucide-react";
import RefreshButton from "@/components/refresh-button";
import { PruneBuildCacheButton } from "@/components/docker/PruneBuildCacheButton";

function formatDate(iso) {
   if (!iso) return "—";
   try {
      return new Date(iso).toLocaleString("fr-FR", {
         dateStyle: "medium",
         timeStyle: "short",
      });
   } catch {
      return iso;
   }
}

function UsageBar({ percent }) {
   const p = Math.min(100, Math.max(0, percent || 0));
   const color =
      p >= 90 ? "bg-red-500" : p >= 75 ? "bg-amber-500" : "bg-emerald-500";
   return (
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
         <div className={`h-full ${color}`} style={{ width: `${p}%` }} />
      </div>
   );
}

function RankList({ rows, empty, nameKey = "name", sizeKey = "sizeFormatted" }) {
   if (!rows?.length) {
      return (
         <p className="py-4 text-sm text-muted-foreground text-center">
            {empty}
         </p>
      );
   }
   return (
      <ul className="space-y-2">
         {rows.map((row) => (
            <li
               key={row._key}
               className="flex items-baseline justify-between gap-3 text-sm"
            >
               <span className="text-white truncate min-w-0" title={row[nameKey]}>
                  {row[nameKey]}
                  {row.dangling ? (
                     <Badge variant="outline" className="ml-1.5 text-[10px]">
                        dangling
                     </Badge>
                  ) : null}
                  {row.unused ? (
                     <Badge variant="outline" className="ml-1.5 text-[10px]">
                        libre
                     </Badge>
                  ) : null}
               </span>
               <span className="tabular-nums text-muted-foreground shrink-0">
                  {row[sizeKey]}
               </span>
            </li>
         ))}
      </ul>
   );
}

export default function StoragePage() {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         setData(await getSystemStorage());
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      load();
   }, []);

   const disk = data?.disk;
   const docker = data?.docker;
   const cacheLabel = docker?.buildCache?.sizeFormatted;

   return (
      <div>
         <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
               <h1 className="text-2xl font-bold text-white">Stockage</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Disque VPS et répartition Docker
               </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
               <PruneBuildCacheButton
                  cacheSizeLabel={cacheLabel}
                  onDone={() => load()}
               />
               <RefreshButton onClick={load} loading={loading} />
            </div>
         </header>

         {error ? (
            <Card className="mb-4">
               <CardContent className="py-4 text-destructive">{error}</CardContent>
            </Card>
         ) : null}

         {loading && !data ? (
            <Card>
               <CardContent className="flex items-center justify-center py-16">
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               </CardContent>
            </Card>
         ) : data ? (
            <div className="space-y-4">
               {disk ? (
                  <Card>
                     <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                           <CardTitle className="text-base">Disque</CardTitle>
                           <p className="text-xs text-muted-foreground">
                              {formatDate(data.checkedAt)}
                           </p>
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-end justify-between gap-2">
                           <p className="text-2xl font-semibold text-white tabular-nums">
                              {disk.usedFormatted}
                              <span className="text-base font-normal text-muted-foreground">
                                 {" "}
                                 / {disk.totalFormatted}
                              </span>
                           </p>
                           <Badge variant="outline">{disk.percent}% ·{" "}
                              {disk.availableFormatted} libres</Badge>
                        </div>
                        <UsageBar percent={disk.percent} />
                     </CardContent>
                  </Card>
               ) : null}

               {docker ? (
                  <>
                     <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                        <Card>
                           <CardHeader className="pb-1">
                              <CardTitle className="text-xs text-muted-foreground">
                                 Images
                              </CardTitle>
                           </CardHeader>
                           <CardContent>
                              <p className="text-xl font-semibold text-white tabular-nums">
                                 {docker.images?.sizeFormatted}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                 {docker.images?.count ?? 0} image
                                 {(docker.images?.count ?? 0) > 1 ? "s" : ""}
                                 {docker.images?.dangling
                                    ? ` · ${docker.images.dangling} dangling`
                                    : ""}
                              </p>
                           </CardContent>
                        </Card>
                        <Card>
                           <CardHeader className="pb-1">
                              <CardTitle className="text-xs text-muted-foreground">
                                 Volumes
                              </CardTitle>
                           </CardHeader>
                           <CardContent>
                              <p className="text-xl font-semibold text-white tabular-nums">
                                 {docker.volumes?.sizeFormatted}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                 {docker.volumes?.count ?? 0} volume
                                 {(docker.volumes?.count ?? 0) > 1 ? "s" : ""}
                              </p>
                           </CardContent>
                        </Card>
                        <Card>
                           <CardHeader className="pb-1">
                              <CardTitle className="text-xs text-muted-foreground">
                                 Conteneurs (écritures)
                              </CardTitle>
                           </CardHeader>
                           <CardContent>
                              <p className="text-xl font-semibold text-white tabular-nums">
                                 {docker.containers?.sizeFormatted}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                 Données RW des conteneurs
                              </p>
                           </CardContent>
                        </Card>
                        <Card className="border-primary/20">
                           <CardHeader className="pb-1">
                              <CardTitle className="text-xs text-muted-foreground">
                                 Build cache
                              </CardTitle>
                           </CardHeader>
                           <CardContent className="space-y-2">
                              <p className="text-xl font-semibold text-white tabular-nums">
                                 {docker.buildCache?.sizeFormatted}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                 Accélère les builds — safe à vider
                              </p>
                              <PruneBuildCacheButton
                                 size="sm"
                                 variant="secondary"
                                 label="Vider"
                                 cacheSizeLabel={cacheLabel}
                                 onDone={() => load()}
                                 className="w-full sm:w-auto"
                              />
                           </CardContent>
                        </Card>
                     </div>

                     <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                           <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                 Plus grosses images
                              </CardTitle>
                           </CardHeader>
                           <CardContent>
                              <RankList
                                 empty="Aucune image"
                                 rows={(docker.topImages || []).map((i) => ({
                                    ...i,
                                    _key: i.id,
                                 }))}
                              />
                           </CardContent>
                        </Card>
                        <Card>
                           <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                 Plus gros volumes
                              </CardTitle>
                           </CardHeader>
                           <CardContent>
                              <RankList
                                 empty="Aucun volume"
                                 rows={(docker.topVolumes || []).map((v) => ({
                                    ...v,
                                    _key: v.name,
                                 }))}
                              />
                           </CardContent>
                        </Card>
                     </div>

                     {(docker.topContainers || []).length > 0 ? (
                        <Card>
                           <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                 Conteneurs — données écrites (RW)
                              </CardTitle>
                           </CardHeader>
                           <CardContent>
                              <RankList
                                 empty="—"
                                 rows={(docker.topContainers || []).map((c) => ({
                                    ...c,
                                    _key: c.id,
                                    sizeFormatted: c.sizeRwFormatted,
                                 }))}
                              />
                           </CardContent>
                        </Card>
                     ) : null}
                  </>
               ) : data.dockerError ? (
                  <Card>
                     <CardContent className="py-4 text-destructive">
                        Docker : {data.dockerError}
                     </CardContent>
                  </Card>
               ) : null}
            </div>
         ) : null}
      </div>
   );
}
