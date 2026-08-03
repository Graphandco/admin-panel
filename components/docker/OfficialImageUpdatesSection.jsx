"use client";

import { useState } from "react";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
   dockerImageUpdates,
   dockerApplyImageUpdate,
} from "@/app/actions/docker";
import { mutateUpdateCounts } from "@/hooks/use-update-counts";
import { toast } from "sonner";
import {
   ArrowUpCircleIcon,
   CheckCircle2Icon,
   Loader2Icon,
   RefreshCwIcon,
} from "lucide-react";

function formatCheckedAt(iso) {
   if (!iso) return "—";
   try {
      return new Date(iso).toLocaleString("fr-FR", {
         dateStyle: "short",
         timeStyle: "medium",
      });
   } catch {
      return iso;
   }
}

/**
 * Bloc mises à jour images Docker Hub (officielles + tierces).
 */
export function OfficialImageUpdatesSection() {
   const {
      data,
      error: fetchError,
      isLoading,
      isValidating,
      mutate,
   } = useCachedSWR("docker-image-updates", () => dockerImageUpdates());
   const error = fetchError?.message || null;
   const [updatingId, setUpdatingId] = useState(null);
   const [confirmItem, setConfirmItem] = useState(null);
   const checking = isLoading || isValidating;

   async function load() {
      await mutate();
   }

   async function runUpdate() {
      if (!confirmItem) return;
      const item = confirmItem;
      setConfirmItem(null);
      setUpdatingId(item.id);
      try {
         const res = await dockerApplyImageUpdate(item.id);
         if (!res.success) {
            toast.error(res.error || "Mise à jour échouée");
            return;
         }
         toast.success(`Mis à jour : ${res.image || item.image}`);
         await Promise.all([load(), mutateUpdateCounts()]);
      } catch (err) {
         toast.error(err.message || "Erreur");
      } finally {
         setUpdatingId(null);
      }
   }

   const updates = data?.updates || [];
   const updateCount = data?.updateCount ?? 0;

   return (
      <>
         <Card className="mt-6">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
               <div>
                  <CardTitle className="text-base">
                     Mises à jour Docker Hub
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                     Images Docker Hub (officielles + tierces : mysql,
                     vaultwarden, watchtower…) — digest local vs distant.
                     Dernière vérif : {formatCheckedAt(data?.checkedAt)}
                  </p>
               </div>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={load}
                  disabled={checking || !!updatingId}
                  className="inline-flex items-center gap-1"
               >
                  {checking ? (
                     <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                     <RefreshCwIcon className="size-4" />
                  )}
                  Vérifier
               </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
               {error && (
                  <p className="text-sm text-destructive mb-3">{error}</p>
               )}

               {isLoading && !data ? (
                  <div className="flex justify-center py-10">
                     <Loader2Icon className="size-7 animate-spin text-muted-foreground" />
                  </div>
               ) : updates.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                     Aucune image Docker Hub détectée sur les conteneurs
                  </p>
               ) : (
                  <>
                     {updateCount > 0 && (
                        <p className="text-sm text-amber-400 mb-3">
                           {updateCount} mise
                           {updateCount > 1 ? "s" : ""} à jour disponible
                           {updateCount > 1 ? "s" : ""}
                        </p>
                     )}
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>Conteneur</TableHead>
                              <TableHead>Image</TableHead>
                              <TableHead>Local</TableHead>
                              <TableHead>Docker Hub</TableHead>
                              <TableHead>État</TableHead>
                              <TableHead className="text-right">
                                 Action
                              </TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {updates.map((u) => {
                              const busy = updatingId === u.id;
                              return (
                                 <TableRow key={u.id}>
                                    <TableCell>
                                       <div className="font-medium text-white">
                                          {u.name}
                                       </div>
                                       <div className="text-xs text-muted-foreground">
                                          {u.state}
                                       </div>
                                    </TableCell>
                                    <TableCell>
                                       <code className="text-xs text-muted-foreground">
                                          {u.display || u.image}
                                       </code>
                                    </TableCell>
                                    <TableCell>
                                       <code className="text-xs tabular-nums">
                                          {u.localDigestShort || "—"}
                                       </code>
                                    </TableCell>
                                    <TableCell>
                                       <code className="text-xs tabular-nums">
                                          {u.remoteDigestShort || "—"}
                                       </code>
                                    </TableCell>
                                    <TableCell>
                                       {u.updateAvailable ? (
                                          <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/20">
                                             Mise à jour
                                          </Badge>
                                       ) : u.error ? (
                                          <Badge
                                             variant="outline"
                                             title={u.error}
                                          >
                                             Erreur
                                          </Badge>
                                       ) : (
                                          <Badge
                                             variant="outline"
                                             className="text-green-400 border-green-500/40"
                                          >
                                             <CheckCircle2Icon className="size-3 mr-1" />
                                             À jour
                                          </Badge>
                                       )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                       <Button
                                          size="sm"
                                          disabled={
                                             busy ||
                                             !!updatingId ||
                                             !u.updateAvailable
                                          }
                                          onClick={() => setConfirmItem(u)}
                                          className="inline-flex items-center gap-1"
                                       >
                                          {busy ? (
                                             <Loader2Icon className="size-4 animate-spin" />
                                          ) : (
                                             <ArrowUpCircleIcon className="size-4" />
                                          )}
                                          Mettre à jour
                                       </Button>
                                    </TableCell>
                                 </TableRow>
                              );
                           })}
                        </TableBody>
                     </Table>
                  </>
               )}
            </CardContent>
         </Card>

         <ConfirmDialog
            open={!!confirmItem}
            onOpenChange={(o) => !o && setConfirmItem(null)}
            title="Mettre à jour cette image ?"
            description={
               confirmItem
                  ? `Pull de ${confirmItem.display || confirmItem.image} puis recreate compose.\nLocal : ${confirmItem.localDigestShort || "—"} → Hub : ${confirmItem.remoteDigestShort || "—"}`
                  : null
            }
            confirmLabel="Mettre à jour"
            onConfirm={runUpdate}
         />
      </>
   );
}
