"use client";
import Link from "next/link";
import DockerCard from "@/components/home/DockerCard";
import SitesCard from "@/components/home/SitesCard";
import TailscaleCard from "@/components/home/TailscaleCard";
import VpsStatsHomeCards from "@/components/home/VpsStatsHomeCards";
import SystemInfoHomeCards from "@/components/home/SystemInfoHomeCards";
import PluginsCard from "@/components/wordpress/PluginsCard";

export default function Page() {
   return (
      <div className="grid gap-6">
         {/* Ligne 1 : RAM / CPU / Disque + Sites */}
         <div className="grid gap-6 grid-cols-1 lg:grid-cols-[3fr_1fr] min-w-0">
            <div className="flex min-w-0">
               <VpsStatsHomeCards />
            </div>
            <div className="min-w-0 max-md:hidden">
               <SitesCard />
            </div>
         </div>

         {/* Mobile uniquement : Sites, Docker, Tailscale, Plugins — 50% */}
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
         </div>

         {/* Tablette / desktop : Docker, Tailscale, Plugins */}
         <div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/docker">
               <DockerCard />
            </Link>
            <TailscaleCard />
            <Link href="/wordpress/plugins">
               <PluginsCard />
            </Link>
         </div>

         {/* OS, Kernel, Processeur */}
         <SystemInfoHomeCards />
      </div>
   );
}
