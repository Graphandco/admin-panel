"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ReferenceLine } from "recharts";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";
import { agenceSiteHistory } from "@/app/actions/agence-sites";
import { cn } from "@/lib/utils";

const chartConfig = {
   ms: { label: "Latence", color: "#3b82f6" },
};

const RANGE_OPTIONS = [
   { value: "24", label: "24 h" },
   { value: "72", label: "3 j" },
   { value: "168", label: "7 j" },
   { value: "720", label: "30 j" },
];

function formatTick(iso, hours) {
   if (!iso) return "";
   const d = new Date(iso);
   if (hours <= 24) {
      return d.toLocaleTimeString("fr-FR", {
         hour: "2-digit",
         minute: "2-digit",
      });
   }
   return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
   });
}

export function SiteLatencyHistory({ websiteId, kind = "site", className }) {
   const [hours, setHours] = useState("24");
   const hoursNum = Number(hours);

   const { data, error, isLoading } = useSWR(
      websiteId
         ? ["site-history", websiteId, kind, hours]
         : null,
      () =>
         agenceSiteHistory(websiteId, {
            hours: hoursNum,
            kind,
         }),
      { revalidateOnFocus: false },
   );

   const chartData = useMemo(() => {
      const points = data?.points || [];
      return points.map((p) => ({
         ...p,
         time: formatTick(p.at, hoursNum),
         msPlot: p.ok && p.ms != null ? p.ms : null,
         down: p.ok ? null : 0,
      }));
   }, [data, hoursNum]);

   return (
      <div className={cn("space-y-3", className)}>
         <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
               <span>
                  Points :{" "}
                  <strong className="text-foreground tabular-nums">
                     {data?.count ?? "—"}
                  </strong>
               </span>
               <span>
                  Moy. :{" "}
                  <strong className="text-foreground tabular-nums">
                     {data?.avgMs != null ? `${data.avgMs} ms` : "—"}
                  </strong>
               </span>
               <span>
                  Max :{" "}
                  <strong className="text-foreground tabular-nums">
                     {data?.maxMs != null ? `${data.maxMs} ms` : "—"}
                  </strong>
               </span>
               <span>
                  Uptime :{" "}
                  <strong className="text-foreground tabular-nums">
                     {data?.uptime != null ? `${data.uptime}%` : "—"}
                  </strong>
               </span>
            </div>
            <div className="flex items-center gap-2">
               <Label className="text-xs text-muted-foreground">Période</Label>
               <Select value={hours} onValueChange={setHours}>
                  <SelectTrigger className="h-8 w-24">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     {RANGE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                           {o.label}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>
         </div>

         {error ? (
            <p className="text-sm text-destructive py-6 text-center">
               {error.message || "Erreur chargement historique"}
            </p>
         ) : isLoading && !data ? (
            <div className="flex justify-center py-16">
               <Loader2Icon className="size-7 animate-spin text-muted-foreground" />
            </div>
         ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
               Aucune donnée sur cette période.
            </p>
         ) : (
            <ChartContainer config={chartConfig} className="h-64 w-full">
               <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
               >
                  <XAxis
                     dataKey="time"
                     tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 10,
                     }}
                     tickLine={false}
                     minTickGap={28}
                  />
                  <YAxis
                     tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 10,
                     }}
                     tickFormatter={(v) => `${v}`}
                     width={40}
                  />
                  <ReferenceLine
                     y={700}
                     stroke="#f59e0b"
                     strokeDasharray="4 4"
                     strokeOpacity={0.7}
                  />
                  <ChartTooltip
                     content={
                        <ChartTooltipContent
                           formatter={(v, name) => {
                              if (name === "msPlot" || name === "ms") {
                                 return v != null ? `${v} ms` : "Down";
                              }
                              return v;
                           }}
                        />
                     }
                  />
                  <Line
                     type="monotone"
                     dataKey="msPlot"
                     stroke="#3b82f6"
                     strokeWidth={2}
                     dot={false}
                     connectNulls={false}
                     name="Latence"
                  />
               </LineChart>
            </ChartContainer>
         )}
         <p className="text-[10px] text-muted-foreground">
            Ligne ambre = seuil « lent » (700 ms)
         </p>
      </div>
   );
}
