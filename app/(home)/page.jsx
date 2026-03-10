"use client";
import Link from "next/link";
import DockerCard from "@/components/home/DockerCard";
import SitesCard from "@/components/home/SitesCard";
import TailscaleCard from "@/components/home/TailscaleCard";
import VpsStatsHomeCards from "@/components/home/VpsStatsHomeCards";
import PluginsCard from "@/components/wordpress/PluginsCard";

export default function Page() {
   return (
      <div className="grid gap-6">
         {/* Ligne 1 : 3 cartes stats VPS (plus petites) + Sites (taille normale) */}
         <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_2fr]">
            <div>
               <SitesCard />
            </div>
            <div className="flex min-w-0">
               <VpsStatsHomeCards />
            </div>
         </div>

         {/* Ligne 2 : Docker, Tailscale, WordPress */}
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/docker">
               <DockerCard />
            </Link>
            <TailscaleCard />
            <Link href="/wordpress/plugins">
               <PluginsCard />
            </Link>
         </div>
      </div>
   );
}
