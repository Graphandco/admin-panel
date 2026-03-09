"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
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

   if (loading) {
      return (
         <Card>
            <CardContent className="flex items-center justify-center py-16">
               <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </CardContent>
         </Card>
      );
   }

   if (error) {
      return (
         <Card>
            <CardContent className="py-8">
               <p className="text-destructive">{error}</p>
            </CardContent>
         </Card>
      );
   }

   return (
      <Card>
         <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-semibold">Factures enregistrées</h2>
               <Button variant="outline" size="sm" onClick={fetchInvoices}>
                  <RefreshCwIcon className="size-4 mr-1" />
                  Actualiser
               </Button>
            </div>
            {invoices.length === 0 ? (
               <p className="text-muted-foreground py-8 text-center">
                  Aucune facture pour le moment.
               </p>
            ) : (
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Fichier</TableHead>
                        <TableHead className="w-24 text-right">
                           Télécharger
                        </TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {invoices.map((inv) => (
                        <TableRow key={inv.name}>
                           <TableCell className="font-medium">
                              {inv.name}
                           </TableCell>
                           <TableCell className="text-right">
                              <a
                                 href={inv.path}
                                 download={inv.name}
                                 className={cn(
                                    buttonVariants({ variant: "ghost", size: "sm" }),
                                    "inline-flex"
                                 )}
                              >
                                 <DownloadIcon className="size-4 mr-1" />
                                 PDF
                              </a>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            )}
         </CardContent>
      </Card>
   );
}
