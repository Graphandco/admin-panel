"use client";

import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { PruneBuildCacheButton } from "@/components/docker/PruneBuildCacheButton";
import { cn } from "@/lib/utils";

export function StatusCards({
   total = 0,
   running = 0,
   stopped = 0,
   buildCacheSize = null,
   onBuildCachePruned,
}) {
   const cacheLabel = buildCacheSize || "—";

   return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
         <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-lg text-muted-foreground">
                  Containers
               </CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-2xl font-semibold text-white tabular-nums">
                  {total}
               </p>
               <p className="text-xs text-muted-foreground mt-1">Total</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-lg text-muted-foreground">
                  En cours
               </CardTitle>
            </CardHeader>
            <CardContent>
               <p
                  className={cn(
                     "text-2xl font-semibold tabular-nums",
                     running > 0 ? "text-emerald-400" : "text-white",
                  )}
               >
                  {running}
               </p>
               <p className="text-xs text-muted-foreground mt-1">Running</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-lg text-muted-foreground">
                  Arrêtés
               </CardTitle>
            </CardHeader>
            <CardContent>
               <p
                  className={cn(
                     "text-2xl font-semibold tabular-nums",
                     stopped > 0 ? "text-amber-400" : "text-white",
                  )}
               >
                  {stopped}
               </p>
               <p className="text-xs text-muted-foreground mt-1">Stopped</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-lg text-muted-foreground">
                  Build cache
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               <p className="text-2xl font-semibold text-white tabular-nums">
                  {cacheLabel}
               </p>
               <p className="text-xs text-muted-foreground">
                  Accélère les builds — safe à vider
               </p>
               <PruneBuildCacheButton
                  size="sm"
                  variant="secondary"
                  label="Vider"
                  cacheSizeLabel={
                     buildCacheSize && buildCacheSize !== "—"
                        ? buildCacheSize
                        : null
                  }
                  onDone={onBuildCachePruned}
                  className="w-full sm:w-auto"
               />
            </CardContent>
         </Card>
      </div>
   );
}
