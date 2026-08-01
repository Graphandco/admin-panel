"use client";

import { Loader2Icon } from "lucide-react";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/**
 * Confirmation contrôlée (remplace window.confirm).
 */
export function ConfirmDialog({
   open,
   onOpenChange,
   title,
   description,
   confirmLabel = "Confirmer",
   cancelLabel = "Annuler",
   onConfirm,
   confirming = false,
   variant = "default",
}) {
   return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>{title}</AlertDialogTitle>
               {description ? (
                  <AlertDialogDescription className="whitespace-pre-line">
                     {description}
                  </AlertDialogDescription>
               ) : null}
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel disabled={confirming}>
                  {cancelLabel}
               </AlertDialogCancel>
               <AlertDialogAction
                  disabled={confirming}
                  className={cn(
                     variant === "destructive" &&
                        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                  )}
                  onClick={(e) => {
                     e.preventDefault();
                     onConfirm?.();
                  }}
               >
                  {confirming ? (
                     <Loader2Icon className="size-4 animate-spin" />
                  ) : null}
                  {confirmLabel}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}

/**
 * Alerte informative contrôlée (remplace window.alert).
 */
export function AlertNoticeDialog({
   open,
   onOpenChange,
   title = "Attention",
   description,
   confirmLabel = "OK",
}) {
   return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>{title}</AlertDialogTitle>
               {description ? (
                  <AlertDialogDescription className="whitespace-pre-line">
                     {description}
                  </AlertDialogDescription>
               ) : null}
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogAction onClick={() => onOpenChange?.(false)}>
                  {confirmLabel}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
