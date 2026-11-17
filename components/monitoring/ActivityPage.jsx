"use client";

import { Fragment, useMemo, useState } from "react";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { getActivity } from "@/app/actions/activity";
import RefreshButton from "@/components/refresh-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
   CheckCircle2Icon,
   ChevronDownIcon,
   ChevronRightIcon,
   HistoryIcon,
   Loader2Icon,
   SearchIcon,
   XCircleIcon,
} from "lucide-react";

const CATEGORY_LABELS = {
   docker: "Docker",
   deploy: "Déploiements",
   security: "Sécurité",
   wordpress: "WordPress",
   clients: "Clients",
   registry: "Registry",
   panel: "Panel",
   settings: "Réglages",
};

function formatDate(iso) {
   if (!iso) return "—";
   const d = new Date(iso);
   if (isNaN(d.getTime())) return "—";
   return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
   });
}

function categoryLabel(cat) {
   return CATEGORY_LABELS[cat] || cat;
}

function SummaryCard({ label, value, tone }) {
   return (
      <div className="rounded-lg border border-white/10 bg-card/40 px-4 py-3">
         <p className="text-xs text-muted-foreground">{label}</p>
         <p
            className={cn(
               "text-lg font-semibold mt-0.5",
               tone === "danger"
                  ? "text-red-300"
                  : tone === "muted"
                    ? "text-muted-foreground"
                    : "text-white",
            )}
         >
            {value}
         </p>
      </div>
   );
}

