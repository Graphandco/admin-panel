"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
   Loader2Icon,
   RefreshCwIcon,
   LogInIcon,
   UserIcon,
   ClockIcon,
} from "lucide-react";
import { wordpressConnexions } from "@/app/actions/wordpress";

function siteLabel(item) {
   if (item.site_name) return item.site_name;
   if (!item.site_url) return null;
   try {
      return new URL(item.site_url).hostname;
   } catch {
      return item.site_url;
   }
}

function formatDate(str) {
   try {
      const d = new Date(str);
      return d.toLocaleDateString("fr-FR", {
         day: "numeric",
         month: "short",
         year: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      });
   } catch {
      return str;
   }
}

export default function Connexions() {
   const [connexions, setConnexions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const list = await wordpressConnexions();
         setConnexions(list);
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
         <Card>
            <CardContent className="py-6">
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
            </CardContent>
         </Card>
      );
   }

   return (
      <Card>
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <div className="size-10 p-2 bg-[#21759b]/10 border border-[#21759b]/20 rounded-md flex items-center justify-center">
                  <LogInIcon className="size-6 text-[#21759b] opacity-90" />
               </div>
               <span className="text-lg font-medium text-white">
                  Dernières connexions au backoffice
               </span>
               {!loading && (
                  <span className="text-muted-foreground text-sm font-normal">
                     ({connexions.length})
                  </span>
               )}
            </CardTitle>
         </CardHeader>
         <CardContent>
            {loading ? (
               <div className="flex justify-center py-8">
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               </div>
            ) : connexions.length === 0 ? (
               <p className="text-muted-foreground text-sm py-4">
                  Aucune connexion récente (sessions actives uniquement)
               </p>
            ) : (
               <ul className="space-y-2">
                  {connexions.map((item, i) => (
                     <li
                        key={`${item.user}-${item.login}-${i}`}
                        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
                     >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                           <span className="inline-flex items-center gap-2 font-medium text-foreground">
                              <UserIcon className="size-4 text-muted-foreground shrink-0" />
                              {item.user || "—"}
                           </span>
                           {(item.site_name || item.site_url) && (
                              <span className="text-muted-foreground text-sm">
                                 {item.site_url ? (
                                    <a
                                       href={item.site_url.replace(/\/?$/, "") + "/wp-admin"}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="hover:text-foreground underline"
                                    >
                                       {siteLabel(item) || "—"}
                                    </a>
                                 ) : (
                                    siteLabel(item) || "—"
                                 )}
                              </span>
                           )}
                        </div>
                        <span className="inline-flex items-center gap-2 text-muted-foreground text-sm shrink-0">
                           <ClockIcon className="size-3" />
                           {formatDate(item.login)}
                        </span>
                     </li>
                  ))}
               </ul>
            )}
         </CardContent>
      </Card>
   );
}
