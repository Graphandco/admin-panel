"use client";

import { StatusCard } from "@/components/ui/status-card";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { PruneBuildCacheButton } from "@/components/docker/PruneBuildCacheButton";
import { Container, Clock, Ban } from "lucide-react";

const CARDS = [
   { id: "total", Icon: Container, color: "blue", label: "Containers" },
   { id: "running", Icon: Clock, color: "green", label: "En cours" },
   { id: "stopped", Icon: Ban, color: "slate", label: "Arrêtés" },
];

export function StatusCards({
   total = 0,
   running = 0,
   stopped = 0,
   buildCacheSize = null,
   onBuildCachePruned,
}) {
   const values = { total, running, stopped };
   const cacheLabel = buildCacheSize || "—";

   return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
         {CARDS.map(({ id, Icon, color, label }) => (
            <StatusCard
               key={id}
               Icon={Icon}
               color={color}
               label={label}
               value={values[id]}
            />
         ))}
         <Card className="border-primary/20">
            <CardHeader className="pb-1">
               <CardTitle className="text-xs text-muted-foreground">
                  Build cache
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white tabular-nums">
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
