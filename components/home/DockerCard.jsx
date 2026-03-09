"use client";

import { useEffect, useState } from "react";
import {
   Card,
   CardHeader,
   CardTitle,
   CardAction,
   CardContent,
   CardFooter,
} from "@/components/ui/card";
import { Container, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { dockerPs } from "@/app/actions/docker";
import { cn } from "@/lib/utils";

function getContainerName(names) {
   if (!names?.length) return "-";
   return names[0].replace(/^\//, "");
}

export default function DockerCard() {
   const [containers, setContainers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

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
      load();
   }, []);

   const total = containers.length;
   const running = containers.filter((c) => c.state === "running").length;
   const stopped = total - running;
   const stoppedContainers = containers
      .filter((c) => c.state !== "running")
      .map((c) => getContainerName(c.names));

   if (error) {
      return (
         <Card className="h-full">
            <CardContent className="py-6">
               <div className="text-destructive flex items-center gap-3">
                  <p>{error}</p>
                  <button
                     onClick={load}
                     className="inline-flex items-center gap-1 text-sm underline"
                  >
                     <RefreshCwIcon className="size-4" />
                     Réessayer
                  </button>
               </div>
            </CardContent>
         </Card>
      );
   }

   return (
      <Card className="h-full">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Container
                  size={32}
                  className="text-blue-500 p-2 bg-blue-500/10 border border-blue-500/20 rounded-md mr-2"
               />
               <span className="text-lg font-medium text-white">Docker</span>
            </CardTitle>
            <CardAction>
               {loading ? (
                  <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
               ) : (
                  <span className="text-2xl font-bold">{total}</span>
               )}
            </CardAction>
         </CardHeader>
         <CardContent className="space-y-1">
            <p className="text-muted-foreground text-sm">
               <span className="text-green-600 dark:text-green-400 font-medium">
                  {running}
               </span>{" "}
               actifs ·{" "}
               <span className="text-slate-500 font-medium">{stopped}</span>{" "}
               inactifs
            </p>
         </CardContent>
         {stoppedContainers.length > 0 && (
            <CardFooter
               className={cn(
                  "flex flex-wrap gap-1.5 text-xs text-muted-foreground bg-transparent",
               )}
            >
               <span>Arrêté{stoppedContainers.length > 1 ? "s" : ""} :</span>
               {stoppedContainers.map((name) => (
                  <span
                     key={name}
                     className="bg-muted px-2 py-0.5 rounded font-mono"
                  >
                     {name}
                  </span>
               ))}
            </CardFooter>
         )}
      </Card>
   );
}
