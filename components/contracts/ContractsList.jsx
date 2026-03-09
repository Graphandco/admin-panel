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
   Loader2Icon,
   DownloadIcon,
   RefreshCwIcon,
   Trash2Icon,
   MoreHorizontalIcon,
} from "lucide-react";
import {
   contractsList,
   contractDeleteWithFile,
} from "@/app/actions/contracts";

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

export function ContractsList() {
   const [contracts, setContracts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [actionId, setActionId] = useState(null);

   async function fetchContracts() {
      setLoading(true);
      setError(null);
      try {
         const list = await contractsList();
         setContracts(list);
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      fetchContracts();
   }, []);

   async function handleDelete(ct) {
      if (actionId) return;
      if (
         !confirm(
            `Supprimer le contrat ${ct.filename} ?\n\nLe contrat sera supprimé de la base de données et le fichier PDF sera effacé.`
         )
      ) {
         return;
      }
      setActionId(ct.id);
      try {
         await contractDeleteWithFile(ct.id);
         fetchContracts();
      } catch (err) {
         alert(err.message || "Erreur lors de la suppression");
      } finally {
         setActionId(null);
      }
   }

   if (error) {
      return (
         <Card className="mb-6 p-6">
            <div className="text-destructive flex items-center gap-3">
               <p>{error}</p>
               <button
                  onClick={fetchContracts}
                  className={cn(
                     buttonVariants({ variant: "outline", size: "sm" })
                  )}
               >
                  <RefreshCwIcon className="size-4 mr-1" />
                  Réessayer
               </button>
            </div>
         </Card>
      );
   }

   const downloadUrl = (filename) =>
      `/api/contracts/download?file=${encodeURIComponent(filename)}`;

   return (
      <div className="my-6">
         <Card className="mb-6 p-0 md:p-0">
            <CardContent>
               <Table>
                  <TableHeader className="bg-muted text-white">
                     <TableRow>
                        <TableHead className="pl-2">Fichier</TableHead>
                        <TableHead>Société</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right pe-2">
                           Actions
                        </TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow>
                           <TableCell
                              colSpan={4}
                              className="text-center py-8"
                           >
                              <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                           </TableCell>
                        </TableRow>
                     ) : contracts.length === 0 ? (
                        <TableRow>
                           <TableCell
                              colSpan={4}
                              className="text-center py-8 text-muted-foreground"
                           >
                              Aucun contrat pour le moment
                           </TableCell>
                        </TableRow>
                     ) : (
                        contracts.map((ct) => (
                           <TableRow key={ct.id}>
                              <TableCell className="pl-2 font-medium">
                                 {ct.filename}
                              </TableCell>
                              <TableCell>
                                 {ct.client_company || ct.client_name || "—"}
                              </TableCell>
                              <TableCell>
                                 {formatDate(ct.created_at)}
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
                                                })
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
                                             a.href = downloadUrl(ct.filename);
                                             a.download = ct.filename;
                                             a.click();
                                          }}
                                       >
                                          <DownloadIcon className="size-4 mr-2" />
                                          Télécharger
                                       </DropdownMenuItem>
                                       <DropdownMenuSeparator />
                                       <DropdownMenuItem
                                          variant="destructive"
                                          onClick={() => handleDelete(ct)}
                                          disabled={actionId === ct.id}
                                       >
                                          {actionId === ct.id ? (
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
      </div>
   );
}
