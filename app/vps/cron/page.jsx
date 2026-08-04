"use client";

import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCronJobs } from "@/app/actions/cron";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
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

const DOW = {
   0: "dimanche",
   7: "dimanche",
   1: "lundi",
   2: "mardi",
   3: "mercredi",
   4: "jeudi",
   5: "vendredi",
   6: "samedi",
   sun: "dimanche",
   mon: "lundi",
   tue: "mardi",
   wed: "mercredi",
   thu: "jeudi",
   fri: "vendredi",
   sat: "samedi",
};

function formatTime(hour, minute) {
   const h = Number(hour);
   const m = Number(minute);
   if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
   if (m === 0) return `${h}h`;
   return `${h}h${String(m).padStart(2, "0")}`;
}

function isEvery(field) {
   return field === "*" || field === "?";
}

function parseStep(field) {
   const m = String(field).match(/^(?:\*|\d+-\d+)\/(\d+)$/);
   return m ? Number(m[1]) : null;
}

function dowLabel(field) {
   const key = String(field).toLowerCase();
   return DOW[key] || null;
}

/**
 * Convertit une expression cron à 5 champs en français lisible.
 * Ex. "0 3 * * *" → "Tous les jours à 3h"
 */
function humanizeCron(schedule) {
   if (!schedule || typeof schedule !== "string") return "—";
   const parts = schedule.trim().split(/\s+/);
   if (parts.length < 5) return schedule;
   const [min, hour, dom, month, dow] = parts;

   const minStep = parseStep(min);
   const hourStep = parseStep(hour);

   // */15 * * * *
   if (
      minStep &&
      isEvery(hour) &&
      isEvery(dom) &&
      isEvery(month) &&
      isEvery(dow)
   ) {
      if (minStep === 1) return "Toutes les minutes";
      return `Toutes les ${minStep} minutes`;
   }

   // 0 */2 * * *
   if (
      (min === "0" || Number(min) === 0) &&
      hourStep &&
      isEvery(dom) &&
      isEvery(month) &&
      isEvery(dow)
   ) {
      if (hourStep === 1) return "Toutes les heures";
      return `Toutes les ${hourStep} heures`;
   }

   // 17 * * * * (hourly at minute 17)
   if (
      /^\d+$/.test(min) &&
      isEvery(hour) &&
      isEvery(dom) &&
      isEvery(month) &&
      isEvery(dow)
   ) {
      const m = Number(min);
      if (m === 0) return "Toutes les heures";
      return `Toutes les heures à ${m} min`;
   }

   // 0 3 * * *
   if (
      /^\d+$/.test(min) &&
      /^\d+$/.test(hour) &&
      isEvery(dom) &&
      isEvery(month) &&
      isEvery(dow)
   ) {
      return `Tous les jours à ${formatTime(hour, min)}`;
   }

   // 0 3 * * 0
   if (
      /^\d+$/.test(min) &&
      /^\d+$/.test(hour) &&
      isEvery(dom) &&
      isEvery(month) &&
      dowLabel(dow)
   ) {
      return `Tous les ${dowLabel(dow)}s à ${formatTime(hour, min)}`;
   }

   // 0 3 * * 1-5
   if (
      /^\d+$/.test(min) &&
      /^\d+$/.test(hour) &&
      isEvery(dom) &&
      isEvery(month) &&
      (dow === "1-5" || String(dow).toLowerCase() === "mon-fri")
   ) {
      return `Du lundi au vendredi à ${formatTime(hour, min)}`;
   }

   // 0 3 1 * *
   if (
      /^\d+$/.test(min) &&
      /^\d+$/.test(hour) &&
      /^\d+$/.test(dom) &&
      isEvery(month) &&
      isEvery(dow)
   ) {
      const d = Number(dom);
      const dayLabel = d === 1 ? "1er" : `${d}`;
      return `Le ${dayLabel} de chaque mois à ${formatTime(hour, min)}`;
   }

   // 47 6 * * 7 — same as sunday (already covered if dowLabel works for 7)
   return schedule;
}

