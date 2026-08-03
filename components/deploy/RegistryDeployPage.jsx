"use client";
import RefreshButton from "@/components/refresh-button";

import { useEffect, useMemo, useState } from "react";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { getRegistrySites, redeployRegistrySite } from "@/app/actions/deploy";
import { getRegistryOverview } from "@/app/actions/registry";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { Loader2Icon, RocketIcon } from "lucide-react";

export default function RegistryDeployPage() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("registry-deploy", async () => {
      const [sitesRes, registryRes] = await Promise.all([
         getRegistrySites(),
         getRegistryOverview(),
      ]);
      const tagsByRepo = {};
      for (const repo of registryRes.repositories || []) {
         tagsByRepo[repo.name] = (repo.tags || [])
            .map((t) => (typeof t === "string" ? t : t.name))
            .filter(Boolean);
      }
      return {
         sites: sitesRes.sites || [],
         pullHost: sitesRes.pullHost || registryRes.host || null,
         tagsByRepo,
      };
   });
   const error = fetchError?.message || null;
   const sites = data?.sites || [];
   const pullHost = data?.pullHost || null;
   const tagsByRepo = data?.tagsByRepo || {};
   const [selectedTags, setSelectedTags] = useState({});
   const [deployingId, setDeployingId] = useState(null);
   const [confirmDeploy, setConfirmDeploy] = useState(null);

   useEffect(() => {
      setSelectedTags((prev) => {
         const next = { ...prev };
         let changed = false;
         for (const site of sites) {
            if (!next[site.id]) {
               next[site.id] = site.currentTag || "latest";
               changed = true;
            }
         }
         return changed ? next : prev;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [sites]);

   async function load() {
      await mutate();
   }

   const reposMissingTags = useMemo(() => {
      const missing = new Set();
      for (const site of sites) {
         if (!tagsByRepo[site.repo]?.length) missing.add(site.repo);
      }
      return [...missing];
   }, [sites, tagsByRepo]);

   function requestDeploy(site) {
      const tag = selectedTags[site.id] || site.currentTag;
      if (!tag) {
         toast.error("Choisissez un tag");
         return;
      }
      if (tag === site.currentTag) {
         setConfirmDeploy({
            site,
            tag,
            title: "Relancer ce déploiement ?",
            description: `Le tag « ${tag} » est déjà celui du compose. Relancer quand même (pull + recreate) ?`,
         });
      } else {
         setConfirmDeploy({
            site,
            tag,
            title: "Déployer cette image ?",
            description: `Déployer ${site.name} avec ${site.host}/${site.repo}:${tag} ?\nLe docker-compose.yml sera mis à jour.`,
         });
      }
   }

   async function runDeploy() {
      if (!confirmDeploy) return;
      const { site, tag } = confirmDeploy;
      setConfirmDeploy(null);
      setDeployingId(site.id);
      try {
         const res = await redeployRegistrySite(site.id, tag);
         if (!res?.success) {
            toast.error(res?.error || "Échec du déploiement");
            return;
         }
         toast.success(`Déployé : ${res.image}`);
         await load();
      } catch (err) {
         toast.error(err.message || "Échec du déploiement");
      } finally {
         setDeployingId(null);
      }
   }

   return (
      <div className="space-y-4">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
               Sites utilisant{" "}
               <span className="text-white font-medium">
                  {pullHost || "le registry custom"}
               </span>
               {" — "}
               choix du tag, mise à jour du compose, pull et recreate
            </p>
            <RefreshButton
               onClick={load}
               loading={loading || isValidating}
               disabled={!!deployingId}
            />
         </div>

         {error && (
            <Card>
               <CardContent className="py-4 text-destructive">{error}</CardContent>
            </Card>
         )}

         {reposMissingTags.length > 0 && !loading && (
            <p className="text-xs text-amber-500">
               Tags introuvables dans le registry pour :{" "}
               {reposMissingTags.join(", ")}
            </p>
         )}

         <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-base">
                  Sites registry ({sites.length})
               </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
               {loading && sites.length === 0 ? (
                  <div className="flex justify-center py-12">
                     <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
                  </div>
               ) : sites.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                     Aucun conteneur n’utilise le registry custom
                  </p>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Site</TableHead>
                           <TableHead>Image actuelle</TableHead>
                           <TableHead>État</TableHead>
                           <TableHead>Tag</TableHead>
                           <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {sites.map((site) => {
                           const tags = tagsByRepo[site.repo] || [];
                           const tagOptions =
                              tags.length > 0
                                 ? tags
                                 : [site.currentTag].filter(Boolean);
                           const selected =
                              selectedTags[site.id] || site.currentTag || "";
                           const busy = deployingId === site.id;

                           return (
                              <TableRow key={site.id}>
                                 <TableCell>
                                    <div className="font-medium text-white">
                                       {site.name}
                                    </div>
                                    {(site.project || site.service) && (
                                       <div className="text-xs text-muted-foreground">
                                          {[site.project, site.service]
                                             .filter(Boolean)
                                             .join(" / ")}
                                       </div>
                                    )}
                                 </TableCell>
                                 <TableCell>
                                    <code className="text-xs text-muted-foreground break-all">
                                       {site.image}
                                    </code>
                                 </TableCell>
                                 <TableCell>
                                    <Badge
                                       variant={
                                          site.state === "running"
                                             ? "default"
                                             : "outline"
                                       }
                                    >
                                       {site.state || "—"}
                                    </Badge>
                                 </TableCell>
                                 <TableCell>
                                    <Select
                                       value={selected}
                                       onValueChange={(v) =>
                                          setSelectedTags((prev) => ({
                                             ...prev,
                                             [site.id]: v,
                                          }))
                                       }
                                       disabled={busy || tagOptions.length === 0}
                                    >
                                       <SelectTrigger
                                          size="sm"
                                          className="min-w-[140px]"
                                       >
                                          <SelectValue placeholder="Tag" />
                                       </SelectTrigger>
                                       <SelectContent>
                                          {tagOptions.map((t) => (
                                             <SelectItem key={t} value={t}>
                                                {t}
                                                {t === site.currentTag
                                                   ? " (actuel)"
                                                   : ""}
                                             </SelectItem>
                                          ))}
                                       </SelectContent>
                                    </Select>
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <Button
                                       size="sm"
                                       onClick={() => requestDeploy(site)}
                                       disabled={
                                          busy ||
                                          !!deployingId ||
                                          !selected ||
                                          !site.service
                                       }
                                       title={
                                          !site.service
                                             ? "Pas de labels compose"
                                             : undefined
                                       }
                                       className="inline-flex items-center gap-1"
                                    >
                                       {busy ? (
                                          <Loader2Icon className="size-4 animate-spin" />
                                       ) : (
                                          <RocketIcon className="size-4" />
                                       )}
                                       Déployer
                                    </Button>
                                 </TableCell>
                              </TableRow>
                           );
                        })}
                     </TableBody>
                  </Table>
               )}
            </CardContent>
         </Card>

         <ConfirmDialog
            open={!!confirmDeploy}
            onOpenChange={(o) => !o && setConfirmDeploy(null)}
            title={confirmDeploy?.title || "Confirmer"}
            description={confirmDeploy?.description}
            confirmLabel="Déployer"
            onConfirm={runDeploy}
         />
      </div>
   );
}
