"use client";
import RefreshButton from "@/components/refresh-button";
import { useState } from "react";

import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
   getFail2banStatus,
   getSshStatus,
   unbanAllFail2ban,
   unbanFail2banIp,
} from "@/app/actions/security";
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react";

function formatDate(iso) {
   if (!iso) return "—";
   try {
      return new Date(iso).toLocaleString("fr-FR", {
         dateStyle: "short",
         timeStyle: "medium",
      });
   } catch {
      return iso;
   }
}

function StatusIcon({ ok }) {
   return ok ? (
      <CheckCircle2Icon className="size-4 text-green-500 shrink-0" />
   ) : (
      <XCircleIcon className="size-4 text-amber-500 shrink-0" />
   );
}

export default function Fail2banPage() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("vps-fail2ban", async () => {
      let sshErrorMessage = null;
      const [f2b, sshRes] = await Promise.all([
         getFail2banStatus(),
         getSshStatus().catch((err) => {
            sshErrorMessage = err.message || "Erreur SSH";
            return null;
         }),
      ]);
      return { ...f2b, ssh: sshRes, sshErrorMessage };
   });
   const error = fetchError?.message || null;
   const sshError = data?.sshErrorMessage || null;
   const ssh = data?.ssh || null;

   const [unbanTarget, setUnbanTarget] = useState(null);
   const [unbanBusy, setUnbanBusy] = useState(false);
   const [unbanError, setUnbanError] = useState(null);

   async function load() {
      await mutate();
   }

   async function confirmUnban() {
      if (!unbanTarget) return;
      setUnbanBusy(true);
      setUnbanError(null);
      try {
         const res =
            unbanTarget.type === "all"
               ? await unbanAllFail2ban()
               : await unbanFail2banIp({
                    jail: unbanTarget.jail,
                    ip: unbanTarget.ip,
                 });
         if (!res.success) {
            setUnbanError(res.error || "Échec unban");
            return;
         }
         setUnbanTarget(null);
         await mutate();
      } finally {
         setUnbanBusy(false);
      }
   }

   const activeBans = data?.activeBans || [];

   return (
      <div>
         <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
               <h1 className="text-2xl font-bold text-white">Fail2Ban</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Jails, bans actifs et durcissement SSH — unban possible
               </p>
            </div>
            <RefreshButton onClick={load} loading={loading || isValidating} />
         </header>

         {error && (
            <Card className="mb-4">
               <CardContent className="py-4 text-destructive">
                  {error}
               </CardContent>
            </Card>
         )}

         {unbanError && (
            <Card className="mb-4">
               <CardContent className="py-3 text-sm text-destructive">
                  {unbanError}
               </CardContent>
            </Card>
         )}

         {loading && !data ? (
            <Card>
               <CardContent className="flex items-center justify-center py-16">
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               </CardContent>
            </Card>
         ) : data ? (
            <div className="space-y-6">
               <div className="grid gap-3 grid-cols-3">
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Service
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <Badge
                           variant={data.running ? "default" : "destructive"}
                        >
                           {data.running ? "Actif" : "Inactif"}
                        </Badge>
                        {!data.installed && (
                           <p className="text-xs text-muted-foreground mt-2">
                              Fail2Ban non détecté
                           </p>
                        )}
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Jails
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-2xl font-semibold text-white tabular-nums">
                           {data.jailCount}
                        </p>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Bans actifs
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-2xl font-semibold text-white tabular-nums">
                           {data.activeBanCount}
                        </p>
                     </CardContent>
                  </Card>
               </div>

               {data.dbError && (
                  <Card>
                     <CardContent className="py-3 text-sm text-amber-500">
                        Base SQLite : {data.dbError}
                     </CardContent>
                  </Card>
               )}

               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">Jails</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-border/60 text-left text-muted-foreground">
                              <th className="py-2 pr-3 font-medium">Nom</th>
                              <th className="py-2 pr-3 font-medium">État</th>
                              <th className="py-2 pr-3 font-medium">Port</th>
                              <th className="py-2 pr-3 font-medium">
                                 Max retry
                              </th>
                              <th className="py-2 pr-3 font-medium">Ban</th>
                              <th className="py-2 pr-3 font-medium">
                                 Bans actifs
                              </th>
                              <th className="py-2 font-medium">Log</th>
                           </tr>
                        </thead>
                        <tbody>
                           {(data.jails || []).map((j) => (
                              <tr
                                 key={j.name}
                                 className="border-b border-border/40"
                              >
                                 <td className="py-2.5 pr-3 font-medium text-white">
                                    {j.name}
                                 </td>
                                 <td className="py-2.5 pr-3">
                                    <Badge
                                       variant={
                                          j.enabled ? "default" : "outline"
                                       }
                                    >
                                       {j.enabled ? "enabled" : "disabled"}
                                    </Badge>
                                 </td>
                                 <td className="py-2.5 pr-3 tabular-nums">
                                    {j.port || "—"}
                                 </td>
                                 <td className="py-2.5 pr-3 tabular-nums">
                                    {j.maxretry ?? "—"}
                                 </td>
                                 <td className="py-2.5 pr-3">
                                    {j.bantime || "—"}
                                 </td>
                                 <td className="py-2.5 pr-3 tabular-nums">
                                    {j.bannedCount}
                                 </td>
                                 <td
                                    className="py-2.5 text-muted-foreground truncate max-w-55"
                                    title={j.logpath || undefined}
                                 >
                                    {j.logpath || "—"}
                                 </td>
                              </tr>
                           ))}
                           {(data.jails || []).length === 0 && (
                              <tr>
                                 <td
                                    colSpan={7}
                                    className="py-6 text-center text-muted-foreground"
                                 >
                                    Aucune jail détectée
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
                     <CardTitle className="text-base">
                        IPs actuellement bannies
                     </CardTitle>
                     {activeBans.length > 0 && (
                        <Button
                           type="button"
                           variant="destructive"
                           size="sm"
                           disabled={unbanBusy}
                           onClick={() =>
                              setUnbanTarget({
                                 type: "all",
                                 count: activeBans.length,
                              })
                           }
                        >
                           Tout unban
                        </Button>
                     )}
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-border/60 text-left text-muted-foreground">
                              <th className="py-2 pr-3 font-medium">IP</th>
                              <th className="py-2 pr-3 font-medium">Jail</th>
                              <th className="py-2 pr-3 font-medium">Depuis</th>
                              <th className="py-2 pr-3 font-medium">Durée</th>
                              <th className="py-2 pr-3 font-medium">Expire</th>
                              <th className="py-2 font-medium text-right">
                                 Action
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {activeBans.map((b) => (
                              <tr
                                 key={`${b.jail}-${b.ip}-${b.timeofban}`}
                                 className="border-b border-border/40"
                              >
                                 <td className="py-2.5 pr-3 font-mono text-white">
                                    {b.ip}
                                 </td>
                                 <td className="py-2.5 pr-3">{b.jail}</td>
                                 <td className="py-2.5 pr-3 whitespace-nowrap">
                                    {formatDate(b.timeofbanIso)}
                                 </td>
                                 <td className="py-2.5 pr-3">
                                    {b.bantimeLabel}
                                 </td>
                                 <td className="py-2.5 pr-3 whitespace-nowrap">
                                    {b.expiresIso
                                       ? formatDate(b.expiresIso)
                                       : "—"}
                                 </td>
                                 <td className="py-2.5 text-right">
                                    <Button
                                       type="button"
                                       variant="destructive"
                                       size="sm"
                                       disabled={unbanBusy}
                                       onClick={() =>
                                          setUnbanTarget({
                                             type: "one",
                                             jail: b.jail,
                                             ip: b.ip,
                                          })
                                       }
                                    >
                                       Unban
                                    </Button>
                                 </td>
                              </tr>
                           ))}
                           {activeBans.length === 0 && (
                              <tr>
                                 <td
                                    colSpan={6}
                                    className="py-6 text-center text-muted-foreground"
                                 >
                                    Aucun ban actif
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </CardContent>
               </Card>

               {/* SSH hardening */}
               <div className="pt-2">
                  <h2 className="text-lg font-semibold text-white mb-1">SSH</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                     Lecture seule — port, authentification et clés autorisées
                  </p>

                  {sshError && (
                     <Card className="mb-4">
                        <CardContent className="py-3 text-sm text-amber-500">
                           {sshError}
                        </CardContent>
                     </Card>
                  )}

                  {ssh && (
                     <div className="space-y-4">
                        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                           <Card>
                              <CardHeader className="pb-2">
                                 <CardTitle className="text-sm text-muted-foreground">
                                    Service
                                 </CardTitle>
                              </CardHeader>
                              <CardContent>
                                 <Badge
                                    variant={
                                       ssh.running ? "default" : "destructive"
                                    }
                                 >
                                    {ssh.running
                                       ? "sshd actif"
                                       : "sshd inactif"}
                                 </Badge>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardHeader className="pb-2">
                                 <CardTitle className="text-sm text-muted-foreground">
                                    Port
                                 </CardTitle>
                              </CardHeader>
                              <CardContent>
                                 <p className="text-2xl font-semibold text-white tabular-nums">
                                    {ssh.port}
                                 </p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardHeader className="pb-2">
                                 <CardTitle className="text-sm text-muted-foreground">
                                    Password auth
                                 </CardTitle>
                              </CardHeader>
                              <CardContent>
                                 <Badge
                                    variant={
                                       ssh.passwordAuthentication
                                          ? "destructive"
                                          : "default"
                                    }
                                 >
                                    {ssh.passwordAuthentication
                                       ? "Activée"
                                       : "Désactivée"}
                                 </Badge>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardHeader className="pb-2">
                                 <CardTitle className="text-sm text-muted-foreground">
                                    Score
                                 </CardTitle>
                              </CardHeader>
                              <CardContent>
                                 <p className="text-2xl font-semibold text-white tabular-nums">
                                    {ssh.score?.ok ?? 0}
                                    <span className="text-muted-foreground text-base font-normal">
                                       /{ssh.score?.total ?? 0}
                                    </span>
                                 </p>
                              </CardContent>
                           </Card>
                        </div>

                        <Card>
                           <CardHeader>
                              <CardTitle className="text-base">
                                 Posture
                              </CardTitle>
                           </CardHeader>
                           <CardContent>
                              <ul className="space-y-2.5">
                                 {(ssh.checks || []).map((c) => (
                                    <li
                                       key={c.id}
                                       className="flex items-start gap-2 text-sm"
                                    >
                                       <StatusIcon ok={c.ok} />
                                       <div>
                                          <p
                                             className={
                                                c.ok
                                                   ? "text-white"
                                                   : "text-amber-200"
                                             }
                                          >
                                             {c.label}
                                          </p>
                                          <p className="text-xs text-muted-foreground font-mono">
                                             {c.detail}
                                          </p>
                                       </div>
                                    </li>
                                 ))}
                              </ul>
                              <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                                 <p>
                                    PermitRootLogin :{" "}
                                    <span className="text-white font-mono">
                                       {ssh.permitRootLogin || "défaut"}
                                    </span>
                                 </p>
                                 <p>
                                    PubkeyAuthentication :{" "}
                                    <span className="text-white font-mono">
                                       {ssh.pubkeyAuthentication ? "yes" : "no"}
                                    </span>
                                 </p>
                                 {ssh.maxAuthTries != null && (
                                    <p>
                                       MaxAuthTries :{" "}
                                       <span className="text-white font-mono">
                                          {ssh.maxAuthTries}
                                       </span>
                                    </p>
                                 )}
                                 {ssh.allowUsers && (
                                    <p>
                                       AllowUsers :{" "}
                                       <span className="text-white font-mono">
                                          {ssh.allowUsers}
                                       </span>
                                    </p>
                                 )}
                              </div>
                           </CardContent>
                        </Card>

                        <Card>
                           <CardHeader>
                              <CardTitle className="text-base">
                                 Clés autorisées
                              </CardTitle>
                           </CardHeader>
                           <CardContent className="space-y-4">
                              {(ssh.authorizedKeys || []).length === 0 ? (
                                 <p className="text-sm text-muted-foreground">
                                    Aucun fichier authorized_keys lisible
                                 </p>
                              ) : (
                                 (ssh.authorizedKeys || []).map((u) => (
                                    <div key={u.user}>
                                       <div className="flex flex-wrap items-center gap-2 mb-2">
                                          <span className="font-medium text-white">
                                             {u.user}
                                          </span>
                                          <Badge variant="outline">
                                             {u.keyCount} clé
                                             {u.keyCount > 1 ? "s" : ""}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground font-mono truncate">
                                             {u.keysFile}
                                          </span>
                                       </div>
                                       <table className="w-full text-sm mb-2">
                                          <thead>
                                             <tr className="border-b border-border/60 text-left text-muted-foreground">
                                                <th className="py-1.5 pr-3 font-medium">
                                                   Type
                                                </th>
                                                <th className="py-1.5 pr-3 font-medium">
                                                   Commentaire
                                                </th>
                                                <th className="py-1.5 font-medium">
                                                   Empreinte
                                                </th>
                                             </tr>
                                          </thead>
                                          <tbody>
                                             {(u.keys || []).map((k, i) => (
                                                <tr
                                                   key={`${u.user}-${i}`}
                                                   className="border-b border-border/40"
                                                >
                                                   <td className="py-2 pr-3 font-mono text-xs text-white">
                                                      {k.type}
                                                   </td>
                                                   <td className="py-2 pr-3 text-muted-foreground">
                                                      {k.comment || "—"}
                                                   </td>
                                                   <td className="py-2 font-mono text-xs text-muted-foreground break-all">
                                                      {k.fingerprint ||
                                                         k.keyPreview ||
                                                         "—"}
                                                   </td>
                                                </tr>
                                             ))}
                                          </tbody>
                                       </table>
                                    </div>
                                 ))
                              )}
                           </CardContent>
                        </Card>
                     </div>
                  )}
               </div>
            </div>
         ) : null}

         <AlertDialog
            open={!!unbanTarget}
            onOpenChange={(open) => {
               if (!open && !unbanBusy) {
                  setUnbanTarget(null);
                  setUnbanError(null);
               }
            }}
         >
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>
                     {unbanTarget?.type === "all"
                        ? "Tout unban ?"
                        : "Unban cette IP ?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                     {unbanTarget?.type === "all" ? (
                        <>
                           Retirer le ban de{" "}
                           <strong>{unbanTarget.count}</strong> IP(s) sur toutes
                           les jails concernées. L&apos;attaquant pourra se
                           reconnecter immédiatement.
                        </>
                     ) : (
                        <>
                           Retirer{" "}
                           <code className="text-foreground">
                              {unbanTarget?.ip}
                           </code>{" "}
                           de la jail{" "}
                           <code className="text-foreground">
                              {unbanTarget?.jail}
                           </code>
                           .
                        </>
                     )}
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel disabled={unbanBusy}>
                     Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                     onClick={(e) => {
                        e.preventDefault();
                        confirmUnban();
                     }}
                     disabled={unbanBusy}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                     {unbanBusy ? (
                        <Loader2Icon className="size-4 animate-spin" />
                     ) : null}{" "}
                     Confirmer unban
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
