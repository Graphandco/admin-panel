"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getBackupSnapshots,
  getBackupSnapshotLs,
} from "@/app/actions/backups";
import {
  Loader2Icon,
  RefreshCwIcon,
  ArchiveIcon,
  HardDriveIcon,
  BarChart3Icon,
  FolderIcon,
  FileIcon,
  DownloadIcon,
  ChevronRightIcon,
  FolderOpenIcon,
  DatabaseIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import RefreshButton from "@/components/refresh-button";

const BACKUPS_KEY = "backups-snapshots";

function getBackupCache() {
  if (typeof window === "undefined") return null;
  const c = window.__backupsCache;
  if (!c || (c.configured !== true && !(c.snapshots?.length > 0))) return null;
  return c;
}
function setBackupCache(v) {
  if (typeof window !== "undefined") window.__backupsCache = v;
}

async function fetchBackups() {
  const res = await getBackupSnapshots(false);
  if (res?.configured === true || (res?.snapshots && res.snapshots.length > 0)) {
    setBackupCache(res);
  } else {
    setBackupCache(null);
  }
  return res;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function formatBytes(n) {
  if (n == null || Number.isNaN(n)) return null;
  if (n < 1024) return `${n} B`;
  const u = ["KB", "MB", "GB", "TB"];
  let v = n;
  let i = -1;
  do {
    v /= 1024;
    i += 1;
  } while (v >= 1024 && i < u.length - 1);
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${u[i]}`;
}

function SnapshotExplorer({ snapshot, open, onOpenChange }) {
  const [path, setPath] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]); // breadcrumb stack of paths

  const snapshotId = snapshot?.short_id || snapshot?.id;

  async function loadDir(dirPath) {
    if (!snapshotId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBackupSnapshotLs(snapshotId, dirPath || "");
      setEntries(data.entries || []);
      setPath(data.path === "/" ? "" : data.path || dirPath || "");
    } catch (err) {
      setError(err.message || "Erreur listing");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(v) {
    onOpenChange(v);
    if (v) {
      setHistory([]);
      setPath("");
      loadDir("");
    }
  }

  function enterDir(entry) {
    setHistory((h) => [...h, path]);
    loadDir(entry.path);
  }

  function goUp() {
    if (history.length === 0) {
      loadDir("");
      return;
    }
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    loadDir(prev);
  }

  function goRoot() {
    setHistory([]);
    loadDir("");
  }

  function downloadFile(entry) {
    const url =
      `/api/backups/download?snapshot=${encodeURIComponent(snapshotId)}` +
      `&path=${encodeURIComponent(entry.path)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success(`Téléchargement : ${entry.name}`);
  }

  const crumbs = path
    ? path.split("/").filter(Boolean)
    : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpenIcon className="size-5" />
            Explorer ·{" "}
            <code className="text-sm font-mono text-muted-foreground">
              {snapshotId}
            </code>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground border-b border-border/50 pb-2">
          <button
            type="button"
            onClick={goRoot}
            className="hover:text-foreground underline-offset-2 hover:underline"
          >
            Racines
          </button>
          {crumbs.map((c, i) => {
            const partial = "/" + crumbs.slice(0, i + 1).join("/");
            return (
              <span key={partial} className="inline-flex items-center gap-1">
                <ChevronRightIcon className="size-3 opacity-50" />
                <button
                  type="button"
                  onClick={() => {
                    setHistory([]);
                    loadDir(partial);
                  }}
                  className="hover:text-foreground font-mono"
                >
                  {c}
                </button>
              </span>
            );
          })}
          {(path || history.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 ml-auto text-xs"
              onClick={goUp}
            >
              Remonter
            </Button>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="py-6 text-sm text-destructive space-y-2">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={() => loadDir(path)}>
                Réessayer
              </Button>
            </div>
          ) : entries.length === 0 ? (
            <p className="py-8 text-sm text-center text-muted-foreground">
              Dossier vide ou chemin absent de ce snapshot
              {!path && (
                <span className="block mt-1 text-xs">
                  (les dumps MySQL apparaissent après une sauvegarde avec le
                  nouveau script)
                </span>
              )}
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {entries.map((entry) => {
                const isDir = entry.type === "dir";
                const isMysql =
                  entry.shortcut ||
                  entry.path === "/tmp/vps_sql_dumps/mysql" ||
                  entry.name?.endsWith(".sql");
                return (
                  <li
                    key={entry.path}
                    className="flex items-center gap-2 py-2 px-1 hover:bg-muted/40 rounded"
                  >
                    {isDir ? (
                      <button
                        type="button"
                        onClick={() => enterDir(entry)}
                        className="flex flex-1 items-center gap-2 min-w-0 text-left"
                      >
                        {entry.shortcut ||
                        entry.path === "/tmp/vps_sql_dumps/mysql" ? (
                          <DatabaseIcon className="size-4 text-sky-400 shrink-0" />
                        ) : (
                          <FolderIcon className="size-4 text-amber-400 shrink-0" />
                        )}
                        <span className="text-sm text-white truncate font-mono">
                          {entry.name}
                        </span>
                      </button>
                    ) : (
                      <>
                        <FileIcon
                          className={cn(
                            "size-4 shrink-0",
                            isMysql
                              ? "text-emerald-400"
                              : "text-muted-foreground",
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate font-mono">
                            {entry.name}
                          </p>
                          {entry.size != null && (
                            <p className="text-[11px] text-muted-foreground">
                              {formatBytes(entry.size)}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 shrink-0"
                          onClick={() => downloadFile(entry)}
                        >
                          <DownloadIcon className="size-3.5 mr-1" />
                          Télécharger
                        </Button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BackupsPage() {
  const { data, error, isLoading, mutate } = useSWR(
    BACKUPS_KEY,
    fetchBackups,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateIfStale: true,
      dedupingInterval: 60000,
      ...(getBackupCache() && { fallbackData: getBackupCache() }),
    }
  );

  const [loadingStats, setLoadingStats] = useState(false);
  const [explorerSnap, setExplorerSnap] = useState(null);
  const displayData = data ?? getBackupCache();
  const hasStats = displayData?.snapshots?.some((s) => s.total_size != null);

  async function loadWithStats() {
    setLoadingStats(true);
    try {
      const res = await getBackupSnapshots(true);
      setBackupCache(res);
      mutate(res, false);
    } catch {
      // ignore
    } finally {
      setLoadingStats(false);
    }
  }

  function load() {
    mutate(undefined, true);
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-4">Sauvegardes Restic</h1>
        <Card>
          <CardContent className="py-6">
            <div className="text-destructive flex flex-col gap-3">
              <p className="whitespace-pre-wrap font-sans">{error}</p>
              <p className="text-sm text-muted-foreground">
                Vérifiez aussi{" "}
                <code className="bg-muted px-1 rounded">docker logs admin-api</code>{" "}
                pour les détails complets.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={load}
                className="inline-flex items-center gap-1 w-fit"
              >
                <RefreshCwIcon className="size-4" />
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sauvegardes Restic</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Snapshots VPS → NAS · explorer et télécharger des fichiers
          </p>
        </div>
        <div className="flex gap-2">
          {displayData?.snapshots?.length > 0 && !hasStats && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadWithStats}
              disabled={loadingStats}
              className="inline-flex items-center gap-1"
            >
              {loadingStats ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <BarChart3Icon className="size-4" />
              )}
              Voir toutes les stats
            </Button>
          )}
          <RefreshButton onClick={load} loading={isLoading} />
        </div>
      </header>

      {isLoading && !data && !getBackupCache() ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : !displayData?.configured ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-start gap-4">
              <HardDriveIcon className="size-10 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-white mb-1">Restic non configuré</p>
                <p className="text-sm text-muted-foreground">
                  {displayData?.message ||
                    "Ajoutez RESTIC_REPOSITORY et RESTIC_PASSWORD dans .env de l'admin-api (ex: sftp:user@100.x.x.x:/backups)."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArchiveIcon className="size-4" />
              {displayData.count} snapshot
              {displayData.count !== 1 ? "s" : ""} disponible
              {displayData.count !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayData.snapshots?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun snapshot dans le dépôt. Lancez une sauvegarde Restic pour
                en créer.
              </p>
            ) : (
              <div className="space-y-3">
                {displayData.snapshots.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-border bg-muted/30 p-4 space-y-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-xs font-mono text-muted-foreground">
                        {s.short_id}
                      </code>
                      <span className="text-sm font-medium text-white">
                        {formatDate(s.time)}
                      </span>
                      {s.hostname && (
                        <span className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">
                          {s.hostname}
                        </span>
                      )}
                      {s.tags?.length > 0 &&
                        s.tags.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary"
                          >
                            {t}
                          </span>
                        ))}
                      {s.total_size && (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                          {s.total_size}
                        </span>
                      )}
                      {s.total_file_count != null && (
                        <span className="text-xs text-muted-foreground">
                          {s.total_file_count.toLocaleString("fr-FR")} fichiers
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 ml-auto text-xs"
                        onClick={() => setExplorerSnap(s)}
                      >
                        <FolderOpenIcon className="size-3.5 mr-1" />
                        Explorer
                      </Button>
                    </div>
                    {s.paths?.length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground/70">
                          Chemins :{" "}
                        </span>
                        <span className="flex flex-wrap gap-x-1.5 gap-y-1 text-muted-foreground font-mono">
                          {s.paths.map((p, i) => (
                            <span key={p}>
                              {i > 0 && <span className="opacity-50">•</span>}
                              {p}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <SnapshotExplorer
        snapshot={explorerSnap}
        open={!!explorerSnap}
        onOpenChange={(v) => !v && setExplorerSnap(null)}
      />
    </div>
  );
}
