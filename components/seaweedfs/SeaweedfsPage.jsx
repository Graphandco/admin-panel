"use client";

import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSeaweedfsStatus } from "@/app/actions/seaweedfs";
import { appsList } from "@/app/actions/apps";
import { APPS_KEY } from "@/components/apps/AppsPage";
import RefreshButton from "@/components/refresh-button";
import {
   CheckCircle2Icon,
   ExternalLinkIcon,
   HardDriveIcon,
   Loader2Icon,
   ServerIcon,
   ShieldAlertIcon,
   ShieldCheckIcon,
   XCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SEAWEEDFS_KEY = "seaweedfs-status";

function quickLinkLabel(name) {
   return String(name || "")
      .replace(/^SeaweedFS\s+/i, "")
      .trim();
}

function quickLinkInstanceId(app) {
   const name = String(app.name || "").toLowerCase();
   if (name.includes("vps")) return "vps";
   if (name.includes("nas")) return "nas";
   return null;
}

function getQuickLinksForInstance(apps, instanceId) {
   return (apps || [])
      .filter((app) => /seaweedfs/i.test(app.name))
      .filter((app) => quickLinkInstanceId(app) === instanceId)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function formatBytes(val) {
   if (val == null || val < 0) return "—";
   if (val < 1024) return `${val} B`;
   const k = 1024;
   const sizes = ["B", "KB", "MB", "GB", "TB"];
   const i = Math.floor(Math.log(val) / Math.log(k));
   return `${(val / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatCheckedAt(iso) {
   if (!iso) return "—";
   try {
      return new Date(iso).toLocaleString("fr-FR", {
         dateStyle: "short",
         timeStyle: "medium",
      });
   } catch {
      return iso;
   }
}

function StatusDot({ ok }) {
   return (
      <span
         className={cn(
            "inline-block size-2 rounded-full shrink-0",
            ok ? "bg-emerald-400" : "bg-red-400",
         )}
      />
   );
}

function AccessBadge({ access }) {
   if (!access) return null;
   const inconclusive = access.inconclusive || access.match === null;
   const ok = access.match === true;
   const isPublic = access.observed === "public";
   return (
      <Badge
         variant="outline"
         className={cn(
            "gap-1 font-normal",
            inconclusive
               ? "border-muted-foreground/40 text-muted-foreground"
               : ok
                 ? isPublic
                    ? "border-sky-500/40 text-sky-300"
                    : "border-emerald-500/40 text-emerald-300"
                 : "border-amber-500/50 text-amber-300",
         )}
         title={access.label}
      >
         {inconclusive ? (
            <ShieldAlertIcon className="size-3" />
         ) : ok ? (
            <ShieldCheckIcon className="size-3" />
         ) : (
            <ShieldAlertIcon className="size-3" />
         )}
         {access.label}
      </Badge>
   );
}

function BucketRow({ bucket }) {
   const auth = bucket.auth || {};
   const countLabel =
      auth.objectCount == null
         ? "—"
         : auth.truncated
           ? `${auth.objectCount.toLocaleString("fr-FR")}+`
           : auth.objectCount.toLocaleString("fr-FR");

   return (
      <tr className="border-b border-white/5 last:border-0">
         <td className="py-3 pe-3">
            <div className="font-medium text-white">{bucket.name}</div>
            <div className="text-xs text-muted-foreground">{bucket.id}</div>
         </td>
         <td className="py-3 pe-3">
            <div className="inline-flex items-center gap-1.5 text-sm">
               <StatusDot ok={!!auth.ok} />
               {auth.ok ? "OK" : "Erreur"}
            </div>
            {auth.error ? (
               <p className="text-xs text-destructive mt-0.5 max-w-[14rem] truncate" title={auth.error}>
                  {auth.error}
               </p>
            ) : auth.ms != null ? (
               <p className="text-xs text-muted-foreground">{auth.ms} ms</p>
            ) : null}
         </td>
         <td className="py-3 pe-3 tabular-nums text-sm text-white">
            {countLabel}
            {(auth.totalBytes != null || auth.sampleBytes != null) &&
            auth.ok ? (
               <span className="block text-xs text-muted-foreground">
                  {formatBytes(auth.totalBytes ?? auth.sampleBytes)}
                  {auth.truncated ? " (partiel)" : ""}
               </span>
            ) : null}
         </td>
         <td className="py-3">
            <AccessBadge access={bucket.access} />
            {bucket.anonymous?.status != null ? (
               <p className="text-[11px] text-muted-foreground mt-1">
                  Anonyme HTTP {bucket.anonymous.status}
                  {bucket.anonymous.listable ? " · listable" : ""}
               </p>
            ) : null}
         </td>
      </tr>
   );
}

function InstanceCard({ instance, quickLinks = [] }) {
   const Icon = instance.id === "vps" ? ServerIcon : HardDriveIcon;
   return (
      <Card className="min-w-0">
         <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
               <CardTitle className="flex items-center gap-2 text-white">
                  <Icon className="size-5 text-muted-foreground" />
                  {instance.label}
               </CardTitle>
               <div className="flex flex-wrap items-center gap-2">
                  {instance.healthy ? (
                     <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 gap-1">
                        <CheckCircle2Icon className="size-3" />
                        Joignable
                     </Badge>
                  ) : (
                     <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/20 gap-1">
                        <XCircleIcon className="size-3" />
                        Problème
                     </Badge>
                  )}
                  {instance.accessOk ? (
                     <Badge
                        variant="outline"
                        className="border-emerald-500/40 text-emerald-300 gap-1"
                     >
                        <ShieldCheckIcon className="size-3" />
                        Accès conforme
                     </Badge>
                  ) : (
                     <Badge
                        variant="outline"
                        className="border-amber-500/50 text-amber-300 gap-1"
                     >
                        <ShieldAlertIcon className="size-3" />
                        Accès à vérifier
                     </Badge>
                  )}
               </div>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1 break-all">
               {instance.endpoint}
               {instance.endpointProbe?.ms != null
                  ? ` · ${instance.endpointProbe.ms} ms`
                  : ""}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
               {(() => {
                  const hasPublic = instance.buckets?.some(
                     (b) => b.expectedAccess === "public",
                  );
                  const hasPrivate = instance.buckets?.some(
                     (b) => b.expectedAccess === "private",
                  );
                  if (hasPublic && hasPrivate) return "Buckets : ";
                  if (hasPublic) return "Bucket public : ";
                  return "Buckets privés : ";
               })()}
               <span className="text-white">
                  {(instance.configuredBuckets || instance.buckets?.map((b) => b.name) || []).join(", ") || "—"}
               </span>
            </p>
            {instance.docker?.found ? (
               <p className="text-xs text-muted-foreground mt-1">
                  Conteneur{" "}
                  <span className="text-white">{instance.docker.state}</span>
                  {instance.docker.status
                     ? ` — ${instance.docker.status}`
                     : ""}
               </p>
            ) : null}
            {instance.unexpectedBuckets?.length > 0 ? (
               <p className="text-xs text-amber-300/90 mt-1">
                  Autres buckets visibles sur cet endpoint (hors config) :{" "}
                  {instance.unexpectedBuckets.join(", ")}
               </p>
            ) : null}
            {quickLinks.length > 0 ? (
               <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  {quickLinks.map((link) => (
                     <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 hover:underline"
                     >
                        <ExternalLinkIcon className="size-3.5 shrink-0" />
                        {quickLinkLabel(link.name)}
                     </a>
                  ))}
               </div>
            ) : null}
         </CardHeader>
         <CardContent className="overflow-x-auto">
            {!instance.buckets?.length ? (
               <p className="text-sm text-muted-foreground py-4 text-center">
                  Aucun bucket configuré
               </p>
            ) : (
               <table className="w-full text-left text-sm">
                  <thead>
                     <tr className="text-xs text-muted-foreground border-b border-white/10">
                        <th className="pb-2 pe-3 font-medium">Bucket</th>
                        <th className="pb-2 pe-3 font-medium">Auth</th>
                        <th className="pb-2 pe-3 font-medium">Objets</th>
                        <th className="pb-2 font-medium">Visibilité</th>
                     </tr>
                  </thead>
                  <tbody>
                     {instance.buckets.map((b) => (
                        <BucketRow key={b.id} bucket={b} />
                     ))}
                  </tbody>
               </table>
            )}
         </CardContent>
      </Card>
   );
}

export default function SeaweedfsPage() {
   const {
      data,
      error: fetchError,
      isLoading,
      isValidating,
      mutate,
   } = useCachedSWR(SEAWEEDFS_KEY, () => getSeaweedfsStatus());
   const { data: apps = [] } = useCachedSWR(APPS_KEY, () => appsList());

   const error = fetchError?.message || null;
   const instances = data?.instances || [];

   return (
      <div className="grid gap-6">
         <header className="flex flex-wrap justify-between items-center gap-4">
            <div>
               <h1 className="text-2xl font-bold text-white">SeaweedFS</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Surveillance des buckets SeaweedFS par instance
                  {data?.checkedAt
                     ? ` · ${formatCheckedAt(data.checkedAt)}`
                     : ""}
               </p>
            </div>
            <RefreshButton
               onClick={() => mutate()}
               loading={isLoading || isValidating}
            />
         </header>

         {error ? (
            <Card>
               <CardContent className="py-6 text-destructive text-sm">
                  {error}
               </CardContent>
            </Card>
         ) : null}

         {isLoading && !data ? (
            <div className="flex justify-center py-16">
               <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
         ) : data && data.configured === false ? (
            <Card>
               <CardContent className="py-8 text-sm text-muted-foreground">
                  {data.message ||
                     "Configurez STORAGE_PUBLIC / STORAGE_WORDPRESS / STORAGE_REGIS / STORAGE_SIXMYK / STORAGE_PERSO dans admin-api/.env"}
               </CardContent>
            </Card>
         ) : (
            <div className="grid gap-6">
               {instances.map((inst) => (
                  <InstanceCard
                     key={inst.id}
                     instance={inst}
                     quickLinks={getQuickLinksForInstance(apps, inst.id)}
                  />
               ))}
            </div>
         )}
      </div>
   );
}
