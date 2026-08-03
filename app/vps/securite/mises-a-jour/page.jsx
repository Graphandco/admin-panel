"use client";

import { useState } from "react";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getAptUpdates, upgradeAptPackages } from "@/app/actions/security";
import { mutateUpdateCounts } from "@/hooks/use-update-counts";
import {
   CopyIcon,
   Loader2Icon,
   RefreshCwIcon,
   DownloadIcon,
} from "lucide-react";
import { toast } from "sonner";
import RefreshButton from "@/components/refresh-button";

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

function aptUpgradeCmd(packageName) {
   return `sudo apt install --only-upgrade ${packageName}`;
}

export default function UpdatesPage() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("vps-apt-updates", () => getAptUpdates());
   const error = fetchError?.message || null;
   const [upgradingPkg, setUpgradingPkg] = useState(null); // string | "__all__" | null
   const [confirmAllOpen, setConfirmAllOpen] = useState(false);
   const [confirmPkg, setConfirmPkg] = useState(null); // package name | null

   async function load() {
      await mutate();
   }

   async function copyUpgradeCmd(packageName) {
      const cmd = aptUpgradeCmd(packageName);
      try {
         await navigator.clipboard.writeText(cmd);
         toast.success("Commande copiée");
      } catch {
         toast.error("Impossible de copier");
      }
   }

   async function runUpgrade(opts, label) {
      const key = opts.all ? "__all__" : opts.package;
      setUpgradingPkg(key);
      try {
         const res = await upgradeAptPackages(opts);
         if (!res.success) {
            toast.error(res.error || "Échec de la mise à jour");
            return;
         }
         const n = res.upgraded?.length || 0;
         if (n === 0) {
            toast.message(res.message || "Rien à mettre à jour");
         } else {
            toast.success(
               opts.all
                  ? `${n} paquet${n > 1 ? "s" : ""} mis à jour`
                  : `${label || opts.package} mis à jour`,
            );
         }
         await Promise.all([load(), mutateUpdateCounts()]);
      } catch (err) {
         toast.error(err.message || "Échec de la mise à jour");
      } finally {
         setUpgradingPkg(null);
         setConfirmAllOpen(false);
         setConfirmPkg(null);
      }
   }

   const packages = data?.packages || [];
   const busy = upgradingPkg != null;
   const count = data?.count ?? packages.length;
   const confirmPkgMeta = confirmPkg
      ? packages.find((p) => p.name === confirmPkg)
      : null;

   return (
      <div>
         <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
               <h1 className="text-2xl font-bold text-white">Mises à jour</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Paquets apt en attente sur le VPS
               </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
               <Button
                  variant="default"
                  size="sm"
                  disabled={busy || loading || count === 0}
                  onClick={() => setConfirmAllOpen(true)}
                  className="inline-flex items-center gap-1"
               >
                  {upgradingPkg === "__all__" ? (
                     <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                     <DownloadIcon className="size-4" />
                  )}
                  Tout mettre à jour
               </Button>
               <RefreshButton
                  onClick={load}
                  loading={loading || isValidating}
                  disabled={busy}
               />
            </div>
         </header>

         {error && (
            <Card className="mb-4">
               <CardContent className="py-4 text-destructive">{error}</CardContent>
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
               <div className="grid gap-4 grid-cols-2">
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Paquets à mettre à jour
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-2xl font-semibold text-white tabular-nums">
                           {data.count}
                        </p>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Dernière vérification
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-sm font-medium text-white">
                           {formatDate(data.checkedAt)}
                        </p>
                     </CardContent>
                  </Card>
               </div>

               {data.note && (
                  <Card>
                     <CardContent className="py-3 text-sm text-muted-foreground">
                        {data.note}
                     </CardContent>
                  </Card>
               )}

               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">Paquets</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-border/60 text-left text-muted-foreground">
                              <th className="py-2 pr-3 font-medium">Paquet</th>
                              <th className="py-2 pr-3 font-medium">
                                 Installé
                              </th>
                              <th className="py-2 pr-3 font-medium">
                                 Disponible
                              </th>
                              <th className="py-2 pr-3 font-medium hidden sm:table-cell">
                                 Arch
                              </th>
                              <th className="py-2 font-medium">Action</th>
                           </tr>
                        </thead>
                        <tbody>
                           {packages.map((p) => {
                              const rowBusy = upgradingPkg === p.name;
                              return (
                                 <tr
                                    key={`${p.name}-${p.arch}`}
                                    className="border-b border-border/40"
                                 >
                                    <td className="py-2.5 pr-3 font-medium text-white">
                                       {p.name}
                                    </td>
                                    <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">
                                       {p.current}
                                    </td>
                                    <td className="py-2.5 pr-3">
                                       <div className="inline-flex items-center gap-1.5">
                                          <Badge variant="default">
                                             {p.candidate}
                                          </Badge>
                                          <button
                                             type="button"
                                             onClick={() =>
                                                copyUpgradeCmd(p.name)
                                             }
                                             className="inline-flex items-center justify-center size-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                             title={`Copier : ${aptUpgradeCmd(p.name)}`}
                                          >
                                             <CopyIcon className="size-3.5" />
                                          </button>
                                       </div>
                                    </td>
                                    <td className="py-2.5 pr-3 text-muted-foreground hidden sm:table-cell">
                                       {p.arch}
                                    </td>
                                    <td className="py-2.5">
                                       <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 text-xs"
                                          disabled={busy}
                                          onClick={() => setConfirmPkg(p.name)}
                                       >
                                          {rowBusy ? (
                                             <Loader2Icon className="size-3.5 animate-spin" />
                                          ) : null}
                                          Mettre à jour
                                       </Button>
                                    </td>
                                 </tr>
                              );
                           })}
                           {packages.length === 0 && (
                              <tr>
                                 <td
                                    colSpan={5}
                                    className="py-6 text-center text-muted-foreground"
                                 >
                                    Aucun paquet à mettre à jour
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </CardContent>
               </Card>
            </div>
         ) : null}

         <ConfirmDialog
            open={confirmAllOpen}
            onOpenChange={(v) => {
               if (!busy) setConfirmAllOpen(v);
            }}
            title="Tout mettre à jour ?"
            description={
               count > 0
                  ? `${count} paquet${count > 1 ? "s" : ""} seront mis à jour via apt sur le VPS.\nCela peut prendre plusieurs minutes et redémarrer des services.`
                  : "Aucun paquet à mettre à jour."
            }
            confirmLabel="Tout mettre à jour"
            cancelLabel="Annuler"
            confirming={upgradingPkg === "__all__"}
            variant="destructive"
            onConfirm={() => runUpgrade({ all: true })}
         />

         <ConfirmDialog
            open={confirmPkg != null}
            onOpenChange={(v) => {
               if (!busy && !v) setConfirmPkg(null);
            }}
            title={`Mettre à jour ${confirmPkg || ""} ?`}
            description={
               confirmPkgMeta
                  ? `${confirmPkgMeta.current} → ${confirmPkgMeta.candidate}\nLe paquet sera mis à jour via apt sur le VPS.`
                  : confirmPkg
                    ? `Le paquet ${confirmPkg} sera mis à jour via apt sur le VPS.`
                    : ""
            }
            confirmLabel="Mettre à jour"
            cancelLabel="Annuler"
            confirming={confirmPkg != null && upgradingPkg === confirmPkg}
            onConfirm={() => {
               if (confirmPkg) {
                  runUpgrade({ package: confirmPkg }, confirmPkg);
               }
            }}
         />
      </div>
   );
}
