"use client";

import { useEffect, useState } from "react";
import {
   Card,
   CardHeader,
   CardTitle,
   CardAction,
   CardContent,
} from "@/components/ui/card";
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
   const [sites, setSites] = useState([]);
   const [selectedSiteUrl, setSelectedSiteUrl] = useState("");
   const [stats, setStats] = useState({ content_types: [], disk_used: null });
   const [loading, setLoading] = useState(true);
   const [loadingSites, setLoadingSites] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      wordpressSites()
         .then(setSites)
         .catch(() => setSites([]))
         .finally(() => setLoadingSites(false));
   }, []);

   async function loadStats() {
      setLoading(true);
      setError(null);
      try {
         const opts = selectedSiteUrl ? { url: selectedSiteUrl } : {};
         const data = await wordpressSiteStats(opts);
         setStats(data);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      loadStats();
   }, [selectedSiteUrl]);

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
               <SelectTrigger id="site-stats-filter" className="w-[280px]">
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

         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
               <Card className="col-span-full flex items-center justify-center py-12">
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               </Card>
            ) : (
               <>
                  {stats.disk_used && (
                     <Card className="h-min border-sky-500/30 bg-sky-950/30">
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2">
                              <div className="size-10 p-2 bg-sky-600/20 border border-sky-500/30 rounded-md flex items-center justify-center">
                                 <HardDriveIcon className="size-5 text-sky-400 opacity-90" />
                              </div>
                              <span className="text-base font-medium text-white">
                                 Espace disque
                              </span>
                           </CardTitle>
                           <CardAction>
                              <span className="text-2xl font-bold text-white">
                                 {stats.disk_used}
                              </span>
                           </CardAction>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground text-sm">
                              {selectedSiteUrl
                                 ? "Uploads du site"
                                 : "wp-content du multisite"}
                           </p>
                        </CardContent>
                     </Card>
                  )}
                  {stats.content_types
                     .filter((ct) => (parseInt(ct.count, 10) || 0) >= 1)
                     .map((ct) => (
                        <Card key={ct.name} className="h-min">
                           <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                 <div className="size-10 p-2 bg-[#21759b]/10 border border-[#21759b]/20 rounded-md flex items-center justify-center">
                                    <FileTextIcon className="size-5 text-[#21759b] opacity-90" />
                                 </div>
                                 <span className="text-base font-medium text-white">
                                    {typeDisplayName(ct.name, ct.label)}
                                 </span>
                              </CardTitle>
                              <CardAction>
                                 <span className="text-2xl font-bold">
                                    {parseInt(ct.count, 10) || 0}
                                 </span>
                              </CardAction>
                           </CardHeader>
                           <CardContent>
                              <p className="text-muted-foreground text-sm">
                                 {parseInt(ct.count, 10) || 0}{" "}
                                 {typeDisplayName(
                                    ct.name,
                                    ct.label,
                                 ).toLowerCase()}
                              </p>
                           </CardContent>
                        </Card>
                     ))}
               </>
            )}
         </div>
      </div>
   );
}
