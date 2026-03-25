"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { dockerPs, dockerLogs } from "@/app/actions/docker";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";

function getContainerName(names) {
   if (!names?.length) return "-";
   return names[0].replace(/^\//, "");
}

export default function DockerLogsPage() {
   const [containers, setContainers] = useState([]);
   const [selectedId, setSelectedId] = useState("");
   const [logs, setLogs] = useState("");
   const [loading, setLoading] = useState(true);
   const [loadingLogs, setLoadingLogs] = useState(false);
   const [error, setError] = useState(null);
   const [live, setLive] = useState(false);
   const pollRef = useRef(null);

   const selectedContainer = containers.find((c) => c.id === selectedId);
   const selectedLabel = selectedContainer
      ? `${getContainerName(selectedContainer.names)} (${selectedContainer.state})`
      : null;

   async function loadContainers() {
      setLoading(true);
      setError(null);
      try {
         const list = await dockerPs();
         setContainers(list);
         if (!selectedId && list.length > 0) {
            setSelectedId(list[0].id);
         }
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
      } finally {
         setLoading(false);
      }
   }

   async function loadLogs() {
      if (!selectedId) {
         setLogs("");
         return;
      }
      setLoadingLogs(true);
      try {
         const data = await dockerLogs(selectedId, 100);
         setLogs(data);
      } catch (err) {
         setLogs(`Erreur: ${err.message}`);
      } finally {
         setLoadingLogs(false);
      }
   }

   useEffect(() => {
      loadContainers();
   }, []);

   useEffect(() => {
      loadLogs();
   }, [selectedId]);

   useEffect(() => {
      if (!live || !selectedId) {
         if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
         }
         return;
      }
      const tick = () => loadLogs();
      tick();
      const interval = setInterval(tick, 2000);
      pollRef.current = interval;
      return () => {
         clearInterval(interval);
         pollRef.current = null;
      };
   }, [live, selectedId]);

   return (
      <div>
         <header className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Logs</h2>
         </header>

         {error ? (
            <Card>
               <CardContent className="py-6">
                  <div className="text-destructive flex items-center gap-3">
                     <p>{error}</p>
                     <button
                        onClick={loadContainers}
                        className="inline-flex items-center gap-1 text-sm underline"
                     >
                        <RefreshCwIcon className="size-4" />
                        Réessayer
                     </button>
                  </div>
               </CardContent>
            </Card>
         ) : (
            <Card>
               <CardContent className="pt-6 space-y-4">
                  <div className="flex flex-wrap items-end gap-4">
                     <div className="space-y-2 min-w-[200px]">
                        <Label htmlFor="container">Conteneur</Label>
                        <Select
                           value={selectedId}
                           onValueChange={setSelectedId}
                           disabled={loading}
                        >
                           <SelectTrigger id="container">
                              <SelectValue placeholder="Sélectionner un conteneur">
                                 {selectedLabel}
                              </SelectValue>
                           </SelectTrigger>
                           <SelectContent>
                              {containers.map((c) => (
                                 <SelectItem key={c.id} value={c.id}>
                                    {getContainerName(c.names)} ({c.state})
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="flex items-center gap-2">
                        <Switch
                           id="live"
                           checked={live}
                           onCheckedChange={setLive}
                           disabled={!selectedId || loadingLogs}
                        />
                        <Label
                           htmlFor="live"
                           className="cursor-pointer text-sm"
                        >
                           Temps réel
                        </Label>
                     </div>
                     {live && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                           <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                           Mise à jour toutes les 2 s
                        </span>
                     )}
                  </div>

                  {selectedId && (
                     <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto max-h-[60vh] overflow-y-auto">
                        {loadingLogs && !logs ? (
                           <div className="flex items-center justify-center py-8 text-muted-foreground">
                              <Loader2Icon className="size-6 animate-spin" />
                           </div>
                        ) : (
                           <pre className="whitespace-pre-wrap wrap-break-word text-foreground">
                              {logs || "Aucun log"}
                           </pre>
                        )}
                     </div>
                  )}
               </CardContent>
            </Card>
         )}
      </div>
   );
}
