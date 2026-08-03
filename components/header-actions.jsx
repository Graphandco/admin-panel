"use client";

import Link from "next/link";
import { SettingsIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { NotificationsBell } from "@/components/notifications-bell";
import { cn } from "@/lib/utils";

export function HeaderActions() {
   const isDev = process.env.NODE_ENV === "development";

   return (
      <div className="flex shrink-0 items-center gap-1 pe-4 md:pe-8">
         {isDev ? (
            <span
               className="rounded-md bg-[#16a34a] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#fff]"
               title="Environnement de développement"
            >
               DEV
            </span>
         ) : null}
         <Link
            href="/settings"
            className={cn(
               buttonVariants({ variant: "ghost", size: "icon" }),
               "size-9 shrink-0",
            )}
            aria-label="Réglages"
            title="Réglages"
         >
            <SettingsIcon className="size-5" />
         </Link>
         <NotificationsBell />
      </div>
   );
}
