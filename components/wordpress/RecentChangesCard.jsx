"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
   Loader2Icon,
   RefreshCwIcon,
   HistoryIcon,
   UserIcon,
   ClockIcon,
} from "lucide-react";
import { wordpressRecentChanges } from "@/app/actions/wordpress";

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

function typeLabel(type) {
   return type === "page" ? "Page" : "Article";
}

export default function RecentChangesCard() {
   const [changes, setChanges] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const list = await wordpressRecentChanges();
         setChanges(list);
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
         <Card className="md:col-span-2">
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
      <Card className="md:col-span-2 lg:col-span-3">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <div className="size-10 p-2 bg-[#21759b]/10 border border-[#21759b]/20 rounded-md flex items-center justify-center">
                  <HistoryIcon className="size-6 text-[#21759b] opacity-90" />
               </div>
               <span className="text-lg font-medium text-white">
                  Dernières modifications
               </span>
               {!loading && (
                  <span className="text-muted-foreground text-sm font-normal">
                     ({changes.length} sur le multisite)
                  </span>
               )}
            </CardTitle>
         </CardHeader>
         <CardContent>
            {loading ? (
               <div className="flex justify-center py-8">
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               </div>
            ) : changes.length === 0 ? (
               <p className="text-muted-foreground text-sm py-4">
                  Aucune modification récente
               </p>
            ) : (
               <ul className="space-y-3">
                  {changes.map((item) => (
                     <li key={`${item.blog_id}-${item.title}-${item.modified}`}>
                        <a
                           href={item.url || item.site_url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="block rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                        >
                           <span className="font-medium text-foreground line-clamp-1">
                              <span className="text-muted-foreground">
                                 {item.site_name || new URL(item.site_url).hostname}
                              </span>
                              {" — "}
                              {item.title || "(sans titre)"}
                           </span>
                           <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
                              <span>{typeLabel(item.type)}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                 <ClockIcon className="size-3" />
                                 {formatDate(item.modified)}
                              </span>
                              {item.author && (
                                 <>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1">
                                       <UserIcon className="size-3" />
                                       {item.author}
                                    </span>
                                 </>
                              )}
                           </div>
                        </a>
                     </li>
                  ))}
               </ul>
            )}
         </CardContent>
      </Card>
   );
}
