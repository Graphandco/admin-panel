"use client";

import { useState } from "react";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
   Attachment,
   AttachmentAction,
   AttachmentActions,
   AttachmentContent,
   AttachmentMedia,
   AttachmentTitle,
   AttachmentTrigger,
} from "@/components/ui/attachment";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Dialog,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { appCreate, appDelete, appsList, appUpdate } from "@/app/actions/apps";
import RefreshButton from "@/components/refresh-button";
import { toast } from "sonner";
import {
   LayoutGridIcon,
   Loader2Icon,
   MoreVerticalIcon,
   PencilIcon,
   PlusIcon,
   Trash2Icon,
} from "lucide-react";

export const APPS_KEY = "apps-list";

const emptyForm = { name: "", image: "", url: "", sort_order: "0" };

function AppCard({ app, onEdit, onDelete }) {
   return (
      <Attachment
         orientation="vertical"
         className="mx-auto w-auto items-center border-border/50 hover:border-muted-foreground/30 has-[>a,>button]:hover:bg-card has-data-[slot=attachment-content]:!w-auto"
      >
         <AttachmentMedia
            variant="image"
            className="aspect-auto! h-auto w-auto bg-transparent p-2 [&_img]:aspect-auto! [&_img]:h-auto [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-md [&_img]:object-contain"
         >
            <img src={app.image} alt={app.name} />
         </AttachmentMedia>
         <AttachmentContent className="w-auto px-3 pb-3 text-center">
            <AttachmentTitle className="text-[0.9rem] text-muted-foreground">
               {app.name}
            </AttachmentTitle>
         </AttachmentContent>
         <AttachmentActions>
            <DropdownMenu>
               <DropdownMenuTrigger
                  render={
                     <AttachmentAction
                        aria-label={`Actions pour ${app.name}`}
                        size="icon-sm"
                        className="bg-black/40 text-white hover:bg-black/60 hover:text-white"
                     />
                  }
               >
                  <MoreVerticalIcon className="size-4" />
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(app)}>
                     <PencilIcon className="size-4" />
                     Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                     variant="destructive"
                     onClick={() => onDelete(app)}
                  >
                     <Trash2Icon className="size-4" />
                     Supprimer
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </AttachmentActions>
         <AttachmentTrigger
            render={
               <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ouvrir ${app.name}`}
               />
            }
         />
      </Attachment>
   );
}

export default function AppsPage() {
   const {
      data: apps = [],
      error: fetchError,
      isLoading,
      isValidating,
      mutate,
   } = useCachedSWR(APPS_KEY, () => appsList());

   const [dialogOpen, setDialogOpen] = useState(false);
   const [editing, setEditing] = useState(null);
   const [form, setForm] = useState(emptyForm);
   const [saving, setSaving] = useState(false);
   const [deleteTarget, setDeleteTarget] = useState(null);
   const [deleting, setDeleting] = useState(false);

   const error = fetchError?.message || null;

   function openCreate() {
      setEditing(null);
      setForm(emptyForm);
      setDialogOpen(true);
   }

   function openEdit(app) {
      setEditing(app);
      setForm({
         name: app.name || "",
         image: app.imageFile || app.image?.replace(/^\/apps\//, "") || "",
         url: app.url || "",
         sort_order: String(app.sort_order ?? 0),
      });
      setDialogOpen(true);
   }

   async function handleSave(e) {
      e.preventDefault();
      setSaving(true);
      try {
         const payload = {
            name: form.name.trim(),
            image: form.image.trim(),
            url: form.url.trim(),
            sort_order: parseInt(form.sort_order, 10) || 0,
         };
         if (editing) {
            await appUpdate(editing.id, payload);
            toast.success("App mise à jour");
         } else {
            await appCreate(payload);
            toast.success("App ajoutée");
         }
         setDialogOpen(false);
         await mutate();
      } catch (err) {
         toast.error(err.message || "Erreur");
      } finally {
         setSaving(false);
      }
   }

   async function confirmDelete() {
      if (!deleteTarget) return;
      setDeleting(true);
      try {
         await appDelete(deleteTarget.id);
         toast.success("App supprimée");
         setDeleteTarget(null);
         await mutate();
      } catch (err) {
         toast.error(err.message || "Erreur");
      } finally {
         setDeleting(false);
      }
   }

   return (
      <div className="grid gap-6">
         <header className="flex flex-wrap justify-between items-center gap-4">
            <div>
               <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <LayoutGridIcon className="size-6 text-muted-foreground" />
                  Apps
               </h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Raccourcis vers vos applications — images dans{" "}
                  <code className="text-xs">public/apps/</code>
               </p>
            </div>
            <div className="flex items-center gap-2">
               <Button size="sm" onClick={openCreate}>
                  <PlusIcon className="size-4" />
                  Ajouter
               </Button>
               <RefreshButton
                  onClick={() => mutate()}
                  loading={isLoading || isValidating}
               />
            </div>
         </header>

         {error ? (
            <Card>
               <CardContent className="py-6 text-destructive text-sm">
                  {error}
               </CardContent>
            </Card>
         ) : null}

         {isLoading && apps.length === 0 ? (
            <div className="flex justify-center py-16">
               <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
         ) : apps.length === 0 ? (
            <Card>
               <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  Aucune app. Ajoutez une entrée et placez l&apos;image dans{" "}
                  <code>public/apps/</code>.
               </CardContent>
            </Card>
         ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
               {apps.map((app) => (
                  <AppCard
                     key={app.id}
                     app={app}
                     onEdit={openEdit}
                     onDelete={setDeleteTarget}
                  />
               ))}
            </div>
         )}

         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
               <form onSubmit={handleSave}>
                  <DialogHeader>
                     <DialogTitle>
                        {editing ? "Modifier l'app" : "Nouvelle app"}
                     </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                     <div className="grid gap-2">
                        <Label htmlFor="app-name">Nom</Label>
                        <Input
                           id="app-name"
                           value={form.name}
                           onChange={(e) =>
                              setForm((f) => ({ ...f, name: e.target.value }))
                           }
                           required
                           placeholder="Directus"
                        />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="app-image">Image</Label>
                        <Input
                           id="app-image"
                           value={form.image}
                           onChange={(e) =>
                              setForm((f) => ({ ...f, image: e.target.value }))
                           }
                           required
                           placeholder="directus.png"
                        />
                        <p className="text-xs text-muted-foreground">
                           Fichier dans <code>public/apps/</code> (ex.{" "}
                           <code>directus.png</code>)
                        </p>
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="app-url">Lien</Label>
                        <Input
                           id="app-url"
                           type="url"
                           value={form.url}
                           onChange={(e) =>
                              setForm((f) => ({ ...f, url: e.target.value }))
                           }
                           required
                           placeholder="https://..."
                        />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="app-sort">Ordre</Label>
                        <Input
                           id="app-sort"
                           type="number"
                           value={form.sort_order}
                           onChange={(e) =>
                              setForm((f) => ({
                                 ...f,
                                 sort_order: e.target.value,
                              }))
                           }
                        />
                     </div>
                  </div>
                  <DialogFooter>
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                     >
                        Annuler
                     </Button>
                     <Button type="submit" disabled={saving}>
                        {saving ? (
                           <Loader2Icon className="size-4 animate-spin" />
                        ) : null}
                        Enregistrer
                     </Button>
                  </DialogFooter>
               </form>
            </DialogContent>
         </Dialog>

         <Dialog
            open={!!deleteTarget}
            onOpenChange={(o) => !o && setDeleteTarget(null)}
         >
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Supprimer cette app ?</DialogTitle>
               </DialogHeader>
               <p className="text-sm text-muted-foreground">
                  {deleteTarget?.name} — l&apos;entrée sera retirée de la base.
               </p>
               <DialogFooter>
                  <Button
                     variant="outline"
                     onClick={() => setDeleteTarget(null)}
                  >
                     Annuler
                  </Button>
                  <Button
                     variant="destructive"
                     onClick={confirmDelete}
                     disabled={deleting}
                  >
                     {deleting ? (
                        <Loader2Icon className="size-4 animate-spin" />
                     ) : null}
                     Supprimer
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
