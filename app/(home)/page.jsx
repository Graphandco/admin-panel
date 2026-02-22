"use client";
import Link from "next/link";
import DockerCard from "@/components/home/DockerCard";
import SitesStatus from "@/components/home/SitesStatus";
import PluginsCard from "@/components/wordpress/PluginsCard";

export default function Page() {
   return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <SitesStatus />
         <Link href="/docker">
            <DockerCard />
         </Link>
         <Link href="/wordpress/plugins">
            <PluginsCard />
         </Link>
      </div>
   );
}
