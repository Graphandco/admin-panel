"use client";

import { useCallback, useEffect, useState } from "react";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
   filesLs,
   filesRead,
   filesShortcuts,
   filesWrite,
} from "@/app/actions/files";
import {
   ChevronRightIcon,
   FileIcon,
   FolderIcon,
   FolderOpenIcon,
   LinkIcon,
   Loader2Icon,
   RefreshCwIcon,
   SaveIcon,
   ArrowLeftIcon,
   BookmarkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ROOT = "/var/www/docker-stack";

function formatBytes(n) {
   if (n == null || Number.isNaN(n)) return "—";
   if (n < 1024) return `${n} B`;
   const u = ["KB", "MB", "GB"];
   let v = n;
   let i = -1;
   do {
      v /= 1024;
      i += 1;
   } while (v >= 1024 && i < u.length - 1);
   return `${v.toFixed(v >= 10 ? 0 : 1)} ${u[i]}`;
}

function formatDate(iso) {
   if (!iso) return "—";
   try {
      return new Date(iso).toLocaleString("fr-FR", {
         dateStyle: "short",
         timeStyle: "short",
      });
   } catch {
      return iso;
   }
}

function relativeLabel(fullPath) {
   if (!fullPath || fullPath === ROOT) return "docker-stack";
   if (fullPath.startsWith(`${ROOT}/`)) {
      return fullPath.slice(ROOT.length + 1);
   }
   return fullPath;
}

export default function FilesPage() {
   const [path, setPath] = useState(ROOT);
   const [parent, setParent] = useState(null);
   const [entries, setEntries] = useState([]);
   const [shortcuts, setShortcuts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const [editorPath, setEditorPath] = useState(null);
   const [editorContent, setEditorContent] = useState("");
   const [editorOriginal, setEditorOriginal] = useState("");
   const [editorMeta, setEditorMeta] = useState(null);
   const [editorLoading, setEditorLoading] = useState(false);
   const [saving, setSaving] = useState(false);

   const dirty = editorPath != null && editorContent !== editorOriginal;

   const loadDir = useCallback(async (dirPath) => {
      setLoading(true);
      setError(null);
      try {
         const data = await filesLs(dirPath || ROOT);
         setPath(data.path);
         setParent(data.parent);
         setEntries(data.entries || []);
      } catch (err) {
         setError(err.message || "Erreur listing");
         setEntries([]);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      filesShortcuts()
         .then((d) => setShortcuts(d.shortcuts || []))
         .catch(() => {});
      loadDir(ROOT);
   }, [loadDir]);

   async function openFile(filePath) {
      if (dirty) {
         const ok = window.confirm(
            "Modifications non enregistrées. Continuer ?",
         );
         if (!ok) return;
      }
      setEditorLoading(true);
      setEditorPath(filePath);
      try {
         const data = await filesRead(filePath);
         setEditorContent(data.content ?? "");
         setEditorOriginal(data.content ?? "");
         setEditorMeta({ size: data.size, mtime: data.mtime });
      } catch (err) {
         toast.error(err.message || "Lecture impossible");
         setEditorPath(null);
         setEditorContent("");
         setEditorOriginal("");
         setEditorMeta(null);
      } finally {
         setEditorLoading(false);
      }
   }

   async function saveFile() {
      if (!editorPath || !dirty) return;
      setSaving(true);
      try {
         const res = await filesWrite(editorPath, editorContent);
         setEditorOriginal(editorContent);
         toast.success(
            res.backup
               ? `Enregistré (backup : ${res.backup.split("/").pop()})`
               : "Enregistré",
         );
         // refresh mtime in listing if same dir
         loadDir(path);
      } catch (err) {
         toast.error(err.message || "Écriture impossible");
      } finally {
         setSaving(false);
      }
   }

   function closeEditor() {
      if (dirty) {
         const ok = window.confirm(
            "Modifications non enregistrées. Fermer ?",
         );
         if (!ok) return;
      }
      setEditorPath(null);
      setEditorContent("");
      setEditorOriginal("");
      setEditorMeta(null);
   }

   function onEntryClick(entry) {
      if (entry.type === "dir") {
         loadDir(entry.path);
         return;
      }
      if (entry.type === "link") {
         toast.message("Lien symbolique — ouverture non supportée");
         return;
      }
      openFile(entry.path);
   }

   const crumbs = path === ROOT ? [] : relativeLabel(path).split("/");

   return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
               <h1 className="text-xl font-semibold tracking-tight">
                  File manager
               </h1>
               <p className="text-sm text-muted-foreground">
                  Lecture / édition sous{" "}
                  <code className="text-xs">{ROOT}</code>
               </p>
            </div>
            <Button
               variant="outline"
               size="sm"
               onClick={() => loadDir(path)}
               disabled={loading}
            >
               {loading ? (
                  <Loader2Icon className="size-4 animate-spin" />
               ) : (
                  <RefreshCwIcon className="size-4" />
               )}
               Actualiser
            </Button>
         </div>

         {shortcuts.length > 0 && (
            <div className="flex flex-wrap gap-2">
               {shortcuts.map((s) => (
                  <Button
                     key={s.id}
                     variant={path === s.path || path.startsWith(`${s.path}/`) ? "secondary" : "outline"}
                     size="sm"
                     className="h-8 gap-1.5 text-xs"
                     onClick={() => loadDir(s.path)}
                  >
                     <BookmarkIcon className="size-3.5" />
                     {s.label}
                  </Button>
               ))}
            </div>
         )}

         <div
            className={cn(
               "grid gap-4",
               editorPath ? "lg:grid-cols-2" : "grid-cols-1",
            )}
         >
            <Card className="min-w-0">
               <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                     <FolderOpenIcon className="size-4" />
                     Explorateur
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground pt-1">
                     <button
                        type="button"
                        onClick={() => loadDir(ROOT)}
                        className="hover:text-foreground font-mono underline-offset-2 hover:underline"
                     >
                        docker-stack
                     </button>
                     {crumbs.map((c, i) => {
                        const partial = `${ROOT}/${crumbs.slice(0, i + 1).join("/")}`;
                        return (
                           <span
                              key={partial}
                              className="inline-flex items-center gap-1"
                           >
                              <ChevronRightIcon className="size-3 opacity-50" />
                              <button
                                 type="button"
                                 onClick={() => loadDir(partial)}
                                 className="hover:text-foreground font-mono underline-offset-2 hover:underline"
                              >
                                 {c}
                              </button>
                           </span>
                        );
                     })}
                     {parent && (
                        <Button
                           variant="ghost"
                           size="sm"
                           className="h-7 ml-auto text-xs"
                           onClick={() => loadDir(parent)}
                        >
                           <ArrowLeftIcon className="size-3.5" />
                           Remonter
                        </Button>
                     )}
                  </div>
               </CardHeader>
               <CardContent>
                  {error && (
                     <p className="text-sm text-destructive mb-3">{error}</p>
                  )}
                  {loading && entries.length === 0 ? (
                     <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <Loader2Icon className="size-5 animate-spin" />
                     </div>
                  ) : entries.length === 0 ? (
                     <p className="text-sm text-muted-foreground py-8 text-center">
                        Dossier vide
                     </p>
                  ) : (
                     <ul className="divide-y divide-border/60 rounded-lg border border-border/60 overflow-hidden">
                        {entries.map((entry) => {
                           const active = editorPath === entry.path;
                           return (
                              <li key={entry.path}>
                                 <button
                                    type="button"
                                    onClick={() => onEntryClick(entry)}
                                    className={cn(
                                       "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors",
                                       active && "bg-muted",
                                    )}
                                 >
                                    {entry.type === "dir" ? (
                                       <FolderIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                    ) : entry.type === "link" ? (
                                       <LinkIcon className="size-4 shrink-0 text-muted-foreground" />
                                    ) : (
                                       <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                                    )}
                                    <span className="min-w-0 flex-1 truncate font-mono text-xs sm:text-sm">
                                       {entry.name}
                                    </span>
                                    {entry.type === "file" && (
                                       <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                                          {formatBytes(entry.size)}
                                       </span>
                                    )}
                                    {entry.type === "dir" && (
                                       <Badge
                                          variant="secondary"
                                          className="text-[10px] px-1.5 py-0"
                                       >
                                          dir
                                       </Badge>
                                    )}
                                 </button>
                              </li>
                           );
                        })}
                     </ul>
                  )}
               </CardContent>
            </Card>

            {editorPath && (
               <Card className="min-w-0 flex flex-col">
                  <CardHeader className="pb-2 space-y-2">
                     <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                           <CardTitle className="text-base truncate font-mono text-sm">
                              {relativeLabel(editorPath)}
                           </CardTitle>
                           {editorMeta && (
                              <p className="text-xs text-muted-foreground mt-1">
                                 {formatBytes(editorMeta.size)} ·{" "}
                                 {formatDate(editorMeta.mtime)}
                                 {dirty && (
                                    <span className="text-amber-600 dark:text-amber-400 ml-2">
                                       · modifié
                                    </span>
                                 )}
                              </p>
                           )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={closeEditor}
                           >
                              Fermer
                           </Button>
                           <Button
                              size="sm"
                              onClick={saveFile}
                              disabled={!dirty || saving || editorLoading}
                           >
                              {saving ? (
                                 <Loader2Icon className="size-4 animate-spin" />
                              ) : (
                                 <SaveIcon className="size-4" />
                              )}
                              Enregistrer
                           </Button>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0">
                     {editorLoading ? (
                        <div className="flex items-center justify-center py-16 text-muted-foreground">
                           <Loader2Icon className="size-5 animate-spin" />
                        </div>
                     ) : (
                        <Textarea
                           value={editorContent}
                           onChange={(e) => setEditorContent(e.target.value)}
                           spellCheck={false}
                           className="min-h-[420px] flex-1 font-mono text-xs leading-relaxed resize-y"
                        />
                     )}
                     <p className="text-[11px] text-muted-foreground mt-2">
                        Une copie{" "}
                        <code className="text-[10px]">.bak.YYYYMMDDHHMMSS</code>{" "}
                        est créée avant chaque enregistrement.
                     </p>
                  </CardContent>
               </Card>
            )}
         </div>
      </div>
   );
}
