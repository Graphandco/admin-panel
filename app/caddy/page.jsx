"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { caddyStatus, caddyFileLog, caddyValidate } from "@/app/actions/caddy";
import { dockerContainerRestart, dockerLogs } from "@/app/actions/docker";
import {
   FileCheck,
   Loader2Icon,
   RefreshCwIcon,
   RotateCcwIcon,
} from "lucide-react";
import { prettifyCaddyLogText } from "@/lib/caddy-logs";

function formatPorts(ports) {
   if (!ports?.length) return "—";
   return ports
      .map((p) => {
         if (p.PublicPort)
            return `${p.IP || "0.0.0.0"}:${p.PublicPort}→${p.PrivatePort}/${p.Type || "tcp"}`;
         return `${p.PrivatePort}/${p.Type || "tcp"}`;
      })
      .join(", ");
}

export default function CaddyDashboardPage() {
   const [status, setStatus] = useState(null);
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(true);
   const [restarting, setRestarting] = useState(false);
   const [logSource, setLogSource] = useState("docker");
   const [logText, setLogText] = useState("");
   const [logLoading, setLogLoading] = useState(false);
   const [validating, setValidating] = useState(false);
   const [validateResult, setValidateResult] = useState(null);

   const displayLog = useMemo(() => prettifyCaddyLogText(logText), [logText]);

   const loadStatus = useCallback(async () => {
      setError(null);
      setLoading(true);
      try {
         const s = await caddyStatus();
         setStatus(s);
      } catch (e) {
         setError(e.message);
         setStatus(null);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      loadStatus();
   }, [loadStatus]);

   const loadLogs = useCallback(async () => {
      setLogLoading(true);
      try {
         if (logSource === "docker") {
            const c = status?.container;
            if (!c?.id) {
               setLogText("Conteneur Caddy introuvable.");
               return;
            }
            const t = await dockerLogs(c.id, 150);
            setLogText(t);
         } else {
            const t = await caddyFileLog(logSource, 200);
            setLogText(t);
         }
      } catch (e) {
         setLogText(`Erreur : ${e.message}`);
      } finally {
         setLogLoading(false);
      }
   }, [status?.container, logSource]);

   useEffect(() => {
      if (loading) return;
      loadLogs();
   }, [loading, logSource, status?.container, loadLogs]);

   async function handleValidate() {
      setValidating(true);
      setValidateResult(null);
      setError(null);
      try {
         const r = await caddyValidate();
         setValidateResult(r);
      } catch (e) {
         setValidateResult({ valid: false, output: e.message });
      } finally {
         setValidating(false);
      }
   }

   async function handleRestart() {
      const c = status?.container;
      if (!c?.id) return;
      if (!window.confirm("Redémarrer le conteneur Caddy ?")) return;
      setRestarting(true);
      setError(null);
      try {
         await dockerContainerRestart(c.id);
         await loadStatus();
         setValidateResult(null);
      } catch (e) {
         setError(e.message);
      } finally {
         setRestarting(false);
      }
   }

   if (loading && !status) {
      return (
         <div className="flex items-center justify-center py-20 text-white">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
         </div>
      );
   }

   const c = status?.container;
   const admin = status?.admin;

   return (
      <div className="min-w-0 max-w-full overflow-x-hidden">
         <header className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-white">Caddy — Tableau de bord</h2>
            <div className="flex flex-wrap gap-2">
               <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadStatus()}
                  disabled={loading}
               >
                  {loading ? (
                     <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                     <RefreshCwIcon className="size-4" />
                  )}
                  <span className="ml-1">Rafraîchir</span>
               </Button>
               <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleValidate}
                  disabled={validating}
                  title="caddy validate dans le conteneur (fichier sur disque)"
               >
                  {validating ? (
                     <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                     <FileCheck className="size-4" />
                  )}
                  <span className="ml-1">Valider la config</span>
               </Button>
               <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRestart}
                  disabled={!c?.id || restarting}
               >
                  {restarting ? (
                     <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                     <RotateCcwIcon className="size-4" />
                  )}
                  <span className="ml-1">Redémarrer Caddy</span>
               </Button>
            </div>
         </header>

         {validateResult && (
            <div
               className={`mb-4 rounded-md border p-3 text-sm ${
                  validateResult.valid
                     ? "border-green-500/50 bg-green-500/10 text-green-100"
                     : "border-amber-500/50 bg-amber-500/10 text-amber-100"
               }`}
               role="status"
            >
               <p className="font-medium mb-1">
                  {validateResult.valid ? "Configuration valide" : "Problèmes de configuration"}
               </p>
               {validateResult.output ? (
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all min-w-0 max-w-full overflow-x-hidden text-foreground/90">
                     {validateResult.output}
                  </pre>
               ) : null}
            </div>
         )}

         {error && (
            <p className="text-sm text-destructive mb-4" role="alert">
               {error}
            </p>
         )}

         <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
               <CardHeader className="py-3">
                  <CardTitle className="text-sm">API d&apos;administration</CardTitle>
               </CardHeader>
               <CardContent className="text-sm space-y-1 text-muted-foreground">
                  <p>
                     <span className="text-foreground/80">URL interne :</span>{" "}
                     {status?.caddyAdminUrl || "—"}
                  </p>
                  <p>
                     <span className="text-foreground/80">Statut :</span>{" "}
                     {admin?.ok ? (
                        <span className="text-green-500">joignable</span>
                     ) : (
                        <span className="text-amber-500">indisponible</span>
                     )}
                  </p>
                  {!admin?.ok && admin?.error && (
                     <p className="text-xs break-all">{admin.error}</p>
                  )}
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="py-3">
                  <CardTitle className="text-sm">Conteneur Docker</CardTitle>
               </CardHeader>
               <CardContent className="text-sm space-y-1 text-muted-foreground">
                  {c ? (
                     <>
                        <p>
                           <span className="text-foreground/80">Nom :</span>{" "}
                           {(c.names?.[0] || "—").replace(/^\//, "")}
                        </p>
                        <p>
                           <span className="text-foreground/80">Image :</span>{" "}
                           {c.image}
                        </p>
                        <p>
                           <span className="text-foreground/80">État :</span>{" "}
                           {c.state} — {c.status}
                        </p>
                        <p>
                           <span className="text-foreground/80">Ports :</span>{" "}
                           {formatPorts(c.ports)}
                        </p>
                     </>
                  ) : (
                     <p>
                        Aucun conteneur nommé <code className="text-xs">caddy</code>{" "}
                        trouvé. Vérifiez CADDY_CONTAINER_NAME.
                     </p>
                  )}
               </CardContent>
            </Card>
         </div>

         <Card className="min-w-0 max-w-full overflow-hidden">
            <CardHeader className="flex flex-row flex-wrap items-end justify-between gap-2 py-3 min-w-0">
               <CardTitle className="text-sm">Journaux</CardTitle>
               <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Source</Label>
                  <Select
                     value={logSource}
                     onValueChange={setLogSource}
                  >
                     <SelectTrigger className="w-[200px] h-8 text-xs">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="docker">Conteneur (stdout)</SelectItem>
                        <SelectItem value="access.log">access.log</SelectItem>
                        <SelectItem value="caddy.log">caddy.log (système)</SelectItem>
                     </SelectContent>
                  </Select>
                  <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     onClick={loadLogs}
                     disabled={
                        logLoading ||
                        (logSource === "docker" && !c?.id)
                     }
                  >
                     {logLoading ? (
                        <Loader2Icon className="size-4 animate-spin" />
                     ) : (
                        <RefreshCwIcon className="size-4" />
                     )}
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="min-w-0">
               <div className="max-h-[420px] min-w-0 overflow-y-auto overflow-x-hidden rounded-md border border-border/30 bg-muted/30 p-3">
                  <pre className="text-xs font-mono w-full min-w-0 max-w-full whitespace-pre-wrap break-all text-foreground/90 leading-relaxed">
                     {logLoading ? "Chargement…" : displayLog || "—"}
                  </pre>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
