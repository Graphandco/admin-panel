"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
   Loader2Icon,
   RefreshCwIcon,
   PlusIcon,
   PencilIcon,
   Trash2Icon,
   EyeIcon,
} from "lucide-react";
import {
   clientsList,
   clientCreate,
   clientUpdate,
   clientDelete,
} from "@/app/actions/clients";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientModalInfos } from "@/components/clients/ClientModalInfos";

function formatDate(str) {
   if (!str) return "—";
   try {
      const [y, m, d] = String(str).split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("fr-FR", {
         day: "2-digit",
         month: "short",
         year: "numeric",
      });
   } catch {
      return str;
   }
}

function formatNumber(val) {
   if (val == null || val === "") return "—";
   const n = Number(val);
   return isNaN(n) ? "—" : n.toLocaleString("fr-FR");
}

export function ClientsTab() {
   const [clients, setClients] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [editDialogId, setEditDialogId] = useState(null);
   const [viewDialogId, setViewDialogId] = useState(null);
   const [saving, setSaving] = useState(false);
   const [deleteId, setDeleteId] = useState(null);
   const [deleting, setDeleting] = useState(false);
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
   }, []);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const list = await clientsList();
         setClients(list);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      load();
   }, []);

   async function handleSubmitClient(payload, mode, clientId) {
      setSaving(true);
      try {
         await clientUpdate(clientId, payload);
         setEditDialogId(null);
         load();
      } catch (err) {
         alert(err.message || "Erreur");
      } finally {
         setSaving(false);
      }
   }

   function handleDelete() {
      if (!deleteId) return;
      setDeleting(true);
      clientDelete(deleteId)
         .then(() => {
            setDeleteId(null);
            load();
         })
         .catch((err) => alert(err.message || "Erreur"))
         .finally(() => setDeleting(false));
   }

   const addButton = (
      <Link
         href="/clients/generators/nouveau-client"
         className={cn(buttonVariants())}
      >
         <PlusIcon className="size-4 mr-2" />
         Ajouter un client
      </Link>
   );

   return (
      <>
         {mounted &&
            typeof document !== "undefined" &&
            (() => {
               const portal = document.getElementById("clients-add-portal");
               return portal ? createPortal(addButton, portal) : null;
            })()}
         <Dialog
            open={!!viewDialogId}
            onOpenChange={(v) => !v && setViewDialogId(null)}
         >
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
               <DialogHeader>
                  <DialogTitle>Fiche client</DialogTitle>
               </DialogHeader>
               <ClientModalInfos
                  client={clients.find((x) => x.id === viewDialogId)}
               />
            </DialogContent>
         </Dialog>
         <div className="my-6">
            {error ? (
               <Card className="mb-6 p-6">
                  <div className="text-destructive flex items-center gap-3">
                     <p>{error}</p>
                     <button
                        onClick={load}
                        className={cn(
                           buttonVariants({ variant: "outline", size: "sm" }),
                        )}
                     >
                        <RefreshCwIcon className="size-4 mr-1" />
                        Réessayer
                     </button>
                  </div>
               </Card>
            ) : (
               <Card className="mb-6 p-0 md:p-0">
                  <CardContent className="px-0">
                     <Table>
                        <TableHeader className="bg-muted text-white">
                           <TableRow>
                              <TableHead className="pl-2">Entreprise</TableHead>
                              <TableHead>Nom</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Site web</TableHead>
                              <TableHead>Date paiement</TableHead>
                              <TableHead className="text-right pe-2">
                                 Actions
                              </TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {loading ? (
                              <TableRow>
                                 <TableCell
                                    colSpan={6}
                                    className="text-center py-8"
                                 >
                                    <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                                 </TableCell>
                              </TableRow>
                           ) : clients.length === 0 ? (
                              <TableRow>
                                 <TableCell
                                    colSpan={6}
                                    className="text-center py-8 text-muted-foreground"
                                 >
                                    Aucun client
                                 </TableCell>
                              </TableRow>
                           ) : (
                              clients.map((c) => (
                                 <TableRow key={c.id}>
                                    <TableCell>{c.company || "—"}</TableCell>
                                    <TableCell className="pl-2 font-medium">
                                       {c.name || "—"}
                                    </TableCell>
                                    <TableCell>{c.email || "—"}</TableCell>
                                    <TableCell>
                                       {(() => {
                                          const urls =
                                             c.websites?.length > 0
                                                ? c.websites
                                                : c.website
                                                   ? [c.website]
                                                   : [];
                                          return urls.length > 0 ? (
                                             urls.map((url, i) => {
                                                const href =
                                                   url.startsWith("http")
                                                      ? url
                                                      : `https://${url}`;
                                                return (
                                                   <a
                                                      key={i}
                                                      href={href}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-primary hover:underline block"
                                                   >
                                                      {url.replace(
                                                         /^https?:\/\//i,
                                                         "",
                                                      )}
                                                   </a>
                                                );
                                             })
                                          ) : (
                                             "—"
                                          );
                                       })()}
                                    </TableCell>
                                    <TableCell>
                                       {formatDate(c.payment_date)}
                                    </TableCell>
                                    <TableCell className="text-right pe-2">
                                       <div className="flex justify-end gap-1">
                                          <button
                                             onClick={() =>
                                                setViewDialogId(c.id)
                                             }
                                             className={cn(
                                                buttonVariants({
                                                   variant: "ghost",
                                                   size: "icon",
                                                }),
                                             )}
                                             title="Voir"
                                          >
                                             <EyeIcon className="size-4" />
                                          </button>
                                          <Dialog
                                             open={editDialogId === c.id}
                                             onOpenChange={(v) =>
                                                setEditDialogId(v ? c.id : null)
                                             }
                                          >
                                             <DialogTrigger
                                                render={
                                                   <button
                                                      className={cn(
                                                         buttonVariants({
                                                            variant: "ghost",
                                                            size: "icon",
                                                         }),
                                                      )}
                                                      title="Modifier"
                                                   >
                                                      <PencilIcon className="size-4" />
                                                   </button>
                                                }
                                             />
                                             <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                   <DialogTitle>
                                                      Modifier le client
                                                   </DialogTitle>
                                                </DialogHeader>
                                                <ClientForm
                                                   client={c}
                                                   mode="edit"
                                                   onSubmit={(p) =>
                                                      handleSubmitClient(
                                                         p,
                                                         "edit",
                                                         c.id,
                                                      )
                                                   }
                                                   onCancel={() =>
                                                      setEditDialogId(null)
                                                   }
                                                   saving={saving}
                                                />
                                             </DialogContent>
                                          </Dialog>
                                          <button
                                             onClick={() => setDeleteId(c.id)}
                                             className={cn(
                                                buttonVariants({
                                                   variant: "ghost",
                                                   size: "icon",
                                                }),
                                                "text-destructive hover:text-destructive",
                                             )}
                                             title="Supprimer"
                                          >
                                             <Trash2Icon className="size-4" />
                                          </button>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              ))
                           )}
                        </TableBody>
                     </Table>
                  </CardContent>
               </Card>
            )}
         </div>

         <AlertDialog
            open={!!deleteId}
            onOpenChange={(v) => !v && setDeleteId(null)}
         >
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
                  <AlertDialogDescription>
                     Cette action est irréversible.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={handleDelete}
                     disabled={deleting}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                     {deleting ? (
                        <Loader2Icon className="size-4 animate-spin" />
                     ) : null}{" "}
                     Supprimer
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
