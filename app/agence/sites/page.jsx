"use client";

import { useEffect, useState } from "react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
   CheckIcon,
   Ban,
   Loader2Icon,
   RefreshCwIcon,
   ExternalLinkIcon,
   LayoutDashboardIcon,
   PencilIcon,
} from "lucide-react";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { agenceSitesList, agenceSiteUpdate } from "@/app/actions/agence-sites";
import { checkAgenceSitesStatus } from "@/app/actions/sites";

function stripHttps(url) {
   if (!url || typeof url !== "string") return url || "";
   return url.replace(/^https?:\/\//i, "").trim();
}

function StatusBadge({ status }) {
   const isOk = status === 200;
   const isError = status == null;
   const label = isError ? "Erreur" : status;
   return (
      <span
         className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            isOk
               ? "bg-green-500/20 text-green-600 dark:text-green-400"
               : "bg-red-500/20 text-red-600 dark:text-red-400",
         )}
      >
         {isOk && <CheckIcon className="size-3.5" />}
         {!isOk && <Ban className="size-3.5" />}
         {label}
      </span>
   );
}

export default function SitesPage() {
   const [sites, setSites] = useState([]);
   const [statusMap, setStatusMap] = useState({});
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [editSite, setEditSite] = useState(null);
   const [editForm, setEditForm] = useState({
      address: "",
      backoffice: "",
   });
   const [saving, setSaving] = useState(false);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const list = await agenceSitesList();
         setSites(list);

         const results = await checkAgenceSitesStatus(list);
         const map = {};
         results.forEach((r) => {
            map[r.id] = { status: r.status, responseTimeMs: r.responseTimeMs };
         });
         setStatusMap(map);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      load();
   }, []);

   function openEdit(site) {
      setEditSite(site);
      setEditForm({
         address: site.address ?? "",
         backoffice: site.backoffice ?? "",
      });
   }

   async function handleSaveEdit() {
      if (!editSite) return;
      setSaving(true);
      try {
         await agenceSiteUpdate(editSite.id, editForm);
         setEditSite(null);
         load();
      } catch (err) {
         alert(err.message || "Erreur lors de l'enregistrement");
      } finally {
         setSaving(false);
      }
   }

   if (error) {
      return (
         <div>
            <h1 className="text-2xl font-bold text-white mb-4">Sites</h1>
            <Card className="p-6">
               <div className="text-destructive flex items-center gap-3">
                  <p>{error}</p>
                  <button
                     onClick={load}
                     className="inline-flex items-center gap-1 text-sm underline"
                  >
                     <RefreshCwIcon className="size-4" />
                     Réessayer
                  </button>
               </div>
            </Card>
         </div>
      );
   }

   return (
      <div>
         <header className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Sites</h1>
            <button
               onClick={load}
               disabled={loading}
               className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
               <RefreshCwIcon className="size-4" />
               Rafraîchir
            </button>
         </header>
         <Card className="mb-6 p-0 md:p-0">
            <CardContent>
               <Table>
                  <TableHeader className="bg-muted text-white">
                     <TableRow>
                        <TableHead className="pl-2">Site</TableHead>
                        <TableHead>Backoffice</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right pe-2">
                           Temps de réponse
                        </TableHead>
                        <TableHead className="w-12 pe-2"></TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow>
                           <TableCell
                              colSpan={5}
                              className="text-center py-8"
                           >
                              <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                           </TableCell>
                        </TableRow>
                     ) : sites.length === 0 ? (
                        <TableRow>
                           <TableCell
                              colSpan={5}
                              className="text-center py-8 text-muted-foreground"
                           >
                              Aucun site
                           </TableCell>
                        </TableRow>
                     ) : (
                        sites.map((site) => {
                           const fullUrl = site.address?.startsWith("http")
                              ? site.address
                              : `https://${site.address}`;
                           const displayUrl = stripHttps(site.address);
                           const statusData = statusMap[site.id];
                           const backofficeUrl = site.backoffice?.trim();
                           return (
                              <TableRow key={site.id}>
                                 <TableCell className="pl-2">
                                    <a
                                       href={fullUrl}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="inline-flex items-center gap-1 text-primary hover:underline"
                                    >
                                       {displayUrl || "—"}
                                       <ExternalLinkIcon className="size-3.5" />
                                    </a>
                                 </TableCell>
                                 <TableCell>
                                    {backofficeUrl ? (
                                       <a
                                          href={
                                             backofficeUrl.startsWith("http")
                                                ? backofficeUrl
                                                : `https://${backofficeUrl}`
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-primary hover:underline"
                                          title="Ouvrir le backoffice"
                                       >
                                          <LayoutDashboardIcon className="size-4" />
                                       </a>
                                    ) : (
                                       <span className="text-muted-foreground">—</span>
                                    )}
                                 </TableCell>
                                 <TableCell>
                                    {statusData ? (
                                       <StatusBadge status={statusData.status} />
                                    ) : (
                                       <span className="text-muted-foreground">—</span>
                                    )}
                                 </TableCell>
                                 <TableCell className="text-right pe-2">
                                    {statusData?.responseTimeMs != null ? (
                                       <span className="text-muted-foreground text-sm">
                                          {statusData.responseTimeMs} ms
                                       </span>
                                    ) : (
                                       "—"
                                    )}
                                 </TableCell>
                                 <TableCell className="pe-2">
                                    <button
                                       type="button"
                                       onClick={() => openEdit(site)}
                                       className={cn(
                                          "inline-flex items-center justify-center size-8 rounded",
                                          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                       )}
                                       title="Modifier"
                                    >
                                       <PencilIcon className="size-4" />
                                    </button>
                                 </TableCell>
                              </TableRow>
                           );
                        })
                     )}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>

         <Dialog open={!!editSite} onOpenChange={(v) => !v && setEditSite(null)}>
            <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                  <DialogTitle>Modifier le site</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                     <Label htmlFor="edit-address">Adresse du site</Label>
                     <Input
                        id="edit-address"
                        value={editForm.address}
                        onChange={(e) =>
                           setEditForm((f) => ({
                              ...f,
                              address: e.target.value,
                           }))
                        }
                        placeholder="exemple.com"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="edit-backoffice">Backoffice</Label>
                     <Input
                        id="edit-backoffice"
                        value={editForm.backoffice}
                        onChange={(e) =>
                           setEditForm((f) => ({
                              ...f,
                              backoffice: e.target.value,
                           }))
                        }
                        placeholder="exemple.com/wp-admin"
                     />
                  </div>
                  <div className="flex gap-2 pt-2">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditSite(null)}
                     >
                        Annuler
                     </Button>
                     <Button
                        onClick={handleSaveEdit}
                        disabled={saving}
                     >
                        {saving ? (
                           <Loader2Icon className="size-4 mr-2 animate-spin" />
                        ) : null}
                        Enregistrer
                     </Button>
                  </div>
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}
