"use client";

import { useCachedSWR } from "@/hooks/use-cached-swr";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUfwStatus } from "@/app/actions/security";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import RefreshButton from "@/components/refresh-button";

export default function UfwPage() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("vps-ufw", () => getUfwStatus());
   const error = fetchError?.message || null;

   async function load() {
      await mutate();
   }

   return (
      <div>
         <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
               <h1 className="text-2xl font-bold text-white">UFW</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Lecture seule — configuration et règles utilisateur
               </p>
            </div>
            <RefreshButton onClick={load} loading={loading || isValidating} />
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
               <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Statut conf
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <Badge
                           variant={
                              data.enabledInConf ? "default" : "outline"
                           }
                        >
                           {data.enabledInConf
                              ? "ENABLED=yes"
                              : "ENABLED=no"}
                        </Badge>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Binaire
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <Badge
                           variant={
                              data.binaryPresent ? "default" : "destructive"
                           }
                        >
                           {data.binaryPresent ? "Présent" : "Absent"}
                        </Badge>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Politique input
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-lg font-semibold text-white">
                           {data.defaultInput || "—"}
                        </p>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Log level
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-lg font-semibold text-white">
                           {data.logLevel || "—"}
                        </p>
                     </CardContent>
                  </Card>
               </div>

               {data.note && (
                  <Card>
                     <CardContent className="py-3 text-sm text-amber-500">
                        {data.note}
                     </CardContent>
                  </Card>
               )}

               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">Politiques</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <dl className="grid gap-3 sm:grid-cols-3 text-sm">
                        <div>
                           <dt className="text-muted-foreground">Input</dt>
                           <dd className="font-medium text-white">
                              {data.defaultInput || "—"}
                           </dd>
                        </div>
                        <div>
                           <dt className="text-muted-foreground">Output</dt>
                           <dd className="font-medium text-white">
                              {data.defaultOutput || "—"}
                           </dd>
                        </div>
                        <div>
                           <dt className="text-muted-foreground">Forward</dt>
                           <dd className="font-medium text-white">
                              {data.defaultForward || "—"}
                           </dd>
                        </div>
                        <div>
                           <dt className="text-muted-foreground">IPv6</dt>
                           <dd className="font-medium text-white">
                              {data.ipv6 == null
                                 ? "—"
                                 : data.ipv6
                                   ? "oui"
                                   : "non"}
                           </dd>
                        </div>
                     </dl>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">
                        Règles utilisateur ({data.rules?.length || 0})
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-border/60 text-left text-muted-foreground">
                              <th className="py-2 pr-3 font-medium">Action</th>
                              <th className="py-2 pr-3 font-medium">Proto</th>
                              <th className="py-2 pr-3 font-medium">Port</th>
                              <th className="py-2 pr-3 font-medium">Depuis</th>
                              <th className="py-2 pr-3 font-medium">Vers</th>
                              <th className="py-2 pr-3 font-medium">Sens</th>
                              <th className="py-2 font-medium">Famille</th>
                           </tr>
                        </thead>
                        <tbody>
                           {(data.rules || []).map((r, i) => (
                              <tr
                                 key={`${r.family}-${r.action}-${r.port}-${r.from}-${i}`}
                                 className="border-b border-border/40"
                              >
                                 <td className="py-2.5 pr-3">
                                    <Badge
                                       variant={
                                          r.action === "allow"
                                             ? "default"
                                             : r.action === "deny" ||
                                                 r.action === "reject"
                                               ? "destructive"
                                               : "outline"
                                       }
                                    >
                                       {r.action}
                                    </Badge>
                                 </td>
                                 <td className="py-2.5 pr-3 uppercase">
                                    {r.protocol}
                                 </td>
                                 <td className="py-2.5 pr-3 tabular-nums font-medium text-white">
                                    {r.port || "any"}
                                 </td>
                                 <td className="py-2.5 pr-3 font-mono text-xs">
                                    {r.from}
                                 </td>
                                 <td className="py-2.5 pr-3 font-mono text-xs">
                                    {r.to}
                                 </td>
                                 <td className="py-2.5 pr-3">{r.direction}</td>
                                 <td className="py-2.5 uppercase text-muted-foreground">
                                    {r.family}
                                 </td>
                              </tr>
                           ))}
                           {(data.rules || []).length === 0 && (
                              <tr>
                                 <td
                                    colSpan={7}
                                    className="py-6 text-center text-muted-foreground"
                                 >
                                    Aucune règle utilisateur
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
