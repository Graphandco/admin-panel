"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
   MoreHorizontalIcon,
   Loader2Icon,
   RefreshCwIcon,
   CheckIcon,
   Ban,
   SearchIcon,
   PlayIcon,
   SquareIcon,
   LayersIcon,
   WrenchIcon,
   Trash2Icon,
} from "lucide-react";
import {
   dockerContainerStart,
   dockerContainerStop,
   dockerContainerRemove,
   dockerContainerBuild,
   dockerContainerCompose,
} from "@/app/actions/docker";

function formatCreated(created) {
   if (created == null) return "-";
   const date =
      typeof created === "number"
         ? new Date(created * 1000)
         : new Date(created);
   if (isNaN(date.getTime())) return "-";
   return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });
}

function getContainerName(names) {
   if (!names?.length) return "-";
   return names[0].replace(/^\//, "");
}

/** Parse "Up X seconds/minutes/hours/days/weeks" into seconds. Stopped => Infinity. */
function getUptimeSeconds(status, state) {
   if (state !== "running" || !status) return Infinity;
   const m = String(status).match(
      /^Up\s+(?:(\d+)\s+(second|minute|hour|day|week)s?)?/i,
   );
   if (!m) return 0;
   const val = parseInt(m[1] || "0", 10);
   const unit = (m[2] || "second").toLowerCase();
   const multipliers = {
      second: 1,
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
   };
   return val * (multipliers[unit] || 1);
}

function StatusBadge({ state }) {
   const isRunning = state === "running";
   return (
      <span
         className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            isRunning
               ? "bg-green-500/20 text-green-600 dark:text-green-400"
               : "bg-slate-500/20 text-slate-600 dark:text-slate-400",
         )}
      >
         {isRunning && <CheckIcon className="size-3.5" />}
         {!isRunning && <Ban className="size-3.5" />}
         {isRunning ? "Running" : "Stopped"}
      </span>
   );
}

