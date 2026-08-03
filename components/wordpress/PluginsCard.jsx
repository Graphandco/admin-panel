"use client";

import { useCachedSWR } from "@/hooks/use-cached-swr";
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

export const WORDPRESS_PLUGINS_KEY = "wordpress-plugins";

export default function PluginsCard() {
   const {
      data: plugins = [],
      error: fetchError,
      isLoading: loading,
      mutate,
   } = useCachedSWR(WORDPRESS_PLUGINS_KEY, () => wordpressPlugins());
   const error = fetchError?.message || null;

   async function load() {
      await mutate();
   }

   const total = plugins.length;
   const updatesCount = plugins.filter((p) => p.update === "available").length;

   if (error) {
      return (
         <Card className="h-full">
            <CardContent className="py-4 md:py-6">
               <div className="text-destructive flex items-center gap-3">
                  <p className="text-xs md:text-sm">{error}</p>
                  <button
                     onClick={load}
                     className="inline-flex items-center gap-1 text-xs md:text-sm underline"
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
      <Card className="h-full">
         <CardHeader>
            <CardTitle className="flex items-center gap-1.5 md:gap-2 min-w-0">
               <div className="size-8 shrink-0 p-1.5 md:p-2 bg-[#21759b]/10 border border-[#21759b]/20 rounded-md flex items-center justify-center md:mr-2">
                  <PackageIcon className="size-5 text-[#21759b] opacity-90" />
               </div>
               <span className="text-sm md:text-lg font-medium text-white truncate">
                  Plugins Wordpress
               </span>
            </CardTitle>
            <CardAction>
               {loading ? (
                  <Loader2Icon className="size-5 md:size-6 animate-spin text-muted-foreground" />
               ) : (
                  <span className="text-xl md:text-2xl font-bold tabular-nums">
                     {total}
                  </span>
               )}
            </CardAction>
         </CardHeader>
         <CardContent className="space-y-1">
            <p className="text-muted-foreground text-xs md:text-sm">
               {updatesCount > 0 ? (
                  <span className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
                     <ArrowUpCircleIcon className="size-3.5 md:size-4 shrink-0" />
                     <span className="leading-snug">
                        {updatesCount} mise{updatesCount > 1 ? "s" : ""} à jour
                        à faire
                     </span>
                  </span>
               ) : (
                  total > 0 && (
                     <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <CheckCircle2Icon className="size-3.5 md:size-4 shrink-0" />
                        <span className="leading-snug">
                           Tous les plugins sont à jour
                        </span>
                     </span>
                  )
               )}
            </p>
         </CardContent>
      </Card>
   );
}
