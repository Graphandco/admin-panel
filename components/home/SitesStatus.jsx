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
import { CheckIcon, Ban, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { checkSitesStatus } from "@/app/actions/sites";

// Liste des sites à surveiller (name, host)
const SITES = [
   { name: "Graphandco", host: "https://graphandco.com" },
   { name: "Hola Mate", host: "https://holamate.fr" },
   { name: "Infirmière 68000", host: "https://infirmiere68000.fr" },
   { name: "3ème chance", host: "https://3emechance.fr" },
   { name: "Elsass Compta", host: "https://elsass-compta.fr" },
   { name: "Bomot", host: "https://bomo.fr" },
   { name: "Willow Tarot", host: "https://willow-tarot.fr" },
   { name: "Pêche Exotique", host: "https://peche-exotique.fr" },
   { name: "Loide Guitare", host: "https://loide-guitare.fr" },
];

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

export default function SitesStatus() {
   const [sites, setSites] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const results = await checkSitesStatus(SITES);
         setSites(results);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      load();
   }, []);

   if (error) {
      return (
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
      );
   }

   return (
      <div className="">
         <Card className="mb-6 p-0">
            <CardContent>
               <Table>
                  {/* <TableHeader className="bg-muted text-white">
                     <TableRow>
                        <TableHead>
                           <span className="pl-2">Site</span>
                        </TableHead>
                        <TableHead className="text-right">
                           <span className="pr-2">Statut</span>
                        </TableHead>
                     </TableRow>
                  </TableHeader> */}
                  <TableBody>
                     {loading ? (
                        <TableRow>
                           <TableCell colSpan={2} className="text-center py-8">
                              <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                           </TableCell>
                        </TableRow>
                     ) : (
                        sites.map((site) => (
                           <TableRow key={site.host}>
                              <TableCell className="text-sm">
                                 <a
                                    href={site.host}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 pl-2 hover:text-primary"
                                 >
                                    {site.name}
                                 </a>
                              </TableCell>
                              <TableCell className="text-right pr-4">
                                 <StatusBadge status={site.status} />
                              </TableCell>
                           </TableRow>
                        ))
                     )}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>
         {/* {!loading && sites.length > 0 && (
            <button
               onClick={load}
               className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
               <RefreshCwIcon className="size-3" />
               Rafraîchir
            </button>
         )} */}
      </div>
   );
}
