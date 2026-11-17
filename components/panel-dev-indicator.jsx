"use client";

import Link from "next/link";
import useSWR from "swr";
import { getPanelDevStatus } from "@/app/actions/panel-dev";
import { PANEL_DEV_STATUS_KEY } from "@/lib/panel-dev";
import { cn } from "@/lib/utils";

export function PanelDevIndicator() {
   if (process.env.NEXT_PUBLIC_PANEL_MODE === "development") {
      return null;
   }

   const { data } = useSWR(PANEL_DEV_STATUS_KEY, getPanelDevStatus, {
      refreshInterval: 15_000,
      revalidateOnFocus: true,
      dedupingInterval: 5_000,
   });

   if (!data?.running) return null;

   const url = data.url || "https://dev.vps.graphandco.com";

   return (
      <Link
         href={url}
         target="_blank"
         rel="noopener noreferrer"
         className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-muted/50",
         )}
         title="Panel dev actif — ouvrir"
      >
         <span className="size-2 shrink-0 rounded-full bg-green-500" aria-hidden />
         <span>Dev</span>
      </Link>
   );
}
