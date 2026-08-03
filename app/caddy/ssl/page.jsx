"use client";

import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { caddyCertificates } from "@/app/actions/caddy";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import RefreshButton from "@/components/refresh-button";

function formatDate(iso) {
   if (!iso) return "—";
   try {
      return new Date(iso).toLocaleString("fr-FR", {
         dateStyle: "medium",
         timeStyle: "short",
      });
   } catch {
      return iso;
   }
}

function statusBadge(status, daysLeft) {
   if (status === "expired") {
      return <Badge variant="destructive">Expiré</Badge>;
   }
   if (status === "critical") {
      return <Badge variant="destructive">{daysLeft} j</Badge>;
   }
   if (status === "warning") {
      return (
         <Badge
            variant="outline"
            className="border-amber-500/50 text-amber-500"
         >
            {daysLeft} j
         </Badge>
      );
   }
   return (
      <Badge variant="default" className="bg-emerald-600/80">
         {daysLeft} j
      </Badge>
   );
}

export default function CaddySslPage() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("caddy-ssl", () => caddyCertificates());
   const error = fetchError?.message || null;

   async function load() {
      await mutate();
   }

   return (
      <div>
         <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
               <h1 className="text-2xl font-bold text-white">Caddy — SSL</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Certificats stockés par Caddy (Let&apos;s Encrypt / ZeroSSL…)
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

         {loading && !data ? (
            <Card>
               <CardContent className="flex items-center justify-center py-16">
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
               </CardContent>
            </Card>
         ) : data ? (
            <div className="space-y-6">
               <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-xs sm:text-sm text-muted-foreground">
                           Total
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-2xl font-semibold text-white tabular-nums">
                           {data.summary?.total ?? 0}
                        </p>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-xs sm:text-sm text-muted-foreground">
                           OK (&gt; 30 j)
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-2xl font-semibold text-emerald-400 tabular-nums">
                           {data.summary?.ok ?? 0}
                        </p>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-xs sm:text-sm text-muted-foreground">
                           ≤ 30 j
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-2xl font-semibold text-amber-400 tabular-nums">
                           {data.summary?.warning ?? 0}
                        </p>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-xs sm:text-sm text-muted-foreground">
                           ≤ 14 j
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-2xl font-semibold text-red-400 tabular-nums">
                           {data.summary?.critical ?? 0}
                        </p>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-xs sm:text-sm text-muted-foreground">
                           Expirés
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-2xl font-semibold text-red-500 tabular-nums">
                           {data.summary?.expired ?? 0}
                        </p>
                     </CardContent>
                  </Card>
               </div>

               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">
                        Certificats ({data.certificates?.length ?? 0})
                     </CardTitle>
                     <p className="text-xs text-muted-foreground">
                        Triés par expiration · vérifié{" "}
                        {formatDate(data.checkedAt)}
                     </p>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-border/60 text-left text-muted-foreground">
                              <th className="py-2 pr-3 font-medium">Domaine</th>
                              <th className="py-2 pr-3 font-medium">
                                 Émetteur
                              </th>
                              <th className="py-2 pr-3 font-medium">
                                 Valide du
                              </th>
                              <th className="py-2 pr-3 font-medium">
                                 Expire le
                              </th>
                              <th className="py-2 pr-3 font-medium">Reste</th>
                              <th className="py-2 font-medium">SAN</th>
                           </tr>
                        </thead>
                        <tbody>
                           {(data.certificates || []).map((c) => (
                              <tr
                                 key={`${c.domain}-${c.serialNumber || c.validTo}`}
                                 className="border-b border-border/40 align-top"
                              >
                                 <td className="py-2.5 pr-3 font-medium text-white">
                                    {c.domain}
                                    {c.subjectCn && c.subjectCn !== c.domain ? (
                                       <p className="text-xs text-muted-foreground font-normal">
                                          CN {c.subjectCn}
                                       </p>
                                    ) : null}
                                 </td>
                                 <td className="py-2.5 pr-3 text-muted-foreground">
                                    {c.issuerCn || "—"}
                                 </td>
                                 <td className="py-2.5 pr-3 whitespace-nowrap text-muted-foreground">
                                    {formatDate(c.validFrom)}
                                 </td>
                                 <td className="py-2.5 pr-3 whitespace-nowrap text-white">
                                    {formatDate(c.validTo)}
                                 </td>
                                 <td className="py-2.5 pr-3">
                                    {statusBadge(c.status, c.daysLeft)}
                                 </td>
                                 <td
                                    className="py-2.5 text-xs text-muted-foreground max-w-55 truncate"
                                    title={(c.sans || []).join(", ")}
                                 >
                                    {(c.sans || []).join(", ") || "—"}
                                 </td>
                              </tr>
                           ))}
                           {(data.certificates || []).length === 0 && (
                              <tr>
                                 <td
                                    colSpan={6}
                                    className="py-6 text-center text-muted-foreground"
                                 >
                                    Aucun certificat trouvé
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
