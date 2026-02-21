"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { dockerPs, dockerStats } from "@/app/actions/docker";
import { StatusCards } from "@/components/docker/StatusCards";
import { ContainersTab } from "@/components/docker/ContainersTab";
import { buttonVariants } from "@/components/ui/button";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Page() {
   const [containers, setContainers] = useState([]);
   const [stats, setStats] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [mounted, setMounted] = useState(false);

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const [list, statsList] = await Promise.all([
            dockerPs(),
            dockerStats(),
         ]);
         setContainers(list);
         setStats(statsList);
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
      <button
         onClick={load}
         disabled={loading}
         className={cn(buttonVariants({}))}
      >
         {loading ? (
            <Loader2Icon className="size-4 mr-1 animate-spin" />
         ) : (
            <RefreshCwIcon className="size-4 mr-1" />
         )}
         Actualiser
      </button>
   );

   return (
      <>
         {mounted &&
            typeof document !== "undefined" &&
            createPortal(refreshButton, document.getElementById("docker-refresh-portal"))}
         <StatusCards
            total={containers.length}
            running={running}
            stopped={stopped}
         />
         <ContainersTab
            containers={containers}
            error={error}
            onRefresh={load}
         />
         {stats.length > 0 && (
            <>
               <h2 className="text-xl font-semibold mt-8 mb-2">Stats</h2>
               <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(stats, null, 2)}
               </pre>
            </>
         )}
      </>
   );
}
