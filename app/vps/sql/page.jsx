"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   sqlListDatabases,
   sqlListTables,
   sqlRunQuery,
} from "@/app/actions/sql";
import { Loader2Icon, PlayIcon, RefreshCwIcon, DatabaseIcon } from "lucide-react";
import { toast } from "sonner";
import RefreshButton from "@/components/refresh-button";

export default function SqlBrowserPage() {
   const [engine, setEngine] = useState("mysql");
   const [databases, setDatabases] = useState([]);
   const [database, setDatabase] = useState("");
   const [tables, setTables] = useState([]);
   const [sql, setSql] = useState("SELECT 1 AS ok");
   const [loadingMeta, setLoadingMeta] = useState(false);
   const [running, setRunning] = useState(false);
   const [result, setResult] = useState(null);
   const [error, setError] = useState(null);

   const loadDatabases = useCallback(async (eng) => {
      setLoadingMeta(true);
      setError(null);
      try {
         const list = await sqlListDatabases(eng);
         setDatabases(list);
         setDatabase((prev) => (list.includes(prev) ? prev : list[0] || ""));
         setTables([]);
         setResult(null);
      } catch (err) {
         setDatabases([]);
         setDatabase("");
         toast.error(err.message || "Impossible de lister les bases");
      } finally {
         setLoadingMeta(false);
      }
   }, []);

   const loadTables = useCallback(async (eng, db) => {
      if (!db) {
         setTables([]);
         return;
      }
      try {
         const list = await sqlListTables(eng, db);
         setTables(list);
      } catch (err) {
         setTables([]);
         toast.error(err.message || "Impossible de lister les tables");
      }
   }, []);

   useEffect(() => {
      loadDatabases(engine);
   }, [engine, loadDatabases]);

   useEffect(() => {
      if (database) loadTables(engine, database);
   }, [engine, database, loadTables]);

   async function onRun() {
      if (!database || !sql.trim()) return;
      setRunning(true);
      setError(null);
      try {
         const data = await sqlRunQuery({
            engine,
            database,
            sql,
            limit: 500,
         });
         if (!data.success) {
            setResult(null);
            setError(data.error);
            toast.error(data.error);
            return;
         }
         setResult(data);
         toast.success(
            `${data.rowCount} ligne${data.rowCount > 1 ? "s" : ""} · ${data.durationMs} ms`,
         );
      } catch (err) {
         setError(err.message);
         toast.error(err.message);
      } finally {
         setRunning(false);
      }
   }

   function previewTable(t) {
      const full =
         engine === "postgres" && t.schema
            ? `"${t.schema}"."${t.name}"`
            : `\`${t.name}\``;
      setSql(`SELECT * FROM ${full}`);
   }

   return (
      <div className="flex flex-col gap-4">
         <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
               <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                  <DatabaseIcon className="size-5" />
                  SQL
               </h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Navigateur lecture seule (MySQL + PostgreSQL) — user{" "}
                  <code className="text-xs">dashboard_readonly</code>
               </p>
            </div>
            <RefreshButton
               onClick={() => loadDatabases(engine)}
               loading={loadingMeta}
            />
         </div>

         <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
            <Card className="border-border/60">
               <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tables</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                     <Label>Moteur</Label>
                     <Select
                        value={engine}
                        onValueChange={(v) => setEngine(v)}
                     >
                        <SelectTrigger className="w-full">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="mysql">MySQL</SelectItem>
                           <SelectItem value="postgres">PostgreSQL</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5">
                     <Label>Base</Label>
                     <Select
                        value={database || undefined}
                        onValueChange={setDatabase}
                        disabled={!databases.length}
                     >
                        <SelectTrigger className="w-full">
                           <SelectValue placeholder="Choisir…" />
                        </SelectTrigger>
                        <SelectContent>
                           {databases.map((db) => (
                              <SelectItem key={db} value={db}>
                                 {db}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="max-h-[50vh] overflow-y-auto rounded-md border border-border/50">
                     {tables.length === 0 ? (
                        <p className="p-3 text-xs text-muted-foreground">
                           Aucune table
                        </p>
                     ) : (
                        <ul className="divide-y divide-border/40 text-sm">
                           {tables.map((t) => {
                              const key = `${t.schema || ""}.${t.name}`;
                              const label =
                                 engine === "postgres" && t.schema
                                    ? `${t.schema}.${t.name}`
                                    : t.name;
                              return (
                                 <li key={key}>
                                    <button
                                       type="button"
                                       className="w-full px-3 py-1.5 text-left hover:bg-muted/50 truncate"
                                       onClick={() => previewTable(t)}
                                       title="Préremplir SELECT *"
                                    >
                                       {label}
                                    </button>
                                 </li>
                              );
                           })}
                        </ul>
                     )}
                  </div>
               </CardContent>
            </Card>

            <div className="flex flex-col gap-4 min-w-0">
               <Card className="border-border/60">
                  <CardHeader className="pb-3">
                     <CardTitle className="text-base">Requête</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                     <Textarea
                        value={sql}
                        onChange={(e) => setSql(e.target.value)}
                        className="min-h-[140px] font-mono text-sm"
                        spellCheck={false}
                        onKeyDown={(e) => {
                           if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                              e.preventDefault();
                              onRun();
                           }
                        }}
                     />
                     <div className="flex flex-wrap items-center gap-2">
                        <Button onClick={onRun} disabled={running || !database}>
                           {running ? (
                              <Loader2Icon className="size-4 animate-spin" />
                           ) : (
                              <PlayIcon className="size-4" />
                           )}
                           Exécuter
                        </Button>
                        <span className="text-xs text-muted-foreground">
                           Ctrl/⌘ + Entrée · LIMIT 500 auto · read-only
                        </span>
                     </div>
                     {error && (
                        <p className="text-sm text-destructive whitespace-pre-wrap">
                           {error}
                        </p>
                     )}
                  </CardContent>
               </Card>

               {result && (
                  <Card className="border-border/60 overflow-hidden">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex flex-wrap gap-x-3 gap-y-1 font-normal">
                           <span>
                              {result.rowCount} ligne
                              {result.rowCount > 1 ? "s" : ""}
                           </span>
                           <span className="text-muted-foreground">
                              {result.durationMs} ms
                           </span>
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-0">
                        <div className="overflow-auto max-h-[55vh]">
                           <Table>
                              <TableHeader>
                                 <TableRow>
                                    {result.columns.map((col) => (
                                       <TableHead
                                          key={col}
                                          className="whitespace-nowrap"
                                       >
                                          {col}
                                       </TableHead>
                                    ))}
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {result.rows.length === 0 ? (
                                    <TableRow>
                                       <TableCell
                                          colSpan={result.columns.length || 1}
                                          className="text-muted-foreground"
                                       >
                                          Aucun résultat
                                       </TableCell>
                                    </TableRow>
                                 ) : (
                                    result.rows.map((row, i) => (
                                       <TableRow key={i}>
                                          {result.columns.map((col) => (
                                             <TableCell
                                                key={col}
                                                className="max-w-[280px] truncate font-mono text-xs"
                                                title={
                                                   row[col] == null
                                                      ? "NULL"
                                                      : String(row[col])
                                                }
                                             >
                                                {row[col] == null
                                                   ? "NULL"
                                                   : String(row[col])}
                                             </TableCell>
                                          ))}
                                       </TableRow>
                                    ))
                                 )}
                              </TableBody>
                           </Table>
                        </div>
                     </CardContent>
                  </Card>
               )}
            </div>
         </div>
      </div>
   );
}
