"use client";

import Link from "next/link";
import { BellIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { mutate as globalMutate } from "swr";
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
import { useAlertsOverview } from "@/hooks/use-alerts";
import { ALERTS_OVERVIEW_KEY } from "@/components/monitoring/AlertsPage";
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
   const { data: alerts } = useAlertsOverview();
   const [refreshing, setRefreshing] = useState(false);
   const [open, setOpen] = useState(false);

   const updateTotal = data?.total ?? 0;
   const updateItems = data?.items ?? [];
   const alertTotal = alerts?.total ?? 0;
   const alertCritical = alerts?.critical ?? 0;
   const badgeTotal = updateTotal + alertTotal;
   const checkedLabel = formatCheckedAt(data?.checkedAt);

   async function onRefresh(e) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      setRefreshing(true);
      try {
         const result = await refreshAndMutateUpdateCounts(null);
         await globalMutate(ALERTS_OVERVIEW_KEY);
         const ok = result?.ok?.length ?? 0;
         const failed = result?.failed ?? [];
         if (ok > 0 && failed.length === 0) {
            toast.success("Compteurs actualisés");
         } else if (ok > 0) {
            toast.message(
               `Partiel : ${ok} OK, ${failed.length} échec${failed.length > 1 ? "s" : ""}`,
            );
         } else {
            const detail = failed[0]?.error || "Aucun scan réussi";
            toast.error(detail);
         }
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
                     badgeTotal > 0
                        ? `Notifications, ${badgeTotal} élément${badgeTotal > 1 ? "s" : ""}`
                        : "Notifications"
                  }
               />
            }
         >
            <BellIcon className="size-5" />
            {badgeTotal > 0 ? (
               <span
                  className={cn(
                     notificationBadgeClassName,
                     alertCritical > 0 && "bg-red-500 text-white",
                     "absolute -top-0.5 -right-0.5",
                  )}
               >
                  {badgeTotal > 99 ? "99+" : badgeTotal}
               </span>
            ) : null}
         </PopoverTrigger>
         <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[min(20rem,calc(100vw-2rem))] p-0"
         >
            <div className="flex items-start justify-between gap-2 border-b border-border/60 px-3 py-2.5">
               <PopoverHeader className="gap-0.5 p-0">
                  <PopoverTitle>Notifications</PopoverTitle>
                  <PopoverDescription className="text-xs">
                     {checkedLabel
                        ? `Mises à jour · ${checkedLabel}`
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

            {alertTotal > 0 ? (
               <div className="border-b border-border/60">
                  <p className="px-3 pt-2.5 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                     Alertes
                  </p>
                  <Link
                     href="/monitoring/alertes"
                     onClick={() => setOpen(false)}
                     className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors"
                  >
                     <span className="text-foreground">Incidents actifs</span>
                     <span
                        className={cn(
                           notificationBadgeClassName,
                           alertCritical > 0 && "bg-red-500 text-white",
                        )}
                     >
                        {alertTotal}
                     </span>
                  </Link>
               </div>
            ) : null}

            <div>
               <p className="px-3 pt-2.5 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Mises à jour
               </p>
               <ul className="py-1">
                  {updateItems.map((item) => (
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
            </div>

            {badgeTotal === 0 ? (
               <p className="border-t border-border/60 px-3 py-2.5 text-xs text-muted-foreground">
                  Rien à signaler
               </p>
            ) : null}
         </PopoverContent>
      </Popover>
   );
}
