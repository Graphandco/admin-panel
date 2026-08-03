"use client";

import { useState, Fragment } from "react";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
   CheckCircle2Icon,
   CopyIcon,
   Loader2Icon,
   RefreshCwIcon,
   Trash2Icon,
   TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
   dockerDanglingImages,
   dockerDanglingImagesRemove,
} from "@/app/actions/docker";
import { cn } from "@/lib/utils";

function formatCreated(created) {
   if (created == null) return "—";
   const date =
      typeof created === "number"
         ? new Date(created * 1000)
         : new Date(created);
   if (isNaN(date.getTime())) return "—";
   return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
   });
}

async function copyText(text) {
   try {
      await navigator.clipboard.writeText(text);
      toast.success("Commandes copiées");
   } catch {
      toast.error("Impossible de copier");
   }
}

/**
 * Images dangling locales + ancestors + commandes / suppression des libres.
 */
export function DanglingImagesSection() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("docker-dangling-images", () => dockerDanglingImages());
   const error = fetchError?.message || null;
   const images = data?.images || [];
   const freeCount = data?.freeCount ?? 0;
   const inUseCount = data?.inUseCount ?? 0;

   const [confirmOne, setConfirmOne] = useState(null);
   const [confirmFree, setConfirmFree] = useState(false);
   const [removing, setRemoving] = useState(false);
   const [expandedId, setExpandedId] = useState(null);

   async function load() {
      await mutate();
   }

   async function runRemoveOne() {
      if (!confirmOne) return;
      setRemoving(true);
      try {
         const res = await dockerDanglingImagesRemove({ id: confirmOne.id });
         if (!res.success) {
            toast.error(res.error || "Échec de la suppression");
            return;
         }
         toast.success(
            `Image ${res.removed} supprimée (${res.sizeFormatted || ""})`,
         );
         setConfirmOne(null);
         await load();
      } finally {
         setRemoving(false);
      }
   }

   async function runRemoveFree() {
      setRemoving(true);
      try {
         const res = await dockerDanglingImagesRemove({ allFree: true });
         if (!res.success) {
            toast.error(res.error || "Échec de la suppression");
            return;
         }
         toast.success(
            res.removed
               ? `${res.removed} image(s) libre(s) · ${res.spaceReclaimedFormatted || "0 B"}`
               : "Aucune image libre à supprimer",
         );
         setConfirmFree(false);
         await load();
      } finally {
         setRemoving(false);
      }
   }

   return (
      <section className="mt-8">
         <Card className="mb-0 p-0 md:p-0">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-2">
               <div>
                  <CardTitle className="text-base">
                     Images dangling
                     {!loading ? (
                        <span className="text-muted-foreground font-normal">
                           {" "}
                           ({images.length})
                        </span>
                     ) : null}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                     Images &lt;none&gt; sans tag. Si un conteneur tourne encore
                     dessus, recreate via compose avant de supprimer.
                     {inUseCount || freeCount ? (
                        <>
                           {" "}
                           · {inUseCount} utilisée
                           {inUseCount > 1 ? "s" : ""}
                           {freeCount
                              ? ` · ${freeCount} libre${freeCount > 1 ? "s" : ""} (${data?.reclaimableFormatted || ""})`
                              : null}
                        </>
                     ) : null}
                  </p>
               </div>
               <div className="flex items-center gap-2">
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={() => load()}
                     disabled={loading || isValidating || removing}
                  >
                     {isValidating ? (
                        <Loader2Icon className="size-4 animate-spin" />
                     ) : (
                        <RefreshCwIcon className="size-4" />
                     )}
                     Actualiser
                  </Button>
                  {freeCount > 0 ? (
                     <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmFree(true)}
                        disabled={removing || loading}
                     >
                        <Trash2Icon className="size-4" />
                        Supprimer les libres
                     </Button>
                  ) : null}
               </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
               {error ? (
                  <p className="px-4 py-6 text-sm text-destructive">{error}</p>
               ) : loading ? (
                  <div className="flex justify-center py-10">
                     <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                  </div>
               ) : images.length === 0 ? (
                  <p className="px-4 py-8 text-sm text-center text-muted-foreground">
                     Aucune image dangling
                  </p>
               ) : (
                  <Table>
                     <TableHeader className="bg-muted text-white">
                        <TableRow>
                           <TableHead>Image ID</TableHead>
                           <TableHead>Statut</TableHead>
                           <TableHead className="hidden md:table-cell">
                              Conteneurs (ancestor)
                           </TableHead>
                           <TableHead className="hidden sm:table-cell">
                              Taille
                           </TableHead>
                           <TableHead className="hidden lg:table-cell">
                              Créée
                           </TableHead>
                           <TableHead className="w-[1%] text-right">
                              Action
                           </TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {images.map((img) => {
                           const open = expandedId === img.id;
                           return (
                              <Fragment key={img.id}>
                                 <TableRow
                                    className={cn(
                                       "cursor-pointer",
                                       open && "bg-muted/30",
                                    )}
                                    onClick={() =>
                                       setExpandedId(open ? null : img.id)
                                    }
                                 >
                                    <TableCell className="font-mono text-sm text-white">
                                       {img.shortId}
                                    </TableCell>
                                    <TableCell>
                                       {img.canDelete ? (
                                          <Badge
                                             variant="outline"
                                             className="gap-1 border-emerald-500/40 text-emerald-400"
                                          >
                                             <CheckCircle2Icon className="size-3" />
                                             Libre
                                          </Badge>
                                       ) : (
                                          <Badge
                                             variant="outline"
                                             className="gap-1 border-amber-500/40 text-amber-400"
                                          >
                                             <TriangleAlertIcon className="size-3" />
                                             Utilisée
                                          </Badge>
                                       )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-70">
                                       {img.containers?.length ? (
                                          <span className="line-clamp-2">
                                             {img.containers
                                                .map(
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
                                       {img.sizeFormatted}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                                       {formatCreated(img.created)}
                                    </TableCell>
                                    <TableCell
                                       className="text-right"
                                       onClick={(e) => e.stopPropagation()}
                                    >
                                       {img.canDelete ? (
                                          <Button
                                             variant="ghost"
                                             size="icon-sm"
                                             className="text-destructive hover:text-destructive"
                                             onClick={() => setConfirmOne(img)}
                                             disabled={removing}
                                             aria-label={`Supprimer ${img.shortId}`}
                                          >
                                             <Trash2Icon className="size-4" />
                                          </Button>
                                       ) : (
                                          <Button
                                             variant="ghost"
                                             size="icon-sm"
                                             onClick={() =>
                                                setExpandedId(
                                                   open ? null : img.id,
                                                )
                                             }
                                             aria-label="Voir les commandes"
                                          >
                                             <CopyIcon className="size-4" />
                                          </Button>
                                       )}
                                    </TableCell>
                                 </TableRow>
                                 {open ? (
                                    <TableRow className="hover:bg-transparent">
                                       <TableCell
                                          colSpan={6}
                                          className="bg-black/20 px-4 py-4"
                                       >
                                          <div className="space-y-3 text-sm">
                                             {img.containers?.length ? (
                                                <div>
                                                   <p className="text-xs font-medium text-muted-foreground mb-1.5">
                                                      Conteneurs (ancestor)
                                                   </p>
                                                   <ul className="space-y-1">
                                                      {img.containers.map(
                                                         (c) => (
                                                            <li
                                                               key={c.id}
                                                               className="text-white"
                                                            >
                                                               <span className="font-medium">
                                                                  {c.name}
                                                               </span>
                                                               <span className="text-muted-foreground">
                                                                  {" "}
                                                                  · {c.status}
                                                                  {c.project
                                                                     ? ` · ${c.project}${c.service ? `/${c.service}` : ""}`
                                                                     : ""}
                                                                  {c.composeDir
                                                                     ? ` · ${c.composeDir}`
                                                                     : ""}
                                                               </span>
                                                            </li>
                                                         ),
                                                      )}
                                                   </ul>
                                                </div>
                                             ) : null}
                                             <div>
                                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                                   <p className="text-xs font-medium text-muted-foreground">
                                                      {img.commands?.summary ||
                                                         "Commandes"}
                                                   </p>
                                                   {img.commands?.steps
                                                      ?.length ? (
                                                      <Button
                                                         variant="outline"
                                                         size="xs"
                                                         onClick={() =>
                                                            copyText(
                                                               img.commands.steps.join(
                                                                  "\n",
                                                               ),
                                                            )
                                                         }
                                                      >
                                                         <CopyIcon className="size-3" />
                                                         Copier
                                                      </Button>
                                                   ) : null}
                                                </div>
                                                <pre className="rounded-md border border-border bg-black/40 p-3 text-xs text-primary overflow-x-auto whitespace-pre-wrap font-mono">
                                                   {(
                                                      img.commands?.steps || []
                                                   ).join("\n")}
                                                </pre>
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
            </CardContent>
         </Card>

         <ConfirmDialog
            open={!!confirmOne}
            onOpenChange={(open) => !open && setConfirmOne(null)}
            title="Supprimer cette image dangling ?"
            description={
               confirmOne
                  ? `Supprimer définitivement ${confirmOne.shortId} (${confirmOne.sizeFormatted}) ?`
                  : null
            }
            confirmLabel="Supprimer"
            variant="destructive"
            confirming={removing}
            onConfirm={runRemoveOne}
         />

         <ConfirmDialog
            open={confirmFree}
            onOpenChange={setConfirmFree}
            title="Supprimer les images libres ?"
            description={`Supprimer ${freeCount} image(s) dangling non référencée(s) (${data?.reclaimableFormatted || ""}) ? Les images encore utilisées par un conteneur ne seront pas touchées.`}
            confirmLabel="Supprimer les libres"
            variant="destructive"
            confirming={removing}
            onConfirm={runRemoveFree}
         />
      </section>
   );
}
