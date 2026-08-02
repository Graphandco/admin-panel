"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { dockerPs } from "@/app/actions/docker";
import { StatusCards } from "@/components/docker/StatusCards";
import { ContainersTab } from "@/components/docker/ContainersTab";
import { OrphansSection } from "@/components/docker/OrphansSection";
import { PruneBuildCacheButton } from "@/components/docker/PruneBuildCacheButton";
import RefreshButton from "@/components/refresh-button";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";

export default function DockerPage() {
   const [containers, setContainers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [mounted, setMounted] = useState(false);
   const [refreshKey, setRefreshKey] = useState(0);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const list = await dockerPs();
         setContainers(list);
         setRefreshKey((k) => k + 1);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      setMounted(true);
      load();
   }, []);

   const running = containers.filter((c) => c.state === "running").length;
   const stopped = containers.length - running;

   const refreshButton = (
      <RefreshButton onClick={load} loading={loading} />
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
         />
         <ContainersTab
            containers={containers}
            loading={loading}
            error={error}
            onRefresh={load}
         />
         <Card className="mt-8 mb-0">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-2">
               <div>
                  <CardTitle className="text-base text-white">
                     Nettoyage
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                     Vide le cache de build Docker (sans toucher aux conteneurs)
                  </p>
               </div>
               <PruneBuildCacheButton />
            </CardHeader>
            <CardContent className="pt-0 pb-4">
               <p className="text-sm text-muted-foreground">
                  Équivalent de{" "}
                  <code className="text-xs">docker buildx prune -af</code>. Les
                  prochains builds seront plus lents.
               </p>
            </CardContent>
         </Card>
         <OrphansSection refreshKey={refreshKey} />
      </>
   );
}
