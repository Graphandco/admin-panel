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
      <header className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
         <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-white">{entry.title}</h1>
            {entry.subtitle ? (
               <p className="text-sm text-muted-foreground mt-0.5">
                  {entry.subtitle}
               </p>
            ) : null}
         </div>
         <div
            id="docker-refresh-portal"
            className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:shrink-0"
         />
      </header>
   );
}
