"use client";

import { usePathname } from "next/navigation";

const TITLES = {
   "/docker/registry": {
      title: "Images",
      subtitle: "Registry, dangling et mises à jour Hub",
   },
   "/docker/stats": { title: "Stats Docker" },
   "/docker/cheatsheet": { title: "Cheatsheet Docker" },
   "/docker/logs": { title: "Logs Docker" },
   "/docker": { title: "Containers" },
};

export function DockerHeader() {
   const pathname = usePathname();
   const entry =
      TITLES[pathname] ||
      (pathname?.startsWith("/docker/registry")
         ? TITLES["/docker/registry"]
         : { title: "Docker" });

   return (
      <header className="flex justify-between items-center mb-4 gap-4">
         <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white">{entry.title}</h1>
            {entry.subtitle ? (
               <p className="text-sm text-muted-foreground mt-0.5">
                  {entry.subtitle}
               </p>
            ) : null}
         </div>
         <div id="docker-refresh-portal" className="shrink-0" />
      </header>
   );
}