export default function ActivityPage() {
   const [category, setCategory] = useState("all");
   const [status, setStatus] = useState("all");
   const [q, setQ] = useState("");
   const [search, setSearch] = useState("");
   const [offset, setOffset] = useState(0);
   const [expandedId, setExpandedId] = useState(null);
   const limit = 50;

   const swrKey = useMemo(
      () => ["activity", category, status, search, offset, limit],
      [category, status, search, offset, limit],
   );

   const {
      data,
      error: fetchError,
      isLoading: loading,
      isValidating,
      mutate,
   } = useCachedSWR(swrKey, () =>
      getActivity({
         category,
         status,
         q: search || undefined,
         limit,
         offset,
      }),
   );

   const error = fetchError?.message || null;
   const actions = data?.actions || [];
   const total = data?.total ?? 0;
   const summary = data?.summary;
   const categories = data?.categories || [];

   const filterCategories = useMemo(() => {
      const set = new Set(["all", ...categories, ...Object.keys(CATEGORY_LABELS)]);
      return [...set];
   }, [categories]);

   function applySearch(e) {
      e?.preventDefault?.();
      setOffset(0);
      setSearch(q.trim());
   }

   return (
      <div className="space-y-6">
         <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
               <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <HistoryIcon className="size-6 text-muted-foreground" />
                  Activité
               </h1>
               <p className="text-sm text-muted-foreground mt-0.5">
                  Journal des actions panel + événements Docker (CLI / compose
                  hors panel). Badge « Docker » = détecté via le daemon.
               </p>
            </div>
            <RefreshButton
               onClick={() => mutate()}
               loading={loading || isValidating}
            />
         </header>

         <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard
               label="Actions (24 h)"
               value={loading && !summary ? "…" : (summary?.total24h ?? 0)}
            />
            <SummaryCard
               label="Erreurs (24 h)"
               value={loading && !summary ? "…" : (summary?.errors24h ?? 0)}
               tone={(summary?.errors24h ?? 0) > 0 ? "danger" : "default"}
            />
            <SummaryCard
               label="Dernière action"
               value={
                  loading && !summary
                     ? "…"
                     : summary?.lastAt
                       ? formatDate(summary.lastAt)
                       : "—"
               }
               tone="muted"
            />
         </div>

         <Card className="p-0 md:p-0">
            <CardHeader className="px-4 pt-4 pb-2 space-y-3">
               <CardTitle className="text-base text-white">
                  Journal
                  {!loading ? (
                     <span className="text-muted-foreground font-normal">
                        {" "}
                        ({total})
                     </span>
                  ) : null}
               </CardTitle>
               <form
                  onSubmit={applySearch}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center"
               >
                  <div className="relative flex-1 max-w-md">
                     <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                     <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Rechercher résumé, cible, action…"
                        className="pl-8"
                     />
                  </div>
                  <Button type="submit" size="sm" variant="secondary">
                     Filtrer
                  </Button>
               </form>
               <div className="flex flex-wrap gap-1">
                  {filterCategories.map((c) => (
                     <Button
                        key={c}
                        type="button"
                        size="sm"
                        variant={category === c ? "secondary" : "ghost"}
                        onClick={() => {
                           setCategory(c);
                           setOffset(0);
                        }}
                     >
                        {c === "all" ? "Tous" : categoryLabel(c)}
                     </Button>
                  ))}
               </div>
               <div className="flex gap-1">
                  {[
                     { id: "all", label: "Tous statuts" },
                     { id: "success", label: "Succès" },
                     { id: "error", label: "Erreurs" },
                  ].map((s) => (
                     <Button
                        key={s.id}
                        type="button"
                        size="sm"
                        variant={status === s.id ? "secondary" : "ghost"}
                        onClick={() => {
                           setStatus(s.id);
                           setOffset(0);
                        }}
                     >
                        {s.label}
                     </Button>
                  ))}
               </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
               {error ? (
                  <p className="px-4 py-6 text-sm text-destructive">{error}</p>
               ) : loading ? (
                  <div className="flex justify-center py-12">
                     <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                  </div>
               ) : actions.length === 0 ? (
                  <p className="px-4 py-10 text-sm text-center text-muted-foreground">
                     Aucune action enregistrée pour l’instant. Les mutations
                     (start/stop, deploy, unban…) apparaîtront ici.
                  </p>
               ) : (
                  <Table>
                     <TableHeader className="bg-muted text-white">
                        <TableRow>
                           <TableHead className="w-8" />
                           <TableHead>Date</TableHead>
                           <TableHead>Catégorie</TableHead>
                           <TableHead>Résumé</TableHead>
                           <TableHead className="hidden md:table-cell">
                              Cible
                           </TableHead>
                           <TableHead>Statut</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {actions.map((a) => {
                           const open = expandedId === a.id;
                           const hasDetail =
                              a.detail || a.error || a.action;
                           return (
                              <Fragment key={a.id}>
                                 <TableRow
                                    className={cn(
                                       hasDetail && "cursor-pointer",
                                       open && "bg-muted/30",
                                    )}
                                    onClick={() =>
                                       hasDetail &&
                                       setExpandedId(open ? null : a.id)
                                    }
                                 >
                                    <TableCell className="w-8 px-2">
                                       {hasDetail ? (
                                          open ? (
                                             <ChevronDownIcon className="size-4 text-muted-foreground" />
                                          ) : (
                                             <ChevronRightIcon className="size-4 text-muted-foreground" />
                                          )
                                       ) : null}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                                       {formatDate(a.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                       <div className="flex flex-wrap items-center gap-1">
                                          <Badge
                                             variant="outline"
                                             className="text-[10px]"
                                          >
                                             {categoryLabel(a.category)}
                                          </Badge>
                                          {a.source === "daemon" ||
                                          a.detail?.source === "daemon" ? (
                                             <Badge
                                                variant="outline"
                                                className="text-[10px] border-sky-500/40 text-sky-400"
                                                title="Détecté via docker events (hors panel)"
                                             >
                                                Docker
                                             </Badge>
                                          ) : null}
                                       </div>
                                    </TableCell>
                                    <TableCell className="text-white text-sm max-w-80">
                                       {a.summary}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground max-w-40 truncate">
                                       {a.target || "—"}
                                    </TableCell>
                                    <TableCell>
                                       {a.status === "error" ? (
                                          <Badge
                                             variant="outline"
                                             className="gap-1 border-red-500/40 text-red-400"
                                          >
                                             <XCircleIcon className="size-3" />
                                             Erreur
                                          </Badge>
                                       ) : (
                                          <Badge
                                             variant="outline"
                                             className="gap-1 border-emerald-500/40 text-emerald-400"
                                          >
                                             <CheckCircle2Icon className="size-3" />
                                             OK
                                          </Badge>
                                       )}
                                    </TableCell>
                                 </TableRow>
                                 {open ? (
                                    <TableRow className="hover:bg-transparent">
                                       <TableCell
                                          colSpan={6}
                                          className="bg-black/20 px-4 py-3"
                                       >
                                          <dl className="grid gap-1 text-sm sm:grid-cols-2">
                                             <div>
                                                <dt className="text-xs text-muted-foreground">
                                                   Action
                                                </dt>
                                                <dd className="font-mono text-xs text-white">
                                                   {a.action}
                                                </dd>
                                             </div>
                                             {a.target ? (
                                                <div>
                                                   <dt className="text-xs text-muted-foreground">
                                                      Cible
                                                   </dt>
                                                   <dd className="font-mono text-xs break-all">
                                                      {a.target}
                                                   </dd>
                                                </div>
                                             ) : null}
                                             {a.error ? (
                                                <div className="sm:col-span-2">
                                                   <dt className="text-xs text-muted-foreground">
                                                      Erreur
                                                   </dt>
                                                   <dd className="text-red-300 text-sm break-all">
                                                      {a.error}
                                                   </dd>
                                                </div>
                                             ) : null}
                                          </dl>
                                          {a.detail ? (
                                             <pre className="mt-3 rounded-md border border-border bg-black/40 p-3 text-xs text-muted-foreground overflow-x-auto font-mono">
                                                {JSON.stringify(
                                                   a.detail,
                                                   null,
                                                   2,
                                                )}
                                             </pre>
                                          ) : null}
                                       </TableCell>
                                    </TableRow>
                                 ) : null}
                              </Fragment>
                           );
                        })}
                     </TableBody>
                  </Table>
               )}

               {total > limit ? (
                  <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border">
                     <p className="text-xs text-muted-foreground">
                        {offset + 1}–{Math.min(offset + limit, total)} / {total}
                     </p>
                     <div className="flex gap-2">
                        <Button
                           size="sm"
                           variant="outline"
                           disabled={offset === 0 || loading}
                           onClick={() =>
                              setOffset(Math.max(0, offset - limit))
                           }
                        >
                           Précédent
                        </Button>
                        <Button
                           size="sm"
                           variant="outline"
                           disabled={offset + limit >= total || loading}
                           onClick={() => setOffset(offset + limit)}
                        >
                           Suivant
                        </Button>
                     </div>
                  </div>
               ) : null}
            </CardContent>
         </Card>
      </div>
   );
}
