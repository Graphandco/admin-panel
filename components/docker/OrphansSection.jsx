"use client";

import { useEffect, useState } from "react";
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
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import {
   dockerOrphans,
   dockerOrphansRemove,
} from "@/app/actions/docker";

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
      hour: "2-digit",
      minute: "2-digit",
   });
}

/**
 * Conteneurs orphelins (hors Compose / projet disparu / service retiré).
 */
export function OrphansSection({ refreshKey = 0 }) {
   const [orphans, setOrphans] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [confirmOne, setConfirmOne] = useState(null);
   const [confirmAll, setConfirmAll] = useState(false);
   const [removing, setRemoving] = useState(false);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const list = await dockerOrphans();
         setOrphans(list);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      load();
   }, [refreshKey]);

   async function runRemoveOne() {
      if (!confirmOne) return;
      setRemoving(true);
      try {
         const res = await dockerOrphansRemove({ id: confirmOne.id });
         if (!res.success) {
            toast.error(res.error || "Échec de la suppression");
            return;
         }
         toast.success(`Conteneur « ${confirmOne.name} » supprimé`);
         setConfirmOne(null);
         await load();
      } finally {
         setRemoving(false);
      }
   }

   async function runRemoveAll() {
      setRemoving(true);
      try {
         const res = await dockerOrphansRemove({ all: true });
         if (!res.success) {
            toast.error(res.error || "Échec de la suppression");
            return;
         }
         toast.success(
            res.removed
               ? `${res.removed} conteneur(s) orphelin(s) supprimé(s)`
               : "Aucun conteneur à supprimer",
         );
         setConfirmAll(false);
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
                  <CardTitle className="text-base text-white">
                     Conteneurs orphelins
                     {!loading ? (
                        <span className="text-muted-foreground font-normal">
                           {" "}
                           ({orphans.length})
                        </span>
                     ) : null}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                     Hors Compose, projet introuvable, service retiré du
                     compose, ou one-off
                  </p>
               </div>
               {orphans.length > 0 ? (
                  <Button
                     variant="destructive"
                     size="sm"
                     onClick={() => setConfirmAll(true)}
                     disabled={removing || loading}
                  >
                     <Trash2Icon className="size-4" />
                     Tout supprimer
                  </Button>
               ) : null}
            </CardHeader>
            <CardContent className="px-0 pb-0">
               {error ? (
                  <p className="px-4 py-6 text-sm text-destructive">{error}</p>
               ) : loading ? (
                  <div className="flex justify-center py-10">
                     <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                  </div>
               ) : orphans.length === 0 ? (
                  <p className="px-4 py-8 text-sm text-center text-muted-foreground">
                     Aucun conteneur orphelin détecté
                  </p>
               ) : (
                  <Table>
                     <TableHeader className="bg-muted text-white">
                        <TableRow>
                           <TableHead>Nom</TableHead>
                           <TableHead className="hidden sm:table-cell">
                              Image
                           </TableHead>
                           <TableHead>Raison</TableHead>
                           <TableHead className="hidden md:table-cell">
                              État
                           </TableHead>
                           <TableHead className="hidden lg:table-cell">
                              Créé
                           </TableHead>
                           <TableHead className="w-[1%] text-right">
                              Action
                           </TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {orphans.map((o) => (
                           <TableRow key={o.id}>
                              <TableCell className="font-medium text-white">
                                 {o.name}
                                 {o.project ? (
                                    <p className="text-xs text-muted-foreground font-normal">
                                       {o.project}
                                       {o.service ? ` / ${o.service}` : ""}
                                    </p>
                                 ) : null}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[200px] truncate">
                                 {o.image}
                              </TableCell>
                              <TableCell>
                                 <Badge
                                    variant="outline"
                                    className="whitespace-nowrap"
                                 >
                                    {o.reasonLabel || o.reason}
                                 </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground">
                                 {o.state}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                                 {formatCreated(o.created)}
                              </TableCell>
                              <TableCell className="text-right">
                                 <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setConfirmOne(o)}
                                    disabled={removing}
                                    aria-label={`Supprimer ${o.name}`}
                                 >
                                    <Trash2Icon className="size-4" />
                                 </Button>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               )}
            </CardContent>
         </Card>

         <ConfirmDialog
            open={!!confirmOne}
            onOpenChange={(open) => !open && setConfirmOne(null)}
            title="Supprimer ce conteneur orphelin ?"
            description={
               confirmOne
                  ? `Supprimer définitivement « ${confirmOne.name} » (${confirmOne.reasonLabel || confirmOne.reason}) ?`
                  : null
            }
            confirmLabel="Supprimer"
            variant="destructive"
            confirming={removing}
            onConfirm={runRemoveOne}
         />

         <ConfirmDialog
            open={confirmAll}
            onOpenChange={setConfirmAll}
            title="Supprimer tous les orphelins ?"
            description={`Supprimer définitivement ${orphans.length} conteneur(s) orphelin(s) ? Cette action est irréversible.`}
            confirmLabel="Tout supprimer"
            variant="destructive"
            confirming={removing}
            onConfirm={runRemoveAll}
         />
      </section>
   );
}
