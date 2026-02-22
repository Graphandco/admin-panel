"use client";

import { useEffect, useState } from "react";
import {
   Card,
   CardHeader,
   CardTitle,
   CardAction,
   CardContent,
} from "@/components/ui/card";
import {
   Loader2Icon,
   RefreshCwIcon,
   PackageIcon,
   ArrowUpCircleIcon,
   CheckCircle2Icon,
} from "lucide-react";
import { wordpressPlugins } from "@/app/actions/wordpress";

export default function PluginsCard() {
   const [plugins, setPlugins] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const list = await wordpressPlugins();
         setPlugins(list);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      load();
   }, []);

   const total = plugins.length;
   const updatesCount = plugins.filter((p) => p.update === "available").length;

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
      <Card className="h-min">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <div className="size-10 p-2 bg-[#21759b]/10 border border-[#21759b]/20 rounded-md flex items-center justify-center">
                  <PackageIcon className="size-6 text-[#21759b] opacity-90" />
               </div>
               <span className="text-lg font-medium text-white">
                  Plugins Wordpress
               </span>
            </CardTitle>
            <CardAction>
               {loading ? (
                  <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
               ) : (
                  <span className="text-2xl font-bold">{total}</span>
               )}
            </CardAction>
         </CardHeader>
         <CardContent>
            <p className="text-muted-foreground text-sm">
               {/* {total} extension{total > 1 ? "s" : ""} au total */}
               {updatesCount > 0 ? (
                  <span className="flex items-center gap-1.5 mt-2 text-amber-500 dark:text-amber-400">
                     <ArrowUpCircleIcon className="size-4" />
                     {updatesCount} mise{updatesCount > 1 ? "s" : ""} à jour à
                     faire
                  </span>
               ) : (
                  total > 0 && (
                     <span className="flex items-center gap-1.5 mt-2 text-green-600 dark:text-green-400">
                        <CheckCircle2Icon className="size-4" />
                        Tous les plugins sont à jour
                     </span>
                  )
               )}
            </p>
         </CardContent>
      </Card>
   );
}
