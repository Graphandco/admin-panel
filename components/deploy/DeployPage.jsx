"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
   getDeployProjects,
   runDeploy,
   getDeployStatus,
   getDeployRuns,
} from "@/app/actions/deploy";
import {
   Loader2Icon,
   RocketIcon,
   CheckCircle2Icon,
   XCircleIcon,
   ClockIcon,
   ChevronDownIcon,
   ChevronUpIcon,
   ExternalLinkIcon,
} from "lucide-react";

const POLL_INTERVAL = 2000;

function formatDate(iso) {
   if (!iso) return "—";
   try {
      const d = new Date(iso);
      return d.toLocaleString("fr-FR", {
         dateStyle: "short",
         timeStyle: "medium",
      });
   } catch {
      return iso;
   }
}

function statusLabel(status, conclusion) {
   if (status === "in_progress" || status === "queued") return "En cours";
   if (conclusion === "success") return "Succès";
   if (conclusion === "failure") return "Échec";
   if (conclusion === "cancelled") return "Annulé";
   return conclusion || status || "—";
}

function statusColor(conclusion) {
   if (conclusion === "success") return "text-green-500";
   if (conclusion === "failure") return "text-destructive";
   return "text-muted-foreground";
}

function DeployCard({ project, status, runs, onDeploy, loading }) {
   const s = status?.[project.id] || { status: "idle" };
   const isRunning = s.status === "running";
   const isSuccess = s.status === "success";
   const isError = s.status === "error";
   const projectRuns = runs?.[project.id] || [];

   const [outputOpen, setOutputOpen] = useState(false);
   const [runsOpen, setRunsOpen] = useState(false);
   const prevRunning = useRef(false);

   useEffect(() => {
      if (isRunning) {
         setOutputOpen(true);
      } else if (prevRunning.current) {
         setOutputOpen(false);
      }
      prevRunning.current = isRunning;
   }, [isRunning]);

   const showOutput = isRunning || outputOpen;

   return (
      <Card>
         <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium text-white">
               {project.label}
            </CardTitle>
            <div className="flex items-center gap-2">
               {isRunning && (
                  <span className="flex items-center gap-1 text-sm text-amber-400">
                     <Loader2Icon className="size-4 animate-spin" />
                     En cours
                  </span>
               )}
               {isSuccess && (
                  <span className="flex items-center gap-1 text-sm text-green-500">
                     <CheckCircle2Icon className="size-4" />
                     Succès
                  </span>
               )}
               {isError && (
                  <span className="flex items-center gap-1 text-sm text-destructive">
                     <XCircleIcon className="size-4" />
                     Erreur
                  </span>
               )}
               <Button
                  size="sm"
                  onClick={() => onDeploy(project.id)}
                  disabled={isRunning || loading}
               >
                  {loading ? (
                     <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                     <RocketIcon className="size-4" />
                  )}
                  <span className="ml-1">Déployer</span>
               </Button>
            </div>
         </CardHeader>
         <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">{project.path}</p>
            {s.finishedAt && (
               <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ClockIcon className="size-3" />
                  {formatDate(s.startedAt)} → {formatDate(s.finishedAt)}
               </p>
            )}
            {s.error && <p className="text-sm text-destructive">{s.error}</p>}

            {s.output && (
               <Collapsible
                  open={showOutput}
                  onOpenChange={(open) => {
                     if (!isRunning) setOutputOpen(open);
                  }}
               >
                  <CollapsibleTrigger
                     className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                     disabled={isRunning}
                  >
                     {showOutput ? (
                        <>
                           <ChevronUpIcon className="size-3" />
                           Masquer le log
                        </>
                     ) : (
                        <>
                           <ChevronDownIcon className="size-3" />
                           Voir le log
                        </>
                     )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                     <pre className="text-xs bg-muted/50 rounded p-3 max-h-40 overflow-auto whitespace-pre-wrap mt-2">
                        {s.output}
                     </pre>
                  </CollapsibleContent>
               </Collapsible>
            )}

            {projectRuns.length > 0 && (
               <Collapsible open={runsOpen} onOpenChange={setRunsOpen}>
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-left">
                     {runsOpen ? (
                        <ChevronUpIcon className="size-3 shrink-0" />
                     ) : (
                        <ChevronDownIcon className="size-3 shrink-0" />
                     )}
                     Derniers déploiements GitHub ({projectRuns.length})
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                     <ul className="space-y-1.5 mt-2">
                        {projectRuns.slice(0, 5).map((run) => (
                           <li
                              key={run.id}
                              className="flex items-center justify-between gap-2 text-xs"
                           >
                              <span className={statusColor(run.conclusion)}>
                                 {statusLabel(run.status, run.conclusion)}
                              </span>
                              <span className="text-muted-foreground truncate">
                                 {formatDate(run.createdAt)}
                              </span>
                              {run.htmlUrl && (
                                 <a
                                    href={run.htmlUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 text-muted-foreground hover:text-foreground"
                                    title="Voir sur GitHub"
                                 >
                                    <ExternalLinkIcon className="size-3" />
                                 </a>
                              )}
                           </li>
                        ))}
                     </ul>
                  </CollapsibleContent>
               </Collapsible>
            )}
         </CardContent>
      </Card>
   );
}

export default function DeployPage() {
   const [projects, setProjects] = useState([]);
   const [statusByProject, setStatusByProject] = useState({});
   const [runsByProject, setRunsByProject] = useState({});
   const [loading, setLoading] = useState(false);
   const [deploying, setDeploying] = useState(null);

   const fetchProjects = useCallback(async () => {
      try {
         const list = await getDeployProjects();
         setProjects(list);
      } catch (err) {
         console.error(err);
      }
   }, []);

   const fetchStatus = useCallback(async (projectId) => {
      try {
         const s = await getDeployStatus(projectId);
         setStatusByProject((prev) => ({ ...prev, [projectId]: s }));
      } catch (err) {
         console.error(err);
      }
   }, []);

   const fetchRuns = useCallback(async (projectId) => {
      try {
         const runs = await getDeployRuns(projectId);
         setRunsByProject((prev) => ({ ...prev, [projectId]: runs }));
      } catch (err) {
         console.error(err);
      }
   }, []);

   const fetchAllStatuses = useCallback(async () => {
      for (const p of projects) {
         await fetchStatus(p.id);
      }
   }, [projects, fetchStatus]);

   const fetchAllRuns = useCallback(async () => {
      for (const p of projects) {
         await fetchRuns(p.id);
      }
   }, [projects, fetchRuns]);

   useEffect(() => {
      fetchProjects();
   }, [fetchProjects]);

   useEffect(() => {
      if (projects.length === 0) return;
      fetchAllStatuses();
      fetchAllRuns();
   }, [projects, fetchAllStatuses, fetchAllRuns]);

   useEffect(() => {
      const running = projects.some(
         (p) => statusByProject[p.id]?.status === "running",
      );
      if (!running) return;
      const t = setInterval(fetchAllStatuses, POLL_INTERVAL);
      return () => clearInterval(t);
   }, [projects, statusByProject, fetchAllStatuses]);

   const handleDeploy = async (projectId) => {
      setDeploying(projectId);
      try {
         await runDeploy(projectId);
         await fetchStatus(projectId);
         await fetchRuns(projectId);
      } catch (err) {
         console.error(err);
         setStatusByProject((prev) => ({
            ...prev,
            [projectId]: {
               status: "error",
               error: err.message,
            },
         }));
      } finally {
         setDeploying(null);
      }
   };

   return (
      <div className="space-y-6">
         <div>
            <p className="text-sm text-muted-foreground">
               Lance les scripts deploy.sh (GitHub Actions + docker compose)
               pour chaque projet.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.length === 0 && !loading && (
               <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                     Aucun projet configuré. Vérifiez deploy-projects.json.
                  </CardContent>
               </Card>
            )}
            {projects.map((project) => (
               <DeployCard
                  key={project.id}
                  project={project}
                  status={statusByProject}
                  runs={runsByProject}
                  onDeploy={handleDeploy}
                  loading={deploying === project.id}
               />
            ))}
         </div>
      </div>
   );
}
