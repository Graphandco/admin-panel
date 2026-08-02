"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EraserIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { dockerBuilderPrune } from "@/app/actions/docker";
import { cn } from "@/lib/utils";

/**
 * Bouton + modal pour `docker buildx prune -af`.
 */
export function PruneBuildCacheButton({
   className,
   size = "sm",
   variant = "outline",
   label = "Vider le build cache",
   cacheSizeLabel = null,
   onDone,
}) {
   const [open, setOpen] = useState(false);
   const [running, setRunning] = useState(false);

   async function run() {
      setRunning(true);
      try {
         const res = await dockerBuilderPrune();
         if (!res.success) {
            toast.error(res.error || "Échec du prune");
            return;
         }
         const freed = res.spaceReclaimedFormatted || "0 B";
         toast.success(
            freed !== "0 B"
               ? `Build cache vidé — ${freed} libérés`
               : "Build cache vidé (rien à libérer)",
         );
         setOpen(false);
         onDone?.(res);
      } finally {
         setRunning(false);
      }
   }

   const description = [
      "Supprime le cache de build Docker (BuildKit).",
      "Sans impact sur les conteneurs en cours d’exécution.",
      "Les prochains builds seront plus lents.",
      cacheSizeLabel ? `Cache actuel : ${cacheSizeLabel}.` : null,
   ]
      .filter(Boolean)
      .join("\n");

   return (
      <>
         <Button
            type="button"
            variant={variant}
            size={size}
            className={cn(className)}
            onClick={() => setOpen(true)}
            disabled={running}
         >
            {running ? (
               <Loader2Icon className="size-4 animate-spin" />
            ) : (
               <EraserIcon className="size-4" />
            )}
            {label}
         </Button>
         <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            title="Vider le build cache Docker ?"
            description={description}
            confirmLabel="Vider le cache"
            variant="destructive"
            confirming={running}
            onConfirm={run}
         />
      </>
   );
}
