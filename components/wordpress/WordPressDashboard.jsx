"use client";

import Link from "next/link";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
   CardAction,
} from "@/components/ui/card";
import RefreshButton from "@/components/refresh-button";
import {
   Loader2Icon,
   ArrowUpCircle,
   GlobeIcon,
   PackageIcon,
   ServerIcon,
} from "lucide-react";
import {
   wordpressSites,
   wordpressPlugins,
   wordpressInfo,
} from "@/app/actions/wordpress";
import { agenceSitesList } from "@/app/actions/agence-sites";
import { WORDPRESS_SITES_KEY } from "@/components/wordpress/SitesRecapCard";
import { WORDPRESS_PLUGINS_KEY } from "@/components/wordpress/PluginsCard";
import { AGENCE_SITES_KEY } from "@/components/agence/SitesPage";
import WordPressSitesTable from "@/components/wordpress/WordPressSitesTable";
import { cn } from "@/lib/utils";

function safeHost(url) {
   try {
      return new URL(url).hostname;
   } catch {
      return url || "—";
   }
}

function MiniStat({
   href,
   icon: Icon,
   iconClass,
   label,
   value,
   loading,
   hint,
   tone,
}) {
   const inner = (
      <Card
         className={cn(
            "h-min",
            href &&
               "cursor-pointer hover:border-muted-foreground/30 transition-colors",
         )}
      >
         <CardHeader>
            <CardTitle className="flex items-center gap-2 min-w-0">
               <div
                  className={cn(
                     "size-10 p-2 rounded-md flex items-center justify-center border",
                     iconClass,
                  )}
               >
                  <Icon className="size-5 opacity-90" />
               </div>
               <span className="text-sm md:text-base font-medium text-white truncate">
                  {label}
               </span>
            </CardTitle>
            <CardAction>
               {loading ? (
                  <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
               ) : (
                  <span
                     className={cn(
                        "text-xl md:text-2xl font-bold tabular-nums",
                        tone,
                     )}
                  >
                     {value}
                  </span>
               )}
            </CardAction>
         </CardHeader>
         {hint ? (
            <CardContent>
               <p className="text-muted-foreground text-xs md:text-sm">{hint}</p>
            </CardContent>
         ) : null}
      </Card>
   );
   return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function WordPressDashboard() {
   const sitesSwr = useCachedSWR(WORDPRESS_SITES_KEY, () => wordpressSites());
   const monSwr = useCachedSWR(AGENCE_SITES_KEY, () => agenceSitesList());
   const pluginsSwr = useCachedSWR(WORDPRESS_PLUGINS_KEY, () =>
      wordpressPlugins(),
   );
   const infoSwr = useCachedSWR("wordpress-info", () => wordpressInfo());

   const sites = sitesSwr.data || [];
   const plugins = pluginsSwr.data?.plugins || [];
   const summary = pluginsSwr.data?.summary;
   const updates =
      summary?.updates ??
      plugins.filter((p) => p.update === "available").length;
   const updateList = plugins
      .filter((p) => p.update === "available")
      .slice(0, 8);
   const info = infoSwr.data;

   const loading =
      sitesSwr.isLoading || pluginsSwr.isLoading || infoSwr.isLoading;

   async function refreshAll() {
      await Promise.all([
         sitesSwr.mutate(),
         monSwr.mutate(),
         pluginsSwr.mutate(),
         infoSwr.mutate(),
      ]);
   }

   return (
      <div className="space-y-6">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
               <h2 className="text-xl font-semibold text-white">
                  Tableau de bord
               </h2>
               <p className="text-sm text-muted-foreground mt-1">
                  Vue d&apos;ensemble du réseau WordPress
                  {info?.multisite ? " · Multisite" : ""}
               </p>
            </div>
            <RefreshButton
               onClick={refreshAll}
               loading={
                  loading ||
                  sitesSwr.isValidating ||
                  monSwr.isValidating ||
                  pluginsSwr.isValidating ||
                  infoSwr.isValidating
               }
            />
         </div>

         <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <MiniStat
               icon={GlobeIcon}
               iconClass="bg-[#21759b]/10 border-[#21759b]/20 text-[#21759b]"
               label="Sites"
               value={sitesSwr.isLoading ? "…" : sites.length}
               loading={sitesSwr.isLoading}
               hint="Réseau multisite"
            />
            <MiniStat
               href="/wordpress/plugins"
               icon={PackageIcon}
               iconClass="bg-[#21759b]/10 border-[#21759b]/20 text-[#21759b]"
               label="Extensions"
               value={
                  pluginsSwr.isLoading
                     ? "…"
                     : (summary?.total ?? plugins.length)
               }
               loading={pluginsSwr.isLoading}
               hint={`${summary?.active ?? 0} actives`}
            />
            <MiniStat
               href="/wordpress/plugins"
               icon={ArrowUpCircle}
               iconClass="bg-amber-500/10 border-amber-500/20 text-amber-500"
               label="Mises à jour"
               value={pluginsSwr.isLoading ? "…" : updates}
               loading={pluginsSwr.isLoading}
               tone="text-amber-500"
               hint="Plugins à mettre à jour"
            />
            <MiniStat
               icon={ServerIcon}
               iconClass="bg-[#21759b]/10 border-[#21759b]/20 text-[#21759b]"
               label="WordPress"
               value={
                  infoSwr.isLoading
                     ? "…"
                     : info?.version
                       ? `v${info.version}`
                       : "—"
               }
               loading={infoSwr.isLoading}
               hint={info?.siteurl ? safeHost(info.siteurl) : "Version core"}
            />
         </div>

         {updateList.length > 0 ? (
            <Card>
               <CardHeader>
                  <CardTitle className="text-base text-white">
                     À traiter — extensions
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <ul className="space-y-2">
                     {updateList.map((p) => (
                        <li key={p.name}>
                           <Link
                              href="/wordpress/plugins"
                              className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm hover:bg-muted/50"
                           >
                              <span className="font-medium truncate">
                                 {p.title || p.name}
                              </span>
                              <span className="text-xs text-amber-500 shrink-0">
                                 {p.update_version
                                    ? `v${p.update_version}`
                                    : "Update"}
                              </span>
                           </Link>
                        </li>
                     ))}
                  </ul>
               </CardContent>
            </Card>
         ) : null}

         <div>
            <h3 className="text-base font-semibold text-white mb-3">
               Sites WordPress
            </h3>
            <WordPressSitesTable />
         </div>
      </div>
   );
}
