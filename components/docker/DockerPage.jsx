"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { dockerPs } from "@/app/actions/docker";
import { StatusCards } from "@/components/docker/StatusCards";
import { ContainersTab } from "@/components/docker/ContainersTab";
import RefreshButton from "@/components/refresh-button";

export default function DockerPage() {
   const [containers, setContainers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [mounted, setMounted] = useState(false);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const list = await dockerPs();
         setContainers(list);
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
      </>
   );
}
