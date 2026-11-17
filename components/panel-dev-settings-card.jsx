"use client";

import { useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLinkIcon, Loader2Icon, PlayIcon, SquareIcon } from "lucide-react";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import RefreshButton from "@/components/refresh-button";
import {
   getPanelDevStatus,
   startPanelDev,
   stopPanelDev,
} from "@/app/actions/panel-dev";
import { PANEL_DEV_STATUS_KEY } from "@/lib/panel-dev";
import { cn } from "@/lib/utils";

function formatStartedAt(iso) {
   if (!iso) return null;
   try {
      return new Date(iso).toLocaleString("fr-FR", {
         dateStyle: "short",
         timeStyle: "short",
      });
   } catch {
      return null;
   }
}

export function PanelDevSettingsCard() {
   if (process.env.NEXT_PUBLIC_PANEL_MODE === "development") {
      return null;
   }

   const { data, error, isLoading, isValidating, mutate } = useSWR(
      PANEL_DEV_STATUS_KEY,
      getPanelDevStatus,
      {
         refreshInterval: 15_000,
         revalidateOnFocus: true,
      },
   );

   const [acting, setActing] = useState(null);
   const [confirmStop, setConfirmStop] = useState(false);

   const running = data?.running;
   const url = data?.url || "https://dev.vps.graphandco.com";
   const startedLabel = formatStartedAt(data?.startedAt);

   async function refresh() {
      await mutate();
   }

   async function onStart() {
      setActing("start");
      try {
         const res = await startPanelDev();
         if (!res.success) {
            toast.error(res.error || "Échec du démarrage");
            return;
         }
         toast.success("Panel dev démarré");
         await globalMutate(PANEL_DEV_STATUS_KEY);
         await mutate();
      } finally {
         setActing(null);
      }
   }

   async function onStop() {
      setActing("stop");
      try {
         const res = await stopPanelDev();
         if (!res.success) {
            toast.error(res.error || "Échec de l’arrêt");
            return;
         }
         toast.success("Panel dev arrêté");
         setConfirmStop(false);
         await globalMutate(PANEL_DEV_STATUS_KEY);
         await mutate();
      } finally {
         setActing(null);
      }
   }

   return (
      <>
         <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
               <CardTitle className="text-base text-primary">
                  Panel de développement
               </CardTitle>
               <RefreshButton
                  onClick={refresh}
                  loading={isLoading || isValidating}
               />
            </CardHeader>
            <CardContent className="space-y-4">
               {error ? (
                  <p className="text-sm text-destructive">{error.message}</p>
               ) : null}

               <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-border/40">
                  <div>
                     <p className="text-sm font-medium text-white">Statut</p>
                     <p className="text-xs text-muted-foreground mt-0.5">
                        Hot-reload Next.js · conteneur{" "}
                        <code className="text-[11px]">admin-panel-dev</code>
                     </p>
                  </div>
                  <div className="flex items-center gap-2">
                     {isLoading && !data ? (
                        <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                     ) : (
                        <>
                           <span
                              className={cn(
                                 "size-2.5 rounded-full",
                                 running
                                    ? "bg-green-500"
                                    : "bg-muted-foreground/50",
                              )}
                              aria-hidden
                           />
                           <span className="text-sm font-medium">
                              {running ? "Actif" : "Arrêté"}
                           </span>
                        </>
                     )}
                  </div>
               </div>

               <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-border/40">
                  <div>
                     <p className="text-sm font-medium text-white">URL</p>
                     {startedLabel ? (
                        <p className="text-xs text-muted-foreground mt-0.5">
                           Démarré · {startedLabel}
                        </p>
                     ) : null}
                  </div>
                  <Link
                     href={url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                     {url.replace(/^https?:\/\//, "")}
                     <ExternalLinkIcon className="size-3.5" />
                  </Link>
               </div>

               <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                     size="sm"
                     variant="outline"
                     onClick={onStart}
                     disabled={!!acting || running}
                  >
                     {acting === "start" ? (
                        <Loader2Icon className="size-4 mr-1.5 animate-spin" />
                     ) : (
                        <PlayIcon className="size-4 mr-1.5" />
                     )}
                     Démarrer
                  </Button>
                  <Button
                     size="sm"
                     variant="outline"
                     onClick={() => setConfirmStop(true)}
                     disabled={!!acting || !running}
                  >
                     {acting === "stop" ? (
                        <Loader2Icon className="size-4 mr-1.5 animate-spin" />
                     ) : (
                        <SquareIcon className="size-4 mr-1.5" />
                     )}
                     Arrêter
                  </Button>
               </div>

               <p className="text-xs text-muted-foreground">
                  Le démarrage peut prendre 1 à 3 minutes (build Docker). La prod
                  n’est pas impactée.
               </p>
            </CardContent>
         </Card>

         <ConfirmDialog
            open={confirmStop}
            onOpenChange={setConfirmStop}
            title="Arrêter le panel dev ?"
            description="Le conteneur admin-panel-dev sera arrêté et supprimé. Vous pourrez le redémarrer à tout moment depuis cette page."
            confirmLabel="Arrêter"
            variant="destructive"
            confirming={acting === "stop"}
            onConfirm={onStop}
         />
      </>
   );
}
