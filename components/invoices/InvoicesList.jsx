"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
   Loader2Icon,
   DownloadIcon,
   RefreshCwIcon,
   Trash2Icon,
   MoreHorizontalIcon,
   EyeIcon,
} from "lucide-react";
import { invoicesList, invoiceDeleteWithFile } from "@/app/actions/invoices";

function formatDate(str) {
   if (!str) return "—";
   try {
      const d = new Date(str);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("fr-FR", {
         day: "2-digit",
         month: "short",
         year: "numeric",
      });
   } catch {
      return "—";
   }
}

function formatCurrency(val) {
   if (val == null || val === "") return "—";
   const n = Number(val);
   return isNaN(n)
      ? "—"
      : `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`;
}

export function InvoicesList() {
   const [invoices, setInvoices] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [actionId, setActionId] = useState(null);
   const [previewFilename, setPreviewFilename] = useState(null);

   async function fetchInvoices() {
      setLoading(true);
      setError(null);
      try {
         const list = await invoicesList();
         setInvoices(list);
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      fetchInvoices();
   }, []);

   async function handleDelete(inv) {
      if (actionId) return;
      if (
         !confirm(
            `Supprimer la facture ${inv.filename} ?\n\nLa facture sera supprimée de la base de données et le fichier PDF sera effacé.`,
         )
      ) {
         return;
      }
      setActionId(inv.id);
      try {
         await invoiceDeleteWithFile(inv.id);
         fetchInvoices();
      } catch (err) {
         alert(err.message || "Erreur lors de la suppression");
      } finally {
         setActionId(null);
      }
   }

   if (error) {
      return (
         <>
            <h2 className="text-xl font-bold text-white">Factures</h2>
            <Card className="mb-6 p-6">
               <div className="text-destructive flex items-center gap-3">
                  <p>{error}</p>
                  <button
                     onClick={fetchInvoices}
                     className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                     )}
                  >
                     <RefreshCwIcon className="size-4 mr-1" />
                     Réessayer
                  </button>
               </div>
            </Card>
         </>
      );
   }

   const downloadUrl = (filename) =>
      `/api/invoices/download?file=${encodeURIComponent(filename)}`;
   const previewUrl = (filename) =>
      `/api/invoices/download?file=${encodeURIComponent(filename)}&preview=1#zoom=100`;

   return (
      <div className="my-6">
         <Card className="mb-6 p-0 md:p-0">
            <CardContent className="px-0">
               <Table>
                  <TableHeader className="bg-muted text-white">
                     <TableRow>
                        <TableHead className="pl-2">Fichier</TableHead>
                        <TableHead>Société</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total TTC</TableHead>
                        <TableHead className="w-12 text-center">
                           Aperçu
                        </TableHead>
                        <TableHead className="text-right pe-2">
                           Actions
                        </TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow>
                           <TableCell colSpan={6} className="text-center py-8">
                              <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                           </TableCell>
                        </TableRow>
                     ) : invoices.length === 0 ? (
                        <TableRow>
                           <TableCell
                              colSpan={6}
                              className="text-center py-8 text-muted-foreground"
                           >
                              Aucune facture pour le moment
                           </TableCell>
                        </TableRow>
                     ) : (
                        invoices.map((inv) => (
                           <TableRow key={inv.id}>
                              <TableCell className="pl-2 font-medium">
                                 {inv.filename}
                              </TableCell>
                              <TableCell>
                                 {inv.client_company || inv.client_name || "—"}
                              </TableCell>
                              <TableCell>
                                 {formatDate(inv.created_at)}
                              </TableCell>
                              <TableCell className="text-right">
                                 {formatCurrency(inv.total_ttc)}
                              </TableCell>
                              <TableCell className="text-center">
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    onClick={() =>
                                       setPreviewFilename(inv.filename)
                                    }
                                    title="Aperçu"
                                 >
                                    <EyeIcon className="size-4" />
                                 </Button>
                              </TableCell>
                              <TableCell className="text-right pe-2">
                                 <DropdownMenu>
                                    <DropdownMenuTrigger
                                       nativeButton={false}
                                       render={
                                          <div
                                             role="button"
                                             tabIndex={0}
                                             className={cn(
                                                buttonVariants({
                                                   variant: "ghost",
                                                   size: "icon",
                                                }),
                                             )}
                                          />
                                       }
                                    >
                                       <MoreHorizontalIcon />
                                       <span className="sr-only">
                                          Ouvrir le menu
                                       </span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                       className="pr-2"
                                       align="end"
                                    >
                                       <DropdownMenuItem
                                          onClick={() => {
                                             const a =
                                                document.createElement("a");
                                             a.href = downloadUrl(inv.filename);
                                             a.download = inv.filename;
                                             a.click();
                                          }}
                                       >
                                          <DownloadIcon className="size-4 mr-2" />
                                          Télécharger
                                       </DropdownMenuItem>
                                       <DropdownMenuSeparator />
                                       <DropdownMenuItem
                                          variant="destructive"
                                          onClick={() => handleDelete(inv)}
                                          disabled={actionId === inv.id}
                                       >
                                          {actionId === inv.id ? (
                                             <Loader2Icon className="size-4 mr-2 animate-spin" />
                                          ) : (
                                             <Trash2Icon className="size-4 mr-2" />
                                          )}
                                          Supprimer
                                       </DropdownMenuItem>
                                    </DropdownMenuContent>
                                 </DropdownMenu>
                              </TableCell>
                           </TableRow>
                        ))
                     )}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>

         <Dialog
            open={!!previewFilename}
            onOpenChange={(open) => !open && setPreviewFilename(null)}
         >
            <DialogContent className="w-[90vw] md:w-[80vw] max-w-[90vw] md:max-w-[80vw] max-h-[90vh] flex flex-col p-0">
               <DialogHeader className="px-6 pt-6 pb-2">
                  <DialogTitle>
                     {previewFilename || "Aperçu facture"}
                  </DialogTitle>
               </DialogHeader>
               <div className="flex-1 min-h-0 px-6 pb-6">
                  {previewFilename && (
                     <iframe
                        src={previewUrl(previewFilename)}
                        className="w-full h-[70vh] rounded border border-border"
                        title="Aperçu PDF"
                     />
                  )}
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}
