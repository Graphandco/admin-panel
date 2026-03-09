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
import { Loader2Icon, DownloadIcon, RefreshCwIcon } from "lucide-react";

export function InvoicesList() {
   const [invoices, setInvoices] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   async function fetchInvoices() {
      setLoading(true);
      setError(null);
      try {
         const res = await fetch("/api/invoices/list");
         if (!res.ok) throw new Error("Erreur lors du chargement");
         const data = await res.json();
         setInvoices(data.invoices || []);
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      fetchInvoices();
   }, []);


   if (error) {
      return (
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
      );
   }

   return (
      <div className="my-6">
         <Card className="mb-6 p-0 md:p-0">
            <CardContent>
               <Table>
                  <TableHeader className="bg-muted text-white">
                     <TableRow>
                        <TableHead className="pl-2">Fichier</TableHead>
                        <TableHead className="text-right pe-2">
                           Actions
                        </TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow>
                           <TableCell
                              colSpan={2}
                              className="text-center py-8"
                           >
                              <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                           </TableCell>
                        </TableRow>
                     ) : invoices.length === 0 ? (
                        <TableRow>
                           <TableCell
                              colSpan={2}
                              className="text-center py-8 text-muted-foreground"
                           >
                              Aucune facture pour le moment
                           </TableCell>
                        </TableRow>
                     ) : (
                        invoices.map((inv) => (
                           <TableRow key={inv.name}>
                              <TableCell className="pl-2 font-medium">
                                 {inv.name}
                              </TableCell>
                              <TableCell className="text-right pe-2">
                                 <a
                                    href={inv.path}
                                    download={inv.name}
                                    className={cn(
                                       buttonVariants({
                                          variant: "ghost",
                                          size: "icon",
                                       }),
                                       "inline-flex"
                                    )}
                                    title="Télécharger"
                                 >
                                    <DownloadIcon className="size-4" />
                                 </a>
                              </TableCell>
                           </TableRow>
                        ))
                     )}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>
      </div>
   );
}
