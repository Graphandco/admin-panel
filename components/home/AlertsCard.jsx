"use client";

import Link from "next/link";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { ShieldAlertIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useAlertsOverview } from "@/hooks/use-alerts";

export default function AlertsCard() {
   const { data, error: fetchError, isLoading } = useAlertsOverview();
   const error = fetchError?.message || null;
   const total = data?.total ?? 0;
   const critical = data?.critical ?? 0;

   if (error) {
      return (
         <Card className="h-full">
            <CardContent className="py-4 md:py-6 text-destructive text-xs md:text-sm">
               {error}
            </CardContent>
         </Card>
      );
   }

   return (
      <Link href="/monitoring/alertes">
         <Card className="h-full cursor-pointer hover:border-muted-foreground/30 transition-colors">
            <CardHeader>
               <CardTitle className="flex items-center gap-1.5 md:gap-2 min-w-0">
                  <ShieldAlertIcon className="size-4 md:size-5 text-muted-foreground shrink-0" />
                  <span className="truncate text-sm md:text-base">Alertes</span>
               </CardTitle>
            </CardHeader>
            <CardContent>
               {isLoading && !data?.checkedAt ? (
                  <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
               ) : total === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                     <CheckCircle2Icon className="size-4 shrink-0" />
                     <span className="text-xs md:text-sm">Tout OK</span>
                  </div>
               ) : (
                  <div className="space-y-1">
                     <p
                        className={
                           critical > 0
                              ? "text-red-400 text-lg md:text-xl font-semibold tabular-nums"
                              : "text-amber-400 text-lg md:text-xl font-semibold tabular-nums"
                        }
                     >
                        {total}
                     </p>
                     <p className="text-xs text-muted-foreground">
                        {critical > 0
                           ? `${critical} critique${critical > 1 ? "s" : ""}`
                           : "avertissement" + (total > 1 ? "s" : "")}
                     </p>
                  </div>
               )}
            </CardContent>
         </Card>
      </Link>
   );
}
