"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBackupSnapshots } from "@/app/actions/backups";
import { Loader2Icon, RefreshCwIcon, ArchiveIcon, HardDriveIcon, BarChart3Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKUPS_KEY = "backups-snapshots";

// Cache global (window) pour affichage instantané au retour : les chunks Next.js peuvent être déchargés et perdre le cache module-level
function getBackupCache() {
  if (typeof window === "undefined") return null;
  const c = window.__backupsCache;
  // Ne considérer que le cache valide (configuré avec snapshots), pas "Restic non configuré"
  if (!c || (c.configured !== true && !(c.snapshots?.length > 0))) return null;
  return c;
}
function setBackupCache(v) {
  if (typeof window !== "undefined") window.__backupsCache = v;
}

async function fetchBackups() {
  const res = await getBackupSnapshots(false);
  // Ne mettre en cache que les réponses valides (snapshots listés), pas "Restic non configuré"
  if (res?.configured === true || (res?.snapshots && res.snapshots.length > 0)) {
    setBackupCache(res);
  } else {
    setBackupCache(null); // efface un ancien cache invalide
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

export default function BackupsPage() {
  const { data, error, isLoading, mutate } = useSWR(
    BACKUPS_KEY,
    fetchBackups,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateIfStale: true, // fetch au montage si pas de cache valide (sinon "Restic non configuré")
      dedupingInterval: 60000,
      ...(getBackupCache() && { fallbackData: getBackupCache() }), // uniquement si cache valide (évite que SWR ne fetche pas)
    }
  );

  const [loadingStats, setLoadingStats] = useState(false);
  const displayData = data ?? getBackupCache(); // priorité au cache window pour affichage instantané (évite flash spinner)
  const hasStats = displayData?.snapshots?.some((s) => s.total_size != null);

  async function loadWithStats() {
    setLoadingStats(true);
    try {
      const res = await getBackupSnapshots(true);
      setBackupCache(res);
      mutate(res, false); // met à jour le cache sans revalider
    } catch {
      // erreur gérée par l'affichage
    } finally {
      setLoadingStats(false);
    }
  }

  function load() {
    mutate(undefined, true); // force un refetch, le fetcher mettra à jour le cache
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
                Vérifiez aussi <code className="bg-muted px-1 rounded">docker logs admin-api</code> pour les détails complets.
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
            Snapshots VPS → NAS (réseau Tailscale)
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
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={isLoading}
            className="inline-flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <RefreshCwIcon className="size-4" />
            )}
            Actualiser
          </Button>
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
              {displayData.count} snapshot{displayData.count !== 1 ? "s" : ""} disponible
              {displayData.count !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayData.snapshots?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun snapshot dans le dépôt. Lancez une sauvegarde Restic pour en créer.
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
                      {s.username && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {s.username}
                        </span>
                      )}
                      {s.tags?.length > 0 && (
                        <>
                          {s.tags.map((t) => (
                            <span
                              key={t}
                              className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary"
                            >
                              {t}
                            </span>
                          ))}
                        </>
                      )}
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
                    </div>
                    {s.paths?.length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground/70">Chemins : </span>
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
                    {s.excludes?.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="text-muted-foreground/70">Exclu : </span>
                        {s.excludes.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
