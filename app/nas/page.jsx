"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getNasStats } from "@/app/actions/nas";
import { Loader2Icon, RefreshCwIcon, HardDriveIcon, CpuIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatUptime(seconds) {
  if (!seconds || seconds < 0) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days} j`);
  if (hours > 0) parts.push(`${hours} h`);
  parts.push(`${mins} min`);
  return parts.join(" ");
}

function NasStatsCards({ data, loading, name }) {
  if (!data?.configured) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-start gap-4">
            <HardDriveIcon className="size-10 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-white mb-1">{name} — Non configuré</p>
              <p className="text-sm text-muted-foreground">
                {data?.message || `Ajoutez NAS_${name.toUpperCase().replace(/ /g, "_")}_IP dans le .env de l'admin-api.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data?.error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-start gap-4">
            <HardDriveIcon className="size-10 text-destructive shrink-0" />
            <div>
              <p className="font-medium text-white mb-1">{name}</p>
              <p className="text-sm text-destructive">{data.error}</p>
              <p className="text-xs text-muted-foreground mt-1">Host: {data.host}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = data?.stats || {};
  const mem = stats.memory || {};
  const loadavg = stats.loadavg || {};
  const loadSep = " / ";
  const loadLabel = "1 min, 5 min, 15 min";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">RAM</CardTitle>
          <HardDriveIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="text-2xl font-bold text-white">
                {mem.usedFormatted} / {mem.totalFormatted}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, mem.percent || 0)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{mem.percent}% utilisée</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Charge (load average)</CardTitle>
          <CpuIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="text-2xl font-bold text-white">
                {[loadavg.load1, loadavg.load5, loadavg.load15]
                  .map((v) => v?.toFixed(2) ?? "—")
                  .join(loadSep)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{loadLabel}</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          <ClockIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="text-2xl font-bold text-white">
                {formatUptime(stats.uptime)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Host: {data.host}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NasPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getNasStats();
      setData(res);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    load();
  }, []);

  const refreshButton = (
    <Button onClick={load} disabled={loading} variant="outline" size="sm">
      {loading ? (
        <Loader2Icon className="size-4 mr-1 animate-spin" />
      ) : (
        <RefreshCwIcon className="size-4 mr-1" />
      )}
      Actualiser
    </Button>
  );

  const unraidConfigured = data?.unraid?.configured;
  const synologyConfigured = data?.synology?.configured;
  const anyConfigured = unraidConfigured || synologyConfigured;

  if (error) {
    return (
      <>
        {mounted && typeof document !== "undefined" && document.getElementById("nas-refresh-portal") &&
          createPortal(refreshButton, document.getElementById("nas-refresh-portal"))}
        <Card>
          <CardContent className="py-8">
            <div className="text-destructive flex flex-col gap-3">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={load}>
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!anyConfigured && data && !loading) {
    return (
      <>
        {mounted && typeof document !== "undefined" && document.getElementById("nas-refresh-portal") &&
          createPortal(refreshButton, document.getElementById("nas-refresh-portal"))}
        <Card>
          <CardContent className="py-8">
            <div className="flex items-start gap-4">
              <HardDriveIcon className="size-10 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-white mb-1">Aucun NAS configuré</p>
                <p className="text-sm text-muted-foreground">
                  Ajoutez NAS_UNRAID_IP et/ou NAS_SYNOLOGY_IP dans le .env de l'admin-api.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {mounted && typeof document !== "undefined" && document.getElementById("nas-refresh-portal") &&
        createPortal(refreshButton, document.getElementById("nas-refresh-portal"))}
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">NAS Unraid</h2>
          <NasStatsCards data={data?.unraid} loading={loading && !data} name="Unraid" />
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">NAS Synology</h2>
          <NasStatsCards data={data?.synology} loading={loading && !data} name="Synology" />
        </section>
      </div>
    </>
  );
}
