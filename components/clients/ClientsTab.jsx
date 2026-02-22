"use client";

import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
   Sheet,
   SheetContent,
   SheetHeader,
   SheetTitle,
   SheetFooter,
} from "@/components/ui/sheet";
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
} from "lucide-react";
import {
   clientsList,
   clientCreate,
   clientUpdate,
   clientDelete,
} from "@/app/actions/clients";

const EMPTY_FORM = {
   name: "",
   company: "",
   email: "",
   website: "",
   phone: "",
   adresse: "",
   payment_date: "",
   annual_cost: "",
   creation_cost: "",
   invoice: false,
};

function formatDate(str) {
   if (!str) return "—";
   try {
      const d = new Date(str);
      return d.toLocaleDateString("fr-FR", {
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
   const [sheetOpen, setSheetOpen] = useState(false);
   const [editingId, setEditingId] = useState(null);
   const [form, setForm] = useState(EMPTY_FORM);
   const [saving, setSaving] = useState(false);
   const [deleteId, setDeleteId] = useState(null);
   const [deleting, setDeleting] = useState(false);

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

   function openAdd() {
      setEditingId(null);
      setForm(EMPTY_FORM);
      setSheetOpen(true);
   }

   function openEdit(c) {
      setEditingId(c.id);
      setForm({
         name: c.name ?? "",
         company: c.company ?? "",
         email: c.email ?? "",
         website: c.website ?? "",
         phone: c.phone ?? "",
         adresse: c.adresse ?? "",
         payment_date: c.payment_date ?? "",
         annual_cost: c.annual_cost != null ? String(c.annual_cost) : "",
         creation_cost: c.creation_cost != null ? String(c.creation_cost) : "",
         invoice: Boolean(c.invoice),
      });
      setSheetOpen(true);
   }

   async function handleSubmit(e) {
      e.preventDefault();
      setSaving(true);
      try {
         const payload = {
            ...form,
            annual_cost: form.annual_cost !== "" ? Number(form.annual_cost) : null,
            creation_cost: form.creation_cost !== "" ? Number(form.creation_cost) : null,
         };
         if (editingId) {
            await clientUpdate(editingId, payload);
         } else {
            await clientCreate(payload);
         }
         setSheetOpen(false);
         load();
      } catch (err) {
         alert(err.message || "Erreur");
      } finally {
         setSaving(false);
      }
   }

   function openDelete(id) {
      setDeleteId(id);
   }

   async function handleDelete() {
      if (!deleteId) return;
      setDeleting(true);
      try {
         await clientDelete(deleteId);
         setDeleteId(null);
         load();
      } catch (err) {
         alert(err.message || "Erreur");
      } finally {
         setDeleting(false);
      }
   }

   if (error) {
      return (
         <Card className="my-6 p-6">
            <div className="text-destructive flex items-center gap-3">
               <p>{error}</p>
               <button
                  onClick={load}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
               >
                  <RefreshCwIcon className="size-4 mr-1" />
                  Réessayer
               </button>
            </div>
         </Card>
      );
   }

   return (
      <>
         <div className="my-6">
            <Card className="mb-6 p-0">
               <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                     <button
                        onClick={openAdd}
                        className={cn(buttonVariants())}
                     >
                        <PlusIcon className="size-4 mr-2" />
                        Ajouter un client
                     </button>
                  </div>
                  <Table>
                     <TableHeader className="bg-muted text-white">
                        <TableRow>
                           <TableHead className="pl-2">Nom</TableHead>
                           <TableHead>Entreprise</TableHead>
                           <TableHead>Email</TableHead>
                           <TableHead>Site web</TableHead>
                           <TableHead>Téléphone</TableHead>
                           <TableHead>Date paiement</TableHead>
                           <TableHead className="text-right">Coût annuel</TableHead>
                           <TableHead className="text-right pe-2">Actions</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {loading ? (
                           <TableRow>
                              <TableCell colSpan={8} className="text-center py-8">
                                 <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                              </TableCell>
                           </TableRow>
                        ) : clients.length === 0 ? (
                           <TableRow>
                              <TableCell
                                 colSpan={8}
                                 className="text-center py-8 text-muted-foreground"
                              >
                                 Aucun client
                              </TableCell>
                           </TableRow>
                        ) : (
                           clients.map((c) => (
                              <TableRow key={c.id}>
                                 <TableCell className="pl-2 font-medium">
                                    {c.name || "—"}
                                 </TableCell>
                                 <TableCell>{c.company || "—"}</TableCell>
                                 <TableCell>{c.email || "—"}</TableCell>
                                 <TableCell>
                                    {c.website ? (
                                       <a
                                          href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline"
                                       >
                                          {c.website}
                                       </a>
                                    ) : (
                                       "—"
                                    )}
                                 </TableCell>
                                 <TableCell>{c.phone || "—"}</TableCell>
                                 <TableCell>{formatDate(c.payment_date)}</TableCell>
                                 <TableCell className="text-right">
                                    {formatNumber(c.annual_cost)}
                                 </TableCell>
                                 <TableCell className="text-right pe-2">
                                    <div className="flex justify-end gap-1">
                                       <button
                                          onClick={() => openEdit(c)}
                                          className={cn(
                                             buttonVariants({ variant: "ghost", size: "icon" })
                                          )}
                                          title="Modifier"
                                       >
                                          <PencilIcon className="size-4" />
                                       </button>
                                       <button
                                          onClick={() => openDelete(c.id)}
                                          className={cn(
                                             buttonVariants({
                                                variant: "ghost",
                                                size: "icon",
                                             }),
                                             "text-destructive hover:text-destructive"
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
         </div>

         <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="overflow-y-auto sm:max-w-lg">
               <SheetHeader>
                  <SheetTitle>
                     {editingId ? "Modifier le client" : "Nouveau client"}
                  </SheetTitle>
               </SheetHeader>
               <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="grid gap-2">
                     <Label htmlFor="name">Nom *</Label>
                     <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="company">Entreprise</Label>
                     <Input
                        id="company"
                        value={form.company}
                        onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="email">Email</Label>
                     <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="website">Site web</Label>
                     <Input
                        id="website"
                        type="url"
                        value={form.website}
                        onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="phone">Téléphone</Label>
                     <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="adresse">Adresse</Label>
                     <Input
                        id="adresse"
                        value={form.adresse}
                        onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))}
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="payment_date">Date de paiement</Label>
                     <Input
                        id="payment_date"
                        type="date"
                        value={form.payment_date}
                        onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="annual_cost">Coût annuel</Label>
                     <Input
                        id="annual_cost"
                        type="number"
                        step="0.01"
                        value={form.annual_cost}
                        onChange={(e) => setForm((f) => ({ ...f, annual_cost: e.target.value }))}
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="creation_cost">Coût de création</Label>
                     <Input
                        id="creation_cost"
                        type="number"
                        step="0.01"
                        value={form.creation_cost}
                        onChange={(e) => setForm((f) => ({ ...f, creation_cost: e.target.value }))}
                     />
                  </div>
                  <div className="flex items-center gap-2">
                     <input
                        type="checkbox"
                        id="invoice"
                        checked={form.invoice}
                        onChange={(e) => setForm((f) => ({ ...f, invoice: e.target.checked }))}
                        className="size-4 rounded border"
                     />
                     <Label htmlFor="invoice">Facture</Label>
                  </div>
                  <SheetFooter className="pt-4">
                     <button
                        type="button"
                        onClick={() => setSheetOpen(false)}
                        className={cn(buttonVariants({ variant: "outline" }))}
                     >
                        Annuler
                     </button>
                     <button
                        type="submit"
                        disabled={saving}
                        className={cn(buttonVariants())}
                     >
                        {saving ? (
                           <Loader2Icon className="size-4 animate-spin mr-2" />
                        ) : null}
                        {editingId ? "Enregistrer" : "Créer"}
                     </button>
                  </SheetFooter>
               </form>
            </SheetContent>
         </Sheet>

         <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
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
                     {deleting ? <Loader2Icon className="size-4 animate-spin" /> : null}
                     Supprimer
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
