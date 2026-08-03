"use client";

import { useState } from "react";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card } from "@/components/ui/card";
import { StatusCard } from "@/components/ui/status-card";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
} from "@/components/ui/select";
import {
   Loader2Icon,
   RefreshCwIcon,
   FileTextIcon,
   HardDriveIcon,
} from "lucide-react";
import { wordpressSites, wordpressSiteStats } from "@/app/actions/wordpress";
import SiteInfos from "@/components/wordpress/SiteInfos";
import { WORDPRESS_SITES_KEY } from "@/components/wordpress/SitesRecapCard";

const TYPE_LABELS = {
   post: "Articles",
   page: "Pages",
   product: "Produits",
   attachment: "Médias",
};

function typeDisplayName(name, label) {
   return TYPE_LABELS[name] || label || name;
}

export default function SitesCards() {
   const [selectedSiteUrl, setSelectedSiteUrl] = useState("");

   const { data: sites = [], isLoading: loadingSites } = useCachedSWR(
      WORDPRESS_SITES_KEY,
      () => wordpressSites(),
   );

   const {
      data: stats = { content_types: [], disk_used: null },
      error: fetchError,
      isLoading: loading,
      mutate: mutateStats,
   } = useCachedSWR(["wordpress-site-stats", selectedSiteUrl], () => {
      const opts = selectedSiteUrl ? { url: selectedSiteUrl } : {};
      return wordpressSiteStats(opts);
   });
   const error = fetchError?.message || null;

   async function loadStats() {
      await mutateStats();
   }

   if (error) {
      return (
         <Card className="my-6 p-6">
            <div className="text-destructive flex items-center gap-3">
               <p>{error}</p>
               <button
                  onClick={loadStats}
                  className="inline-flex items-center gap-1 text-sm underline"
               >
                  <RefreshCwIcon className="size-4" />
                  Réessayer
               </button>
            </div>
         </Card>
      );
   }

   const sortedSites = [...sites].sort((a, b) =>
      (a.site_name || a.url).localeCompare(b.site_name || b.url),
   );

   return (
      <div className="my-6 space-y-6">
         <div className="flex flex-wrap items-center gap-4">
            <label
               htmlFor="site-stats-filter"
               className="text-sm text-muted-foreground"
            >
               Filtrer par site
            </label>
            <Select
               value={selectedSiteUrl}
               onValueChange={(v) => setSelectedSiteUrl(v ?? "")}
               disabled={loadingSites}
            >
               <SelectTrigger id="site-stats-filter" className="w-70">
                  {selectedSiteUrl ? (
                     sites.find((s) => s.url === selectedSiteUrl)?.site_name ||
                     selectedSiteUrl
                  ) : (
                     <span className="text-muted-foreground">
                        Tous les sites
                     </span>
                  )}
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="">Tous les sites</SelectItem>
                  {sortedSites.map((site) => (
                     <SelectItem
                        key={site.blog_id ?? site.url}
                        value={site.url}
                     >
                        {site.site_name || site.url}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>

         <SiteInfos selectedSiteUrl={selectedSiteUrl} />

         <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
               <Card className="col-span-full flex items-center justify-center py-12">
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               </Card>
            ) : (
               <>
                  {stats.disk_used && (
                     <StatusCard
                        Icon={HardDriveIcon}
                        color="sky"
                        label={
                           selectedSiteUrl
                              ? "Uploads du site"
                              : "wp-content du multisite"
                        }
                        value={stats.disk_used}
                     />
                  )}
                  {stats.content_types
                     .filter((ct) => (parseInt(ct.count, 10) || 0) >= 1)
                     .map((ct) => (
                        <StatusCard
                           key={ct.name}
                           Icon={FileTextIcon}
                           color="white"
                           label={typeDisplayName(ct.name, ct.label)}
                           value={parseInt(ct.count, 10) || 0}
                        />
                     ))}
               </>
            )}
         </div>
      </div>
   );
}
