"use client";

import Link from "next/link";
import { BellIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
   Popover,
   PopoverContent,
   PopoverDescription,
   PopoverHeader,
   PopoverTitle,
   PopoverTrigger,
} from "@/components/ui/popover";
import {
   refreshAndMutateUpdateCounts,
   useUpdateCounts,
} from "@/hooks/use-update-counts";
import { notificationBadgeClassName } from "@/lib/notification-badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatCheckedAt(iso) {
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

export function NotificationsBell() {
   const { data, isValidating } = useUpdateCounts();
   const [refreshing, setRefreshing] = useState(false);
   const [open, setOpen] = useState(false);

   const total = data?.total ?? 0;
   const items = data?.items ?? [];
   const checkedLabel = formatCheckedAt(data?.checkedAt);

   async function onRefresh(e) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      setRefreshing(true);
      try {
         await refreshAndMutateUpdateCounts(null);
         toast.success("Compteurs actualisés");
      } catch (err) {
         toast.error(err.message || "Échec de l’actualisation");
      } finally {
         setRefreshing(false);
      }
   }

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger
            nativeButton={false}
            render={
               <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                     buttonVariants({ variant: "ghost", size: "icon" }),
                     "relative size-9 shrink-0",
                  )}
                  aria-label={
                     total > 0
                        ? `Notifications, ${total} mise${total > 1 ? "s" : ""} à jour`
                        : "Notifications"
                  }
               />
            }
         >
            <BellIcon className="size-5" />
            {total > 0 ? (
               <span
                  className={cn(
                     notificationBadgeClassName,
                     "absolute -top-0.5 -right-0.5",
                  )}
               >
                  {total > 99 ? "99+" : total}
               </span>
            ) : null}
         </PopoverTrigger>
         <PopoverContent align="end" sideOffset={8} className="w-[min(20rem,calc(100vw-2rem))] p-0">
            <div className="flex items-start justify-between gap-2 border-b border-border/60 px-3 py-2.5">
               <PopoverHeader className="gap-0.5 p-0">
                  <PopoverTitle>Notifications</PopoverTitle>
                  <PopoverDescription className="text-xs">
                     {checkedLabel
                        ? `Dernière vérif. ${checkedLabel}`
                        : "En attente du premier scan"}
                  </PopoverDescription>
               </PopoverHeader>
               <button
                  type="button"
                  className={cn(
                     buttonVariants({ variant: "ghost", size: "icon" }),
                     "size-8 shrink-0",
                  )}
                  disabled={refreshing}
                  onClick={onRefresh}
                  title="Rescanner maintenant"
               >
                  {refreshing || isValidating ? (
                     <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                     <RefreshCwIcon className="size-4" />
                  )}
               </button>
            </div>
            <ul className="py-1">
               {items.map((item) => (
                  <li key={item.id}>
                     <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors"
                     >
                        <span className="text-foreground">{item.label}</span>
                        {item.count > 0 ? (
                           <span className={notificationBadgeClassName}>
                              {item.count}
                           </span>
                        ) : (
                           <span className="text-xs text-muted-foreground">
                              OK
                           </span>
                        )}
                     </Link>
                  </li>
               ))}
            </ul>
            {total === 0 ? (
               <p className="border-t border-border/60 px-3 py-2.5 text-xs text-muted-foreground">
                  Aucune mise à jour en attente
               </p>
            ) : null}
         </PopoverContent>
      </Popover>
   );
}
