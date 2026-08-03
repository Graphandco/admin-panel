"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { mutate as globalMutate } from "swr";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { dockerPs } from "@/app/actions/docker";
import { getSystemStorage } from "@/app/actions/system";
import { StatusCards } from "@/components/docker/StatusCards";
import { ContainersTab } from "@/components/docker/ContainersTab";
import { OrphansSection } from "@/components/docker/OrphansSection";
import RefreshButton from "@/components/refresh-button";

export default function DockerPage() {
   const [mounted, setMounted] = useState(false);
   const {
      data: containers = [],
      error,
      isLoading,
      isValidating,
      mutate,
   } = useCachedSWR("docker-ps", () => dockerPs());

   const {
      data: storage,
      mutate: mutateStorage,
   } = useCachedSWR("system-storage", () => getSystemStorage());

   const buildCacheSize = storage?.docker?.buildCache?.sizeFormatted ?? null;

   useAutoRefresh(async () => {
      await mutate();
      globalMutate("docker-orphans");
      mutateStorage();
   });

   async function load() {
      await mutate();
      globalMutate("docker-orphans");
      mutateStorage();
   }

   useEffect(() => {
      setMounted(true);
   }, []);

   const running = containers.filter((c) => c.state === "running").length;
   const stopped = containers.length - running;

   const refreshButton = (
      <RefreshButton onClick={load} loading={isLoading || isValidating} />
   );

   return (
      <>
         {mounted &&
            typeof document !== "undefined" &&
            createPortal(
               refreshButton,
               document.getElementById("docker-refresh-portal"),
            )}
         <StatusCards
            total={containers.length}
            running={running}
            stopped={stopped}
            buildCacheSize={buildCacheSize}
            onBuildCachePruned={() => mutateStorage()}
         />
         <ContainersTab
            containers={containers}
            loading={isLoading}
            error={error?.message || (error ? "Erreur lors du chargement" : null)}
            onRefresh={load}
         />
         <OrphansSection />
      </>
   );
}