export default function CronPage() {
   const {
      data,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR("vps-cron", () => getCronJobs());
   const error = fetchError?.message || null;

   async function load() {
      await mutate();
   }

   return (
      <div>
         <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
               <h1 className="text-2xl font-bold text-white">Cron</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Lecture seule — tâches planifiées de l&apos;hôte
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
               <div className="grid gap-3 grid-cols-2">
                  <Card>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                           Tâches planifiées
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-2xl font-semibold text-white tabular-nums">
                           {data.jobCount}
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

               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">Tâches</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-border/60 text-left text-muted-foreground">
                              <th className="py-2 pr-3 font-medium">
                                 Schedule
                              </th>
                              <th className="py-2 pr-3 font-medium">User</th>
                              <th className="py-2 pr-3 font-medium">
                                 Commande
                              </th>
                              <th className="py-2 font-medium">Source</th>
                           </tr>
                        </thead>
                        <tbody>
                           {(data.jobs || []).map((j, i) => (
                              <tr
                                 key={`${j.source}-${j.schedule}-${i}`}
                                 className="border-b border-border/40 align-top"
                              >
                                 <td
                                    className="py-2.5 pr-3 text-white whitespace-nowrap"
                                    title={j.schedule}
                                 >
                                    {humanizeCron(j.schedule)}
                                 </td>
                                 <td className="py-2.5 pr-3">
                                    <Badge variant="outline">
                                       {j.user || "—"}
                                    </Badge>
                                 </td>
                                 <td
                                    className="py-2.5 pr-3 font-mono text-xs text-muted-foreground max-w-105 truncate"
                                    title={j.command}
                                 >
                                    {j.command}
                                 </td>
                                 <td className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                                    {j.source}
                                 </td>
                              </tr>
                           ))}
                           {(data.jobs || []).length === 0 && (
                              <tr>
                                 <td
                                    colSpan={4}
                                    className="py-6 text-center text-muted-foreground"
                                 >
                                    Aucune tâche trouvée
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </CardContent>
               </Card>

               {(data.userCrontabs || []).length > 0 && (
                  <Card>
                     <CardHeader>
                        <CardTitle className="text-base">
                           Crontabs utilisateurs
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <ul className="space-y-2 text-sm">
                           {data.userCrontabs.map((u) => (
                              <li
                                 key={u.user}
                                 className="flex flex-wrap items-center gap-2"
                              >
                                 <span className="font-medium text-white">
                                    {u.user}
                                 </span>
                                 {u.readable ? (
                                    <Badge variant="default">
                                       {u.jobCount} tâche
                                       {u.jobCount > 1 ? "s" : ""}
                                    </Badge>
                                 ) : (
                                    <Badge variant="destructive">
                                       illisible ({u.error || "permission"})
                                    </Badge>
                                 )}
                              </li>
                           ))}
                        </ul>
                     </CardContent>
                  </Card>
               )}

               <Card>
                  <CardHeader>
                     <CardTitle className="text-base">
                        Scripts périodiques (run-parts)
                     </CardTitle>
                     <p className="text-xs text-muted-foreground">
                        Scripts dans /etc/cron.hourly|daily|weekly|monthly
                     </p>
                  </CardHeader>
                  <CardContent>
                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {(data.periodic || []).map((g) => (
                           <div key={g.period}>
                              <p className="text-sm font-medium text-white mb-2 capitalize">
                                 {g.period}
                              </p>
                              {g.scripts.length === 0 ? (
                                 <p className="text-xs text-muted-foreground">
                                    —
                                 </p>
                              ) : (
                                 <ul className="space-y-1">
                                    {g.scripts.map((s) => (
                                       <li
                                          key={s}
                                          className="text-xs font-mono text-muted-foreground"
                                       >
                                          {s}
                                       </li>
                                    ))}
                                 </ul>
                              )}
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
            </div>
         ) : null}
      </div>
   );
}
