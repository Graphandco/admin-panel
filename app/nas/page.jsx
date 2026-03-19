"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { getNasStats } from "@/app/actions/nas";
import { Loader2Icon, RefreshCwIcon, HardDriveIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const chartConfig = {
  used: { label: "Utilisée", color: "#ef4444" },
  free: { label: "Libre", color: "#22c55e" },
};

function formatBytes(val) {
  if (val == null || val < 1024) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(val) / Math.log(k));
  return `${(val / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function tooltipFormatter(value) {
  if (typeof value === "number" && value >= 1024) return formatBytes(value);
  return value?.toLocaleString?.() ?? value;
}

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
  const disk = stats.disk || {};

  const memData = [
    { name: "used", value: mem.used || 0, fill: "#ef4444" },
    { name: "free", value: Math.max(0, (mem.total || 0) - (mem.used || 0)), fill: "#22c55e" },
  ];
  const diskData = [
    { name: "used", value: disk.used || 0, fill: "#ef4444" },
    { name: "free", value: Math.max(0, (disk.total || 0) - (disk.used || 0)), fill: "#22c55e" },
  ];
  const hasMem = (mem.total || 0) > 0;
  const hasDisk = (disk.total || 0) > 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mémoire RAM</CardTitle>
          <p className="text-sm text-muted-foreground">
            {mem.usedFormatted} / {mem.totalFormatted} ({mem.percent}%)
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          ) : (
            <ChartContainer config={chartConfig} className="min-h-[180px] w-full">
              <PieChart accessibilityLayer>
                <Pie
                  data={memData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {memData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={tooltipFormatter}
                      nameKey="name"
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Espace disque</CardTitle>
          <p className="text-sm text-muted-foreground">
            {disk.total
              ? `${disk.usedFormatted} / ${disk.totalFormatted} (${disk.percent}%)${disk.mount ? ` — ${disk.mount}` : ""}`
              : "Aucune partition principale détectée"}
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          ) : !disk.total ? (
            <p className="text-sm text-muted-foreground py-8 text-center">—</p>
          ) : (
            <ChartContainer config={chartConfig} className="min-h-[180px] w-full">
              <PieChart accessibilityLayer>
                <Pie
                  data={diskData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {diskData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={tooltipFormatter}
                      nameKey="name"
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Uptime</CardTitle>
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
