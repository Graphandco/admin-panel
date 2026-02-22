"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Loader2Icon, RefreshCwIcon, ArrowUpCircle } from "lucide-react";
import { wordpressPlugins, wordpressSites } from "@/app/actions/wordpress";
import { cn } from "@/lib/utils";

function StatusBadge({ status }) {
  const labels = {
    active: "Actif",
    inactive: "Inactif",
    "must-use": "Must-use",
    "drop-in": "Drop-in",
  };
  const label = labels[status] || status;
  const isActive = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        isActive
          ? "bg-green-500/20 text-green-600 dark:text-green-400"
          : "bg-slate-500/20 text-slate-600 dark:text-slate-400"
      )}
    >
      {label}
    </span>
  );
}

function UpdateBadge({ update, updateVersion }) {
  if (!update || update !== "available") return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400">
      <ArrowUpCircle className="size-3.5" />
      Mise à jour {updateVersion ? `v${updateVersion}` : "disponible"}
    </span>
  );
}

export default function PluginsTab() {
  const [sites, setSites] = useState([]);
  const [selectedSiteUrl, setSelectedSiteUrl] = useState("");
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSites, setLoadingSites] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    wordpressSites()
      .then(setSites)
      .catch(() => setSites([]))
      .finally(() => setLoadingSites(false));
  }, []);

  async function loadPlugins() {
    setLoading(true);
    setError(null);
    try {
      const opts = selectedSiteUrl
        ? { url: selectedSiteUrl, status: "active" }
        : {};
      const list = await wordpressPlugins(opts);
      setPlugins(list);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlugins();
  }, [selectedSiteUrl]);

  if (error) {
    return (
      <Card className="my-6 p-6">
        <div className="text-destructive flex items-center gap-3">
          <p>{error}</p>
          <button
            onClick={loadPlugins}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <RefreshCwIcon className="size-4 mr-1" />
            Réessayer
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="my-6">
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="site-filter" className="text-sm text-muted-foreground">
          Filtrer par site
        </label>
        <Select
          value={selectedSiteUrl}
          onValueChange={(v) => setSelectedSiteUrl(v ?? "")}
          disabled={loadingSites}
        >
          <SelectTrigger id="site-filter" className="w-[280px]">
            {selectedSiteUrl ? (
              sites.find((s) => s.url === selectedSiteUrl)?.site_name ||
              selectedSiteUrl
            ) : (
              <span className="text-muted-foreground">Tous les plugins</span>
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les plugins</SelectItem>
            {[...sites]
              .sort((a, b) =>
                (a.site_name || a.url).localeCompare(b.site_name || b.url)
              )
              .map((site) => (
                <SelectItem key={site.blog_id ?? site.url} value={site.url}>
                  {site.site_name || site.url}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <Card className="mb-6 p-0">
        <CardContent>
          <Table>
            <TableHeader className="bg-muted text-white">
              <TableRow>
                <TableHead>
                  <span className="pl-2">Plugin</span>
                </TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Mise à jour</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : plugins.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Aucun plugin
                  </TableCell>
                </TableRow>
              ) : (
                plugins.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="text-sm">
                      <span className="pl-2 font-medium">
                        {p.title || p.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {p.version || "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      <UpdateBadge update={p.update} updateVersion={p.update_version} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
