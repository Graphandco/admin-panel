"use client";
import Link from "next/link";
import DockerCard from "@/components/home/DockerCard";
import SitesCard from "@/components/home/SitesCard";
import TailscaleCard from "@/components/home/TailscaleCard";
import PluginsCard from "@/components/wordpress/PluginsCard";

export default function Page() {
   return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <SitesCard />
         <Link href="/docker">
            <DockerCard />
         </Link>
         <TailscaleCard />
         <Link href="/wordpress/plugins">
            <PluginsCard />
         </Link>
      </div>
   );
}
