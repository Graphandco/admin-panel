"use client";

import Link from "next/link";
import {
   Card,
   CardHeader,
   CardTitle,
   CardAction,
   CardContent,
} from "@/components/ui/card";
import { HardDrive, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { getSeaweedfsStatus } from "@/app/actions/seaweedfs";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { SEAWEEDFS_KEY } from "@/components/seaweedfs/SeaweedfsPage";
import { cn } from "@/lib/utils";

function formatBytes(val) {
   if (val == null || val < 0) return "—";
   if (val < 1024) return `${val} B`;
   const k = 1024;
   const sizes = ["B", "KB", "MB", "GB", "TB"];
   const i = Math.floor(Math.log(val) / Math.log(k));
   return `${(val / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function flattenBuckets(data) {
   const rows = [];
   for (const inst of data?.instances || []) {
      for (const b of inst.buckets || []) {
         rows.push({
            key: `${inst.id}-${b.id}`,
            name: b.name,
            instanceLabel: inst.label,
            ok: !!b.auth?.ok,
            bytes: b.auth?.totalBytes ?? b.auth?.sampleBytes ?? null,
            truncated: !!b.auth?.truncated,
         });
      }
   }
   return rows;
}

export default function SeaweedfsCard() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      mutate,
   } = useCachedSWR(SEAWEEDFS_KEY, () => getSeaweedfsStatus());
   const error = fetchError?.message || null;
   const buckets = flattenBuckets(data);

   async function load(e) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      await mutate();
   }

   if (error) {
      return (
         <Card className="h-full">
            <CardContent className="py-4 md:py-6">
               <div className="text-destructive flex items-center gap-3">
                  <p className="text-xs md:text-sm">{error}</p>
                  <button
                     onClick={load}
                     className="inline-flex items-center gap-1 text-xs md:text-sm underline"
                  >
                     <RefreshCwIcon className="size-4" />
                     Réessayer
                  </button>
               </div>
            </CardContent>
         </Card>
      );
   }

   return (
      <Link href="/seaweedfs">
         <Card className="h-full cursor-pointer hover:border-muted-foreground/30 transition-colors">
            <CardHeader>
               <CardTitle className="flex items-center gap-1.5 md:gap-2 min-w-0">
                  <HardDrive
                     size={32}
                     className="size-8 shrink-0 text-orange-500 p-1.5 md:p-2 bg-orange-500/10 border border-orange-500/20 rounded-md md:mr-2"
                  />
                  <span className="text-sm md:text-lg font-medium text-white truncate">
                     SeaweedFS
                  </span>
               </CardTitle>
               <CardAction>
                  {loading && !data ? (
                     <Loader2Icon className="size-5 md:size-6 animate-spin text-muted-foreground" />
                  ) : null}
               </CardAction>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
               {loading && !data ? (
                  <p className="text-muted-foreground text-xs md:text-sm">
                     Chargement...
                  </p>
               ) : buckets.length === 0 ? (
                  <p className="text-muted-foreground text-xs md:text-sm">
                     Aucun bucket
                  </p>
               ) : (
                  buckets.map((b) => (
                     <div
                        key={b.key}
                        className="flex items-center justify-between gap-2 w-full text-xs"
                     >
                        <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
                           <span
                              className={cn(
                                 "size-1.5 rounded-full shrink-0",
                                 b.ok ? "bg-emerald-400" : "bg-red-400",
                              )}
                           />
                           <span className="text-white/90 truncate">
                              {b.name}
                           </span>
                           <span className="opacity-50 truncate">
                              ({b.instanceLabel === "VPS" ? "VPS" : "NAS"})
                           </span>
                        </span>
                        <span className="tabular-nums shrink-0 text-muted-foreground">
                           {formatBytes(b.bytes)}
                           {b.truncated ? "+" : ""}
                        </span>
                     </div>
                  ))
               )}
            </CardContent>
         </Card>
      </Link>
   );
}
