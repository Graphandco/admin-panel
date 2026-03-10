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
import { clientsList } from "@/app/actions/clients";

function sitesFromClients(clients) {
   return clients
      .filter((c) => c.website?.trim())
      .map((c) => ({
         name: c.company || c.name || c.website,
         host: c.website.startsWith("http")
            ? c.website
            : `https://${c.website}`,
      }));
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

export default function SitesStatus() {
   const [sites, setSites] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const clients = await clientsList();
         const sitesToCheck = sitesFromClients(clients);
         const results = await checkSitesStatus(sitesToCheck);
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
         <Card className="h-full">
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
         <Card className="h-full">
            <CardContent className="px-0">
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
