"use client";

import { usePathname } from "next/navigation";

export function DockerHeader() {
   const pathname = usePathname();
   const title = pathname?.startsWith("/docker/registry")
      ? "DockerHub Graphandco"
      : "Docker";

   return (
      <header className="flex justify-between items-center mb-4">
         <h1 className="text-2xl font-bold text-white">{title}</h1>
         <div id="docker-refresh-portal" />
      </header>
   );
}
