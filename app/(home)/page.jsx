"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import DockerCard from "@/components/home/DockerCard";
import SitesCard from "@/components/home/SitesCard";
import TailscaleCard from "@/components/home/TailscaleCard";
import VpsStatsHomeCards from "@/components/home/VpsStatsHomeCards";
import SystemInfoHomeCards from "@/components/home/SystemInfoHomeCards";
import PluginsCard from "@/components/wordpress/PluginsCard";
import RefreshButton from "@/components/refresh-button";
import { getSystemStats } from "@/app/actions/system";

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
   const [uptime, setUptime] = useState(null);
   const [loading, setLoading] = useState(true);
   const [refreshKey, setRefreshKey] = useState(0);

   const loadUptime = useCallback(async () => {
      setLoading(true);
      try {
         const data = await getSystemStats();
         setUptime(data?.uptime ?? null);
      } catch {
         setUptime(null);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      loadUptime();
   }, [loadUptime, refreshKey]);

   function handleRefresh() {
      setRefreshKey((k) => k + 1);
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
            <RefreshButton onClick={handleRefresh} loading={loading} />
         </header>

         {/* Ligne 1 : RAM / CPU / Disque + Sites */}
         <div className="grid gap-6 grid-cols-1 lg:grid-cols-[3fr_1fr] min-w-0">
            <div className="flex min-w-0">
               <VpsStatsHomeCards key={`vps-${refreshKey}`} />
            </div>
            <div className="min-w-0 max-md:hidden">
               <SitesCard key={`sites-${refreshKey}`} />
            </div>
         </div>

         {/* Mobile uniquement : Sites, Docker, Tailscale, Plugins — 50% */}
         <div className="grid gap-3 md:gap-6 grid-cols-2 md:hidden min-w-0">
            <div className="min-w-0">
               <SitesCard key={`sites-m-${refreshKey}`} />
            </div>
            <Link href="/docker" className="min-w-0">
               <DockerCard key={`docker-m-${refreshKey}`} />
            </Link>
            <div className="min-w-0">
               <TailscaleCard key={`ts-m-${refreshKey}`} />
            </div>
            <Link href="/wordpress/plugins" className="min-w-0">
               <PluginsCard key={`plugins-m-${refreshKey}`} />
            </Link>
         </div>

         {/* Tablette / desktop : Docker, Tailscale, Plugins */}
         <div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/docker">
               <DockerCard key={`docker-${refreshKey}`} />
            </Link>
            <TailscaleCard key={`ts-${refreshKey}`} />
            <Link href="/wordpress/plugins">
               <PluginsCard key={`plugins-${refreshKey}`} />
            </Link>
         </div>

         {/* OS, Kernel, Processeur */}
         <SystemInfoHomeCards key={`sys-${refreshKey}`} />
      </div>
   );
}
