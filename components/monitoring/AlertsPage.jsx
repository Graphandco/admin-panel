"use client";

import { useState } from "react";
import Link from "next/link";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAlertsOverview } from "@/app/actions/alerts";
import { agenceSitesCheckNow } from "@/app/actions/agence-sites";
import { AGENCE_SITES_KEY } from "@/components/agence/SitesPage";
import RefreshButton from "@/components/refresh-button";
import { ALERTS_OVERVIEW_KEY } from "@/hooks/use-alerts";
import { mutate as globalMutate } from "swr";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
   AlertTriangleIcon,
   CheckCircle2Icon,
   Container,
   ExternalLinkIcon,
   GlobeIcon,
   Loader2Icon,
   ServerIcon,
   ShieldAlertIcon,
} from "lucide-react";

export { ALERTS_OVERVIEW_KEY };

function formatSince(iso) {
   if (!iso) return "—";
   try {
      return new Date(iso).toLocaleString("fr-FR", {
         dateStyle: "short",
         timeStyle: "short",
      });
   } catch {
      return iso;
   }
}

function typeIcon(type) {
   if (type === "docker") return Container;
   if (type === "vps") return ServerIcon;
   return GlobeIcon;
}

function AlertRow({ item }) {
   const Icon = typeIcon(item.type);
   const isCritical = item.severity === "critical";

   return (
      <div
         className={cn(
            "flex flex-wrap items-start justify-between gap-3 rounded-lg border px-4 py-3",
            isCritical
               ? "border-red-500/30 bg-red-500/5"
               : "border-amber-500/30 bg-amber-500/5",
         )}
      >
         <div className="flex min-w-0 items-start gap-3">
            <Icon
               className={cn(
                  "size-5 shrink-0 mt-0.5",
                  isCritical ? "text-red-400" : "text-amber-400",
               )}
            />
            <div className="min-w-0">
               <p className="font-medium text-white">{item.title}</p>
               <p className="text-sm text-muted-foreground mt-0.5">
                  {item.message}
               </p>
               <p className="text-xs text-muted-foreground mt-1">
                  Depuis {formatSince(item.since)}
               </p>
            </div>
         </div>
         <Link
            href={item.href}
            className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 hover:underline shrink-0"
         >
            Voir
            <ExternalLinkIcon className="size-3.5" />
         </Link>
      </div>
   );
}

function SummaryCard({ label, value, tone = "default" }) {
   const toneClass =
      tone === "danger"
         ? "text-red-300"
         : tone === "warn"
           ? "text-amber-300"
           : "text-white";
   return (
      <div className="rounded-lg border border-white/10 bg-card/40 px-4 py-3">
         <p className="text-xs text-muted-foreground">{label}</p>
         <p
            className={cn(
               "text-2xl font-semibold tabular-nums mt-1",
               toneClass,
            )}
         >
            {value}
         </p>
      </div>
   );
}

export default function AlertsPage() {
   const {
      data,
      error: fetchError,
      isLoading,
      isValidating,
      mutate,
   } = useCachedSWR(ALERTS_OVERVIEW_KEY, () => getAlertsOverview());

   const [checkingSites, setCheckingSites] = useState(false);

   const error = fetchError?.message || null;
   const items = data?.items || [];
   const critical = data?.critical ?? 0;
   const warnings = data?.warnings ?? 0;
   const summary = data?.summary || {};

   async function handleSitesCheck() {
      setCheckingSites(true);
      try {
         await agenceSitesCheckNow();
         await Promise.all([mutate(), globalMutate(AGENCE_SITES_KEY)]);
         toast.success("Vérification des sites lancée");
      } catch (err) {
         toast.error(err.message || "Erreur");
      } finally {
         setCheckingSites(false);
      }
   }

   return (
      <div className="grid gap-6">
         <header className="flex flex-wrap justify-between items-center gap-4">
            <div>
               <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShieldAlertIcon className="size-6 text-muted-foreground" />
                  Alertes
               </h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Sites, containers Docker et saturation VPS
                  {data?.checkedAt ? ` · ${formatSince(data.checkedAt)}` : ""}
               </p>
            </div>
            <div className="flex items-center gap-2">
               <Button
                  variant="outline"
                  size="sm"
                  disabled={checkingSites}
                  onClick={handleSitesCheck}
               >
                  {checkingSites ? (
                     <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                     <GlobeIcon className="size-4" />
                  )}
                  Vérifier les sites
               </Button>
               <RefreshButton
                  onClick={() => mutate()}
                  loading={isLoading || isValidating}
               />
            </div>
         </header>

         {error ? (
            <Card>
               <CardContent className="py-6 text-destructive text-sm">
                  {error}
               </CardContent>
            </Card>
         ) : null}

         <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <SummaryCard
               label="Critiques"
               value={critical}
               tone={critical > 0 ? "danger" : "default"}
            />
            <SummaryCard
               label="Avertissements"
               value={warnings}
               tone={warnings > 0 ? "warn" : "default"}
            />
            <SummaryCard
               label="Sites down"
               value={summary.sitesDown ?? 0}
               tone={summary.sitesDown > 0 ? "danger" : "default"}
            />
            <SummaryCard
               label="Containers arrêtés"
               value={summary.containersDown ?? 0}
               tone={summary.containersDown > 0 ? "danger" : "default"}
            />
         </div>

         {isLoading && !data ? (
            <div className="flex justify-center py-16">
               <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
         ) : items.length === 0 ? (
            <Card>
               <CardContent className="py-12 text-center">
                  <CheckCircle2Icon className="size-10 text-emerald-400 mx-auto mb-3" />
                  <p className="font-medium text-white">Aucune alerte active</p>
                  <p className="text-sm text-muted-foreground mt-1">
                     Tout semble en ordre. Les alertes Telegram continuent de
                     fonctionner en arrière-plan.
                  </p>
               </CardContent>
            </Card>
         ) : (
            <Card>
               <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                     <CardTitle className="text-white">
                        Incidents en cours
                     </CardTitle>
                     {critical > 0 ? (
                        <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/20">
                           {critical} critique{critical > 1 ? "s" : ""}
                        </Badge>
                     ) : null}
                     {warnings > 0 ? (
                        <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/20">
                           {warnings} lent{warnings > 1 ? "s" : ""}
                        </Badge>
                     ) : null}
                  </div>
               </CardHeader>
               <CardContent className="grid gap-3">
                  {items.map((item) => (
                     <AlertRow key={item.id} item={item} />
                  ))}
               </CardContent>
            </Card>
         )}

         {summary.vpsAlerts > 0 ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
               <AlertTriangleIcon className="size-3.5" />
               Saturation VPS : {summary.vpsAlerts} métrique
               {summary.vpsAlerts > 1 ? "s" : ""} au-dessus du seuil —{" "}
               <Link
                  href="/vps/stats"
                  className="text-emerald-400 hover:underline"
               >
                  voir les stats
               </Link>
            </p>
         ) : null}
      </div>
   );
}
