"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/components/settings-provider";
import RefreshButton from "@/components/refresh-button";
import { Loader2Icon, SaveIcon } from "lucide-react";

function FieldRow({ label, hint, children }) {
   return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-border/40 last:border-0">
         <div className="min-w-0">
            <p className="text-sm font-medium text-white">{label}</p>
            {hint ? (
               <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
            ) : null}
         </div>
         <div className="shrink-0">{children}</div>
      </div>
   );
}

function NumberInput({ value, onChange, min, max, suffix, className }) {
   return (
      <div className="flex items-center justify-end gap-2">
         <Input
            type="number"
            className={className || "w-24"}
            value={value}
            min={min}
            max={max}
            onChange={(e) => onChange(Number(e.target.value))}
         />
         {suffix ? (
            <span className="text-xs text-muted-foreground inline-block min-w-10 text-left">
               {suffix}
            </span>
         ) : null}
      </div>
   );
}

export default function SettingsPage() {
   const { settings, loading, error, reload, save } = useSettings();
   const [draft, setDraft] = useState(settings);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      setDraft(settings);
   }, [settings]);

   const set = useCallback((key, value) => {
      setDraft((d) => ({ ...d, [key]: value }));
   }, []);

   async function onSave() {
      setSaving(true);
      try {
         const res = await save(draft);
         if (!res.success) {
            toast.error(res.error || "Échec de l’enregistrement");
            return;
         }
         toast.success("Réglages enregistrés");
      } finally {
         setSaving(false);
      }
   }

   if (loading && !settings) {
      return (
         <Card>
            <CardContent className="flex justify-center py-16">
               <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </CardContent>
         </Card>
      );
   }

   return (
      <div>
         <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
               <h1 className="text-2xl font-bold text-white">Réglages</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Cache, alertes, intervalles et interface
               </p>
            </div>
            <div className="flex items-center gap-2">
               <RefreshButton onClick={reload} loading={loading} />
               <Button onClick={onSave} disabled={saving}>
                  {saving ? (
                     <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                     <SaveIcon className="size-4" />
                  )}
                  Enregistrer
               </Button>
            </div>
         </header>

         {error ? (
            <Card className="mb-4">
               <CardContent className="py-4 text-destructive">{error}</CardContent>
            </Card>
         ) : null}

         <div className="space-y-4 max-w-3xl">
            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-base text-primary">Général</CardTitle>
               </CardHeader>
               <CardContent>
                  <FieldRow
                     label="Cache SWR"
                     hint="Garde les données entre les pages. Désactiver = refetch à chaque navigation."
                  >
                     <Switch
                        checked={!!draft.swrCacheEnabled}
                        onCheckedChange={(v) => set("swrCacheEnabled", v)}
                     />
                  </FieldRow>
                  <FieldRow
                     label="Densité de l’interface"
                     hint="Compact réduit paddings et hauteurs de lignes."
                  >
                     <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={draft.uiDensity || "comfortable"}
                        onChange={(e) => set("uiDensity", e.target.value)}
                     >
                        <option value="comfortable">Confortable</option>
                        <option value="compact">Compact</option>
                     </select>
                  </FieldRow>
                  <FieldRow
                     label="Auto-refresh"
                     hint="Rafraîchit automatiquement les pages qui le supportent (accueil, stats, stockage…)."
                  >
                     <Switch
                        checked={!!draft.autoRefreshEnabled}
                        onCheckedChange={(v) => set("autoRefreshEnabled", v)}
                     />
                  </FieldRow>
                  <FieldRow label="Intervalle auto-refresh" hint="Minimum 15 s.">
                     <NumberInput
                        value={draft.autoRefreshSeconds}
                        min={15}
                        max={600}
                        suffix="s"
                        onChange={(v) => set("autoRefreshSeconds", v)}
                     />
                  </FieldRow>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-base text-primary">Alertes VPS</CardTitle>
               </CardHeader>
               <CardContent>
                  <FieldRow label="Seuil CPU" hint="Alerte Telegram si ≥ ce %.">
                     <NumberInput
                        value={draft.vpsAlertCpuPercent}
                        min={50}
                        max={100}
                        suffix="%"
                        onChange={(v) => set("vpsAlertCpuPercent", v)}
                     />
                  </FieldRow>
                  <FieldRow label="Seuil RAM">
                     <NumberInput
                        value={draft.vpsAlertRamPercent}
                        min={50}
                        max={100}
                        suffix="%"
                        onChange={(v) => set("vpsAlertRamPercent", v)}
                     />
                  </FieldRow>
                  <FieldRow label="Seuil disque">
                     <NumberInput
                        value={draft.vpsAlertDiskPercent}
                        min={50}
                        max={100}
                        suffix="%"
                        onChange={(v) => set("vpsAlertDiskPercent", v)}
                     />
                  </FieldRow>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-base text-primary">Telegram</CardTitle>
               </CardHeader>
               <CardContent>
                  <FieldRow
                     label="Sites down"
                     hint="Alertes monitoring HTTP (Agence)."
                  >
                     <Switch
                        checked={!!draft.telegramSites}
                        onCheckedChange={(v) => set("telegramSites", v)}
                     />
                  </FieldRow>
                  <FieldRow label="Saturation VPS" hint="CPU / RAM / disque.">
                     <Switch
                        checked={!!draft.telegramVps}
                        onCheckedChange={(v) => set("telegramVps", v)}
                     />
                  </FieldRow>
                  <FieldRow
                     label="Conteneurs Docker"
                     hint="Conteneur arrêté / rétabli. (Watchtower a sa propre notif.)"
                  >
                     <Switch
                        checked={!!draft.telegramDocker}
                        onCheckedChange={(v) => set("telegramDocker", v)}
                     />
                  </FieldRow>
                  <FieldRow
                     label="Build cache élevé"
                     hint="Alerte si le cache dépasse le seuil ci-dessous."
                  >
                     <Switch
                        checked={!!draft.telegramBuildCache}
                        onCheckedChange={(v) => set("telegramBuildCache", v)}
                     />
                  </FieldRow>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-base text-primary">Intervalles & stockage</CardTitle>
               </CardHeader>
               <CardContent>
                  <FieldRow
                     label="Monitoring sites / VPS / Docker"
                     hint="Cycle du scheduler admin-api."
                  >
                     <NumberInput
                        value={draft.siteMonitorIntervalMinutes}
                        min={1}
                        max={120}
                        suffix="min"
                        onChange={(v) => set("siteMonitorIntervalMinutes", v)}
                     />
                  </FieldRow>
                  <FieldRow
                     label="Scan mises à jour"
                     hint="Apt / images Docker / plugins WP."
                  >
                     <NumberInput
                        value={draft.updateChecksIntervalHours}
                        min={1}
                        max={48}
                        suffix="h"
                        onChange={(v) => set("updateChecksIntervalHours", v)}
                     />
                  </FieldRow>
                  <FieldRow
                     label="Seuil build cache"
                     hint="0 = pas d’alerte taille. Voir aussi Stockage."
                  >
                     <NumberInput
                        value={draft.buildCacheAlertGb}
                        min={0}
                        max={200}
                        suffix="Go"
                        onChange={(v) => set("buildCacheAlertGb", v)}
                     />
                  </FieldRow>
                  <p className="text-xs text-muted-foreground pt-2">
                     Vider le cache manuellement :{" "}
                     <Link href="/vps/stockage" className="underline text-white">
                        Système → Stockage
                     </Link>
                  </p>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
