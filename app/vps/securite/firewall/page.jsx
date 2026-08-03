"use client";

import { useCachedSWR } from "@/hooks/use-cached-swr";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFirewallStatus } from "@/app/actions/security";
import { Loader2Icon } from "lucide-react";
import RefreshButton from "@/components/refresh-button";

function formatCount(n) {
   if (n == null || Number.isNaN(n)) return "—";
   if (n >= 1e9) return `${(n / 1e9).toFixed(1)}G`;
   if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
   if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
   return String(n);
}

function CheckBadge({ ok, label }) {
   return (
      <Badge variant={ok ? "default" : "destructive"} className="font-normal">
         {label}
      </Badge>
   );
}

export default function FirewallPage() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("vps-firewall", () => getFirewallStatus());
   const error = fetchError?.message || null;
   const summary = data?.summary;

   return (
      <div>
         <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
               <h1 className="text-2xl font-bold text-white">Firewall</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Chaîne iptables{" "}
                  <code className="text-xs">DOCKER-USER</code> — lecture seule
               </p>
            </div>
            <RefreshButton
               onClick={() => mutate()}
               loading={loading || isValidating}
            />
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
               {!data.healthy && (
                  <Card className="border-destructive/40">
                     <CardContent className="py-3 text-sm text-destructive">
                        La chaîne ne semble pas saine (DROP final, ESTABLISHED
                        ou ports web manquants). Vérifier les règles sur
                        l’hôte.
                     </CardContent>
                  </Card>
               )}

               <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Statut
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <Badge
                           variant={data.active ? "default" : "destructive"}
                        >
                           {data.active ? "Actif" : "Inactif"}
                        </Badge>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Règles
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-lg font-semibold text-white tabular-nums">
                           {data.ruleCount ?? 0}
                        </p>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           DROP final
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <Badge
                           variant={
                              summary?.hasFinalDrop ? "default" : "destructive"
                           }
                        >
                           {summary?.hasFinalDrop ? "Oui" : "Non"}
                        </Badge>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Persistance reboot
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <Badge
                           variant={
                              data.persistent
                                 ? "default"
                                 : data.persistentReadable === false
                                   ? "outline"
                                   : "destructive"
                           }
                        >
                           {data.persistent
                              ? "rules.v4 OK"
                              : data.persistentReadable === false
                                ? "Illisible"
                                : "Absente"}
                        </Badge>
                     </CardContent>
                  </Card>
               </div>

               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">Contrôles</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                     <CheckBadge
                        ok={summary?.hasEstablished}
                        label="ESTABLISHED"
                     />
                     <CheckBadge ok={summary?.hasDns} label="DNS 53" />
                     <CheckBadge
                        ok={summary?.hasBridgeAccept}
                        label="Bridges Docker"
                     />
                     <CheckBadge
                        ok={summary?.fail2banHook}
                        label="Fail2Ban (80/443)"
                     />
                     <CheckBadge
                        ok={summary?.hasFinalDrop}
                        label="DROP final"
                     />
                     {(summary?.allowPorts || []).map((p) => (
                        <Badge key={p} variant="outline" className="font-mono">
                           :{p}
                        </Badge>
                     ))}
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">
                        Règles DOCKER-USER ({data.rules?.length || 0})
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-border/60 text-left text-muted-foreground">
                              <th className="py-2 pr-3 font-medium">#</th>
                              <th className="py-2 pr-3 font-medium">Cible</th>
                              <th className="py-2 pr-3 font-medium">Proto</th>
                              <th className="py-2 pr-3 font-medium">Ports</th>
                              <th className="py-2 pr-3 font-medium">In</th>
                              <th className="py-2 pr-3 font-medium">Out</th>
                              <th className="py-2 pr-3 font-medium">Pkts</th>
                              <th className="py-2 font-medium">Bytes</th>
                           </tr>
                        </thead>
                        <tbody>
                           {(data.rules || []).map((r) => (
                              <tr
                                 key={r.index}
                                 className="border-b border-border/40"
                              >
                                 <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">
                                    {r.index}
                                 </td>
                                 <td className="py-2.5 pr-3">
                                    <Badge
                                       variant={
                                          r.target === "DROP" ||
                                          r.target === "REJECT"
                                             ? "destructive"
                                             : /^f2b-/i.test(r.target)
                                               ? "outline"
                                               : "default"
                                       }
                                    >
                                       {r.target}
                                    </Badge>
                                    {r.ctstate ? (
                                       <span className="ml-2 text-xs text-muted-foreground">
                                          {r.ctstate}
                                       </span>
                                    ) : null}
                                 </td>
                                 <td className="py-2.5 pr-3 uppercase">
                                    {r.protocol}
                                 </td>
                                 <td className="py-2.5 pr-3 font-mono text-xs text-white">
                                    {r.ports || "—"}
                                 </td>
                                 <td className="py-2.5 pr-3 font-mono text-xs">
                                    {r.in}
                                 </td>
                                 <td className="py-2.5 pr-3 font-mono text-xs">
                                    {r.out}
                                 </td>
                                 <td className="py-2.5 pr-3 tabular-nums">
                                    {r.packetsLabel || formatCount(r.packets)}
                                 </td>
                                 <td className="py-2.5 tabular-nums">
                                    {r.bytesLabel || formatCount(r.bytes)}
                                 </td>
                              </tr>
                           ))}
                           {(data.rules || []).length === 0 && (
                              <tr>
                                 <td
                                    colSpan={8}
                                    className="py-6 text-center text-muted-foreground"
                                 >
                                    Aucune règle dans DOCKER-USER
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </CardContent>
               </Card>
            </div>
         ) : null}
      </div>
   );
}
