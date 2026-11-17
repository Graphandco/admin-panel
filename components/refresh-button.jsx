"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

/**
 * Bouton Actualiser — icône seule, style badge statut 200
 */
export default function RefreshButton({
   onClick,
   loading = false,
   disabled = false,
   title = "Actualiser",
   className,
   type = "button",
}) {
   async function handleClick(e) {
      try {
         await onClick?.(e);
         toast.success("Actualisé");
      } catch {
         // Erreur souvent déjà affichée par l’appelant / l’UI
      }
   }

   return (
      <button
         type={type}
         onClick={handleClick}
         disabled={disabled || loading}
         title={title}
         aria-label={title}
         className={cn(
            buttonVariants({ size: "icon" }),
            "bg-green-500/30 text-green-600 shadow-none hover:bg-green-500/45 hover:text-green-600 dark:text-green-400 dark:hover:text-green-400",
            className,
         )}
      >
         {loading ? (
            <Loader2Icon className="size-4 animate-spin" />
         ) : (
            <RefreshCwIcon className="size-4" />
         )}
      </button>
   );
}