export function ContainersTab({ containers = [], loading, error, onRefresh }) {
   const [search, setSearch] = useState("");
   const [stateFilter, setStateFilter] = useState("all");
   const [actionId, setActionId] = useState(null);

   async function handleAction(c, action) {
      if (actionId) return;
      const name = getContainerName(c.names);
      setActionId(c.id);
      try {
         if (action === "start") await dockerContainerStart(c.id);
         else if (action === "stop") await dockerContainerStop(c.id);
         else if (action === "compose") await dockerContainerCompose(c.id);
         else if (action === "build") await dockerContainerBuild(c.id);
         else if (action === "remove") {
            if (!confirm(`Supprimer le conteneur ${name} ?`)) {
               setActionId(null);
               return;
            }
            await dockerContainerRemove(c.id);
         }
         onRefresh?.();
      } catch (err) {
         alert(err.message || "Erreur");
      } finally {
         setActionId(null);
      }
   }

   const filteredContainers = containers
      .filter((c) => {
         if (stateFilter === "running") return c.state === "running";
         if (stateFilter === "stopped") return c.state !== "running";
         return true;
      })
      .filter((c) => {
         if (!search.trim()) return true;
         const name = getContainerName(c.names);
         return name.toLowerCase().includes(search.trim().toLowerCase());
      });
   if (error) {
      return (
         <Card className="my-6 p-6">
            <div className="text-destructive flex items-center gap-3">
               <p>{error}</p>
               {onRefresh && (
                  <button
                     onClick={onRefresh}
                     className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                     )}
                  >
                     <RefreshCwIcon className="size-4 mr-1" />
                     Réessayer
                  </button>
               )}
            </div>
         </Card>
      );
   }

   return (
      <div className="my-6">
         <div className="flex justify-between items-center gap-3 mb-4">
            <div className="flex gap-1">
               <button
                  onClick={() => setStateFilter("all")}
                  className={cn(
                     "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                     stateFilter === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
               >
                  Tous
               </button>
               <button
                  onClick={() => setStateFilter("running")}
                  className={cn(
                     "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                     stateFilter === "running"
                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
               >
                  <CheckIcon className="size-3.5" />
                  Actifs
               </button>
               <button
                  onClick={() => setStateFilter("stopped")}
                  className={cn(
                     "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                     stateFilter === "stopped"
                        ? "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
               >
                  <Ban className="size-3.5" />
                  Inactifs
               </button>
            </div>
            <div className="relative w-full max-w-xs">
               <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
               <Input
                  type="search"
                  placeholder="Rechercher par nom..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
               />
            </div>
         </div>
         <Card className="mb-6 p-0 md:p-0">
            <CardContent className="px-0">
               <Table>
                  <TableHeader className="bg-muted text-white">
                     <TableRow>
                        <TableHead>
                           <span className="pl-2">Nom</span>
                        </TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>En ligne depuis</TableHead>
                        <TableHead>Créé le</TableHead>
                        <TableHead className="text-right">
                           <span className="pr-2">Actions</span>
                        </TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow>
                           <TableCell colSpan={6} className="text-center py-8">
                              <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                           </TableCell>
                        </TableRow>
                     ) : filteredContainers.length === 0 ? (
                        <TableRow>
                           <TableCell
                              colSpan={6}
                              className="text-center py-8 text-muted-foreground"
                           >
                              {search.trim()
                                 ? "Aucun conteneur ne correspond"
                                 : stateFilter === "running"
                                   ? "Aucun conteneur actif"
                                   : stateFilter === "stopped"
                                     ? "Aucun conteneur inactif"
                                     : "Aucun conteneur"}
                           </TableCell>
                        </TableRow>
                     ) : (
                        [...filteredContainers]
                           .sort(
                              (a, b) =>
                                 getUptimeSeconds(a.status, a.state) -
                                 getUptimeSeconds(b.status, b.state),
                           )
                           .map((c) => (
                              <TableRow key={c.id}>
                                 <TableCell className="text-sm">
                                    <span className="pl-2">
                                       {getContainerName(c.names)}
                                    </span>
                                 </TableCell>
                                 {/* <TableCell className="font-mono text-xs"><span className="bg-muted relative rounded px-2 py-[0.3rem] font-mono text-xs">{c.image}</span></TableCell>
                    <TableCell> */}
                                 <TableCell className="text-sm">
                                    {c.image}
                                 </TableCell>
                                 <TableCell>
                                    <StatusBadge state={c.state} />
                                 </TableCell>
                                 <TableCell>{c.status || "-"}</TableCell>
                                 <TableCell>
                                    {formatCreated(c.created)}
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <DropdownMenu>
                                       <DropdownMenuTrigger
                                          nativeButton={false}
                                          render={
                                             <div
                                                role="button"
                                                tabIndex={0}
                                                className={cn(
                                                   buttonVariants({
                                                      variant: "ghost",
                                                      size: "icon",
                                                   }),
                                                )}
                                             />
                                          }
                                       >
                                          <MoreHorizontalIcon />
                                          <span className="sr-only">
                                             Open menu
                                          </span>
                                       </DropdownMenuTrigger>
                                       <DropdownMenuContent
                                          className="pr-2"
                                          align="end"
                                       >
                                          <DropdownMenuItem
                                             onClick={() =>
                                                handleAction(c, "start")
                                             }
                                             disabled={
                                                c.state === "running" ||
                                                actionId === c.id
                                             }
                                          >
                                             <PlayIcon className="size-4" />
                                             Démarrer
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                             onClick={() =>
                                                handleAction(c, "stop")
                                             }
                                             disabled={
                                                c.state !== "running" ||
                                                actionId === c.id
                                             }
                                          >
                                             <SquareIcon className="size-4" />
                                             Arrêter
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                             onClick={() =>
                                                handleAction(c, "compose")
                                             }
                                             disabled={
                                                c.state === "running" ||
                                                actionId === c.id
                                             }
                                          >
                                             <LayersIcon className="size-4" />
                                             Compose
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                             onClick={() =>
                                                handleAction(c, "build")
                                             }
                                             disabled={actionId === c.id}
                                          >
                                             <WrenchIcon className="size-4" />
                                             Build
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                             variant="destructive"
                                             onClick={() =>
                                                handleAction(c, "remove")
                                             }
                                             disabled={actionId === c.id}
                                          >
                                             <Trash2Icon className="size-4" />
                                             Supprimer
                                          </DropdownMenuItem>
                                       </DropdownMenuContent>
                                    </DropdownMenu>
                                 </TableCell>
                              </TableRow>
                           ))
                     )}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>
      </div>
   );
}
