"use client";

import DockerCard from "@/components/home/DockerCard";
import SitesStatus from "@/components/home/SitesStatus";

export default function Page() {
   return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <SitesStatus />
         <DockerCard />
      </div>
   );
}
