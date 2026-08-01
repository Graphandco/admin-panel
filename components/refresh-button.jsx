"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";

/**
 * Bouton Actualiser — même style que Docker > Containers
 */
export default function RefreshButton({
   onClick,
   loading = false,
   disabled = false,
   label = "Actualiser",
   className,
   type = "button",
}) {
   return (
      <button
         type={type}
         onClick={onClick}
         disabled={disabled || loading}
         className={cn(buttonVariants({}), className)}
      >
         {loading ? (
            <Loader2Icon className="size-4 mr-1 animate-spin" />
         ) : (
            <RefreshCwIcon className="size-4 mr-1" />
         )}
         {label}
      </button>
   );
}
