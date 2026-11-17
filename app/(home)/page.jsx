"use client";

import Link from "next/link";
import { mutate as globalMutate } from "swr";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import DockerCard from "@/components/home/DockerCard";
import SitesCard from "@/components/home/SitesCard";
import TailscaleCard from "@/components/home/TailscaleCard";
import SeaweedfsCard from "@/components/home/SeaweedfsCard";
import Fail2banCard, {
   FAIL2BAN_HOME_KEY,
} from "@/components/home/Fail2banCard";
import AlertsCard from "@/components/home/AlertsCard";
import VpsStatsHomeCards from "@/components/home/VpsStatsHomeCards";
import PluginsCard from "@/components/wordpress/PluginsCard";
import RefreshButton from "@/components/refresh-button";
import { getSystemStats } from "@/app/actions/system";
import { AGENCE_SITES_KEY } from "@/components/agence/SitesPage";
import { WORDPRESS_PLUGINS_KEY } from "@/components/wordpress/PluginsCard";
import { SEAWEEDFS_KEY } from "@/components/seaweedfs/SeaweedfsPage";
import { ALERTS_OVERVIEW_KEY } from "@/components/monitoring/AlertsPage";

function formatUptime(seconds) {
   if (!seconds || seconds < 0) return "—";
   const days = Math.floor(seconds / 86400);
   const hours = Math.floor((seconds % 86400) / 3600);
   const mins = Math.floor((seconds % 3600) / 60);
   const parts = [];
   if (days > 0) parts.push(`${days} j`);
   if (hours > 0) parts.push(`${hours} h`);
   parts.push(`${mins} min`);
   return parts.join(" ");
}

export default function Page() {
   const {
      data: stats,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("vps-stats", () => getSystemStats());
   const uptime = stats?.uptime ?? null;

   useAutoRefresh(mutate);

   async function handleRefresh() {
      await Promise.all([
         mutate(),
         globalMutate("docker-ps"),
         globalMutate(AGENCE_SITES_KEY),
         globalMutate("tailscale-info"),
         globalMutate(WORDPRESS_PLUGINS_KEY),
         globalMutate(SEAWEEDFS_KEY),
         globalMutate(FAIL2BAN_HOME_KEY),
         globalMutate(ALERTS_OVERVIEW_KEY),
      ]);
   }

   return (
      <div className="grid gap-6">
         <header className="flex flex-wrap justify-between items-center gap-4">
            <div>
               {uptime != null && (
                  <span className="inline-block px-3 py-1.5 rounded-lg bg-card text-primary border border-primary text-sm font-medium">
                     Uptime : {formatUptime(uptime)}
                  </span>
               )}
            </div>
            <RefreshButton
               onClick={handleRefresh}
               loading={loading || isValidating}
            />
         </header>

         {/* Ligne 1 : RAM / CPU / Disque + Sites */}
         <div className="grid gap-6 grid-cols-1 lg:grid-cols-[3fr_1fr] min-w-0">
            <div className="flex min-w-0">
               <VpsStatsHomeCards />
            </div>
            <div className="min-w-0 max-md:hidden">
               <SitesCard />
            </div>
         </div>

         {/* Mobile */}
         <div className="grid gap-3 md:gap-6 grid-cols-2 md:hidden min-w-0">
            <div className="min-w-0">
               <SitesCard />
            </div>
            <Link href="/docker" className="min-w-0">
               <DockerCard />
            </Link>
            <div className="min-w-0">
               <TailscaleCard />
            </div>
            <Link href="/wordpress/plugins" className="min-w-0">
               <PluginsCard />
            </Link>
            <div className="min-w-0">
               <SeaweedfsCard />
            </div>
            <div className="min-w-0">
               <AlertsCard />
            </div>
            <div className="min-w-0">
               <Fail2banCard />
            </div>
         </div>

         {/* Tablette / desktop */}
         <div className="hidden md:grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <AlertsCard />
            <Link href="/docker">
               <DockerCard />
            </Link>
            <TailscaleCard />
            <Link href="/wordpress/plugins">
               <PluginsCard />
            </Link>
            <SeaweedfsCard />
            <Fail2banCard />
         </div>
      </div>
   );
}
