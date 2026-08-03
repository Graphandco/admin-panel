"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCachedSWR } from "@/hooks/use-cached-swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { getLogSources, checkLogErrors } from "@/app/actions/logs";
import {
   formatLogLine,
   logLineClassName,
   detectLogLevel,
   resolveDockerContainerId,
   LOG_TIMEZONE,
} from "@/lib/log-display";
import { cn } from "@/lib/utils";
import {
   DownloadIcon,
   Loader2Icon,
   PauseIcon,
   PlayIcon,
   RefreshCwIcon,
   ScrollTextIcon,
   SearchIcon,
   TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";

const TAIL_OPTIONS = [100, 200, 500, 1000];
const MAX_BUFFER_LINES = 5000;

function parseSseChunk(buffer, onEvent) {
   const parts = buffer.split("\n\n");
   const rest = parts.pop() || "";
   for (const block of parts) {
      if (!block.trim()) continue;
      let event = "message";
      const dataLines = [];
      for (const raw of block.split("\n")) {
         if (raw.startsWith("event:")) event = raw.slice(6).trim();
         else if (raw.startsWith("data:")) dataLines.push(raw.slice(5).trim());
      }
      if (!dataLines.length) continue;
      try {
         onEvent(event, JSON.parse(dataLines.join("\n")));
      } catch {
         onEvent(event, { text: dataLines.join("\n") });
      }
   }
   return rest;
}

export default function LogsHubPage() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const {
      data: sources,
      error: sourcesFetchError,
      isLoading: loadingSources,
      mutate: mutateSources,
   } = useCachedSWR("log-sources", () => getLogSources());
   const sourcesError = sourcesFetchError?.message || null;

   const [tab, setTab] = useState(
      searchParams.get("source") === "caddy" ? "caddy" : "docker",
   );
   const [dockerId, setDockerId] = useState("");
   const [caddyId, setCaddyId] = useState("access.log");
   const [tail, setTail] = useState(200);
   const [timestamps, setTimestamps] = useState(true);
   const [localTime, setLocalTime] = useState(true);
   const [prettyJson, setPrettyJson] = useState(true);
   const [filterInput, setFilterInput] = useState("");
   const [filter, setFilter] = useState("");
   const [errorsOnly, setErrorsOnly] = useState(false);

   const [lines, setLines] = useState([]);
   const [loading, setLoading] = useState(false);
   const [streaming, setStreaming] = useState(false);
   const [streamStatus, setStreamStatus] = useState("idle");
   const [stats, setStats] = useState(null);
   const [errorCheck, setErrorCheck] = useState(null);
   const [checkingErrors, setCheckingErrors] = useState(false);
   const [follow, setFollow] = useState(true);

   const scrollerRef = useRef(null);
   const abortRef = useRef(null);
   const userNearBottomRef = useRef(true);

   const activeId = tab === "docker" ? dockerId : caddyId;

   async function loadSources() {
      await mutateSources();
   }

   useEffect(() => {
      if (!sources) return;

      const qSource = searchParams.get("source");
      if (qSource === "caddy" || qSource === "docker") {
         setTab(qSource);
      }

      const fromQuery = resolveDockerContainerId(
         sources.docker,
         searchParams.get("container"),
      );
      if (fromQuery) {
         setTab("docker");
         setDockerId(fromQuery);
      } else {
         setDockerId((prev) => prev || sources.docker?.[0]?.id || "");
      }

      const qFile = searchParams.get("file");
      if (qFile && sources.caddy?.some((c) => c.id === qFile)) {
         setTab("caddy");
         setCaddyId(qFile);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [sources]);

   const containerParam = searchParams.get("container");
   const fileParam = searchParams.get("file");

   // Deep-link depuis Docker / Caddy (navigation client)
   useEffect(() => {
      if (!sources?.docker) return;
      if (!containerParam) return;
      const id = resolveDockerContainerId(sources.docker, containerParam);
      if (id) {
         setTab("docker");
         setDockerId(id);
      }
   }, [containerParam, sources]);

   useEffect(() => {
      if (!sources?.caddy || !fileParam) return;
      if (sources.caddy.some((c) => c.id === fileParam)) {
         setTab("caddy");
         setCaddyId(fileParam);
      }
   }, [fileParam, sources]);

   function selectDockerContainer(id) {
      stopStream();
      setDockerId(id);
      setTab("docker");
      const name = (sources?.docker || []).find((c) => c.id === id)?.name;
      const q = new URLSearchParams();
      q.set("source", "docker");
      if (name) q.set("container", name);
      router.replace(`/logs?${q.toString()}`, { scroll: false });
   }

   function selectCaddyFile(id) {
      stopStream();
      setCaddyId(id);
      setTab("caddy");
      const q = new URLSearchParams();
      q.set("source", "caddy");
      q.set("file", id);
      router.replace(`/logs?${q.toString()}`, { scroll: false });
   }

   const scrollToBottom = useCallback(
      (force = false) => {
         const el = scrollerRef.current;
         if (!el) return;
         if (force || (follow && userNearBottomRef.current)) {
            el.scrollTop = el.scrollHeight;
         }
      },
      [follow],
   );

   const onScroll = () => {
      const el = scrollerRef.current;
      if (!el) return;
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      userNearBottomRef.current = dist < 80;
   };

   const stopStream = useCallback(() => {
      if (abortRef.current) {
         abortRef.current.abort();
         abortRef.current = null;
      }
      setStreaming(false);
      setStreamStatus((s) => (s === "live" ? "ended" : s));
   }, []);

   const appendLines = useCallback((incoming) => {
      if (!incoming?.length) return;
      setLines((prev) => {
         const next = prev.concat(incoming);
         if (next.length > MAX_BUFFER_LINES) {
            return next.slice(next.length - MAX_BUFFER_LINES);
         }
         return next;
      });
   }, []);

   const fetchSnapshot = useCallback(async () => {
      if (!activeId) return;
      stopStream();
      setLoading(true);
      setErrorCheck(null);
      try {
         const q = new URLSearchParams({
            kind: tab,
            id: activeId,
            mode: "snapshot",
            tail: String(tail),
            timestamps: timestamps ? "1" : "0",
         });
         if (filter) q.set("filter", filter);
         const res = await fetch(`/api/logs/proxy?${q}`, { cache: "no-store" });
         const data = await res.json();
         if (!data.success) throw new Error(data.error || "Erreur lecture");
         const text = data.data?.text || "";
         setLines(text ? text.split("\n") : []);
         setStats(data.data?.stats || null);
         setStreamStatus("idle");
         setTimeout(() => scrollToBottom(true), 50);
      } catch (err) {
         setLines([`Erreur: ${err.message}`]);
         setStats(null);
         toast.error(err.message || "Échec chargement logs");
      } finally {
         setLoading(false);
      }
   }, [activeId, tab, tail, timestamps, filter, stopStream, scrollToBottom]);

   const startStream = useCallback(async () => {
      if (!activeId) return;
      stopStream();
      setStreaming(true);
      setStreamStatus("live");
      setLoading(true);
      setErrorCheck(null);

      const ac = new AbortController();
      abortRef.current = ac;

      try {
         const snapQ = new URLSearchParams({
            kind: tab,
            id: activeId,
            mode: "snapshot",
            tail: String(Math.min(tail, 300)),
            timestamps: timestamps ? "1" : "0",
         });
         if (filter) snapQ.set("filter", filter);
         const snapRes = await fetch(`/api/logs/proxy?${snapQ}`, {
            cache: "no-store",
            signal: ac.signal,
         });
         const snapData = await snapRes.json();
         if (snapData.success) {
            const text = snapData.data?.text || "";
            setLines(text ? text.split("\n") : []);
            setStats(snapData.data?.stats || null);
         }
         setLoading(false);
         setTimeout(() => scrollToBottom(true), 50);

         const streamQ = new URLSearchParams({
            kind: tab,
            id: activeId,
            mode: "stream",
            tail: "0",
            timestamps: timestamps ? "1" : "0",
         });
         const streamRes = await fetch(`/api/logs/proxy?${streamQ}`, {
            cache: "no-store",
            signal: ac.signal,
         });
         if (!streamRes.ok || !streamRes.body) {
            const errBody = await streamRes.text().catch(() => "");
            throw new Error(
               errBody.slice(0, 200) || `Stream HTTP ${streamRes.status}`,
            );
         }

         const reader = streamRes.body.getReader();
         const decoder = new TextDecoder();
         let buf = "";

         while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            buf = parseSseChunk(buf, (event, payload) => {
               if (event === "line" && payload?.text != null) {
                  const text = String(payload.text);
                  if (
                     filter &&
                     !text.toLowerCase().includes(filter.toLowerCase())
                  ) {
                     return;
                  }
                  appendLines([text]);
                  setTimeout(() => scrollToBottom(false), 16);
               } else if (event === "error") {
                  setStreamStatus("error");
                  toast.error(payload?.message || "Erreur stream");
               } else if (event === "end") {
                  setStreamStatus("ended");
               }
            });
         }
         setStreamStatus((s) => (s === "live" ? "ended" : s));
      } catch (err) {
         if (err.name !== "AbortError") {
            setStreamStatus("error");
            toast.error(err.message || "Stream interrompu");
         }
      } finally {
         setLoading(false);
         setStreaming(false);
         if (abortRef.current === ac) abortRef.current = null;
      }
   }, [
      activeId,
      tab,
      tail,
      timestamps,
      filter,
      stopStream,
      scrollToBottom,
      appendLines,
   ]);

   useEffect(() => {
      if (!activeId || streaming) return;
      fetchSnapshot();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeId, tab, tail, timestamps]);

   useEffect(() => () => stopStream(), [stopStream]);

   const displayedLines = useMemo(() => {
      let list = lines;
      if (errorsOnly) {
         list = list.filter((l) => {
            const lvl = detectLogLevel(l);
            return lvl === "error" || lvl === "warn";
         });
      }
      if (filter) {
         const q = filter.toLowerCase();
         list = list.filter((l) => l.toLowerCase().includes(q));
      }
      return list;
   }, [lines, filter, errorsOnly]);

   async function runErrorCheck() {
      if (!activeId) return;
      setCheckingErrors(true);
      try {
         const data = await checkLogErrors({
            kind: tab,
            id: activeId,
            tail: Math.max(tail, 300),
         });
         setErrorCheck(data);
         toast.message(
            `${data.errors} erreur(s), ${data.warns} warn — ${data.errorRate}%`,
         );
      } catch (err) {
         toast.error(err.message);
      } finally {
         setCheckingErrors(false);
      }
   }

   function exportLogs() {
      const content = displayedLines
         .map((l) =>
            formatLogLine(l, {
               localTime,
               prettyJson: false,
               timeZone: LOG_TIMEZONE,
            }),
         )
         .join("\n");
      if (!content) return;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logs-${tab}-${String(activeId).slice(0, 12)}-${new Date()
         .toISOString()
         .slice(0, 19)
         .replace(/[:T]/g, "-")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
   }

   const dockerList = sources?.docker || [];
   const caddyList = sources?.caddy || [];
   const selectedDocker = dockerList.find((c) => c.id === dockerId);

   return (
      <div className="flex flex-col gap-4 min-h-[70vh]">
         <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
               <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ScrollTextIcon className="size-6" />
                  Logs
               </h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Conteneurs Docker et journaux Caddy — live stream, filtre,
                  export
               </p>
            </div>
            <div className="flex flex-wrap gap-2">
               <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSources}
                  disabled={loadingSources}
               >
                  {loadingSources ? (
                     <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                     <RefreshCwIcon className="size-4" />
                  )}
                  Sources
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={exportLogs}
                  disabled={!displayedLines.length}
               >
                  <DownloadIcon className="size-4" />
                  Export
               </Button>
            </div>
         </header>

         {sourcesError && (
            <Card>
               <CardContent className="py-4 text-destructive">
                  {sourcesError}
               </CardContent>
            </Card>
         )}

         <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 p-1 w-fit">
            {[
               { id: "docker", label: "Docker" },
               { id: "caddy", label: "Caddy" },
            ].map((t) => (
               <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                     stopStream();
                     setTab(t.id);
                     if (t.id === "caddy") {
                        selectCaddyFile(caddyId || "access.log");
                     } else if (dockerId) {
                        selectDockerContainer(dockerId);
                     } else {
                        setTab("docker");
                     }
                  }}
                  className={cn(
                     "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                     tab === t.id
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                  )}
               >
                  {t.label}
               </button>
            ))}
         </div>

         <Card>
            <CardContent className="pt-4 space-y-4">
               <div className="flex flex-wrap items-end gap-3">
                  {tab === "docker" ? (
                     <div className="space-y-1.5 min-w-[220px] flex-1">
                        <Label>Conteneur</Label>
                        <Select
                           value={dockerId}
                           onValueChange={selectDockerContainer}
                           disabled={loadingSources}
                        >
                           <SelectTrigger>
                              <SelectValue placeholder="Choisir…">
                                 {selectedDocker
                                    ? `${selectedDocker.name} (${selectedDocker.state})`
                                    : null}
                              </SelectValue>
                           </SelectTrigger>
                           <SelectContent>
                              {dockerList.map((c) => (
                                 <SelectItem key={c.id} value={c.id}>
                                    {c.name} ({c.state})
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                  ) : (
                     <div className="space-y-1.5 min-w-[200px]">
                        <Label>Fichier</Label>
                        <Select
                           value={caddyId}
                           onValueChange={selectCaddyFile}
                        >
                           <SelectTrigger>
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              {caddyList.map((f) => (
                                 <SelectItem
                                    key={f.id}
                                    value={f.id}
                                    disabled={!f.available}
                                 >
                                    {f.label}
                                    {!f.available ? " (indisponible)" : ""}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                  )}

                  <div className="space-y-1.5">
                     <Label>Lignes</Label>
                     <Select
                        value={String(tail)}
                        onValueChange={(v) => setTail(Number(v))}
                     >
                        <SelectTrigger className="w-[100px]">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           {TAIL_OPTIONS.map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                 {n}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  {tab === "docker" && (
                     <div className="flex items-center gap-2 pb-1">
                        <Switch
                           id="ts"
                           checked={timestamps}
                           onCheckedChange={setTimestamps}
                        />
                        <Label htmlFor="ts" className="text-sm cursor-pointer">
                           Timestamps
                        </Label>
                     </div>
                  )}

                  <div className="flex items-center gap-2 pb-1">
                     <Switch
                        id="local"
                        checked={localTime}
                        onCheckedChange={setLocalTime}
                     />
                     <Label htmlFor="local" className="text-sm cursor-pointer">
                        Heure locale
                        <span className="text-muted-foreground ms-1 text-xs">
                           ({LOG_TIMEZONE.split("/").pop()})
                        </span>
                     </Label>
                  </div>

                  <div className="flex items-center gap-2 pb-1">
                     <Switch
                        id="pretty"
                        checked={prettyJson}
                        onCheckedChange={setPrettyJson}
                     />
                     <Label htmlFor="pretty" className="text-sm cursor-pointer">
                        JSON pretty
                     </Label>
                  </div>

                  <div className="flex items-center gap-2 pb-1">
                     <Switch
                        id="follow"
                        checked={follow}
                        onCheckedChange={setFollow}
                     />
                     <Label htmlFor="follow" className="text-sm cursor-pointer">
                        Auto-scroll
                     </Label>
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[180px]">
                     <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                     <Input
                        value={filterInput}
                        onChange={(e) => setFilterInput(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === "Enter") setFilter(filterInput.trim());
                        }}
                        placeholder="Filtrer (sous-chaîne)…"
                        className="ps-8 h-8"
                     />
                  </div>
                  <Button
                     size="sm"
                     variant="secondary"
                     onClick={() => setFilter(filterInput.trim())}
                  >
                     Filtrer
                  </Button>
                  <Button
                     size="sm"
                     variant={errorsOnly ? "default" : "outline"}
                     onClick={() => setErrorsOnly((v) => !v)}
                  >
                     Erreurs / warn
                  </Button>
                  <Button
                     size="sm"
                     variant="outline"
                     onClick={runErrorCheck}
                     disabled={!activeId || checkingErrors}
                  >
                     {checkingErrors ? (
                        <Loader2Icon className="size-3.5 animate-spin" />
                     ) : (
                        <TriangleAlertIcon className="size-3.5" />
                     )}
                     Analyser
                  </Button>
                  <Button
                     size="sm"
                     variant="outline"
                     onClick={fetchSnapshot}
                     disabled={!activeId || loading || streaming}
                  >
                     <RefreshCwIcon className="size-3.5" />
                     Recharger
                  </Button>
                  {streaming ? (
                     <Button
                        size="sm"
                        variant="destructive"
                        onClick={stopStream}
                     >
                        <PauseIcon className="size-3.5" />
                        Stop live
                     </Button>
                  ) : (
                     <Button
                        size="sm"
                        onClick={startStream}
                        disabled={!activeId || loading}
                     >
                        <PlayIcon className="size-3.5" />
                        Live
                     </Button>
                  )}
               </div>

               <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {streamStatus === "live" && (
                     <Badge className="bg-emerald-600/80 gap-1">
                        <span className="size-1.5 rounded-full bg-white animate-pulse" />
                        Live
                     </Badge>
                  )}
                  {streamStatus === "error" && (
                     <Badge variant="destructive">Stream erreur</Badge>
                  )}
                  {streamStatus === "ended" && (
                     <Badge variant="secondary">Stream terminé</Badge>
                  )}
                  {stats && (
                     <span>
                        {stats.lines} lignes · {stats.errors} err ·{" "}
                        {stats.warns} warn
                     </span>
                  )}
                  {errorCheck && (
                     <span className="text-amber-400">
                        Analyse : {errorCheck.errors} err (
                        {errorCheck.errorRate}%)
                     </span>
                  )}
                  <span className="ms-auto tabular-nums">
                     Affichage {displayedLines.length}
                     {lines.length !== displayedLines.length
                        ? ` / ${lines.length}`
                        : ""}
                  </span>
               </div>

               <div
                  ref={scrollerRef}
                  onScroll={onScroll}
                  className="relative rounded-lg border border-border/50 bg-[#0b0d12] font-mono text-[11px] sm:text-xs leading-relaxed max-h-[min(65vh,720px)] overflow-auto"
               >
                  {loading && !lines.length ? (
                     <div className="flex items-center justify-center py-16 text-muted-foreground">
                        <Loader2Icon className="size-6 animate-spin" />
                     </div>
                  ) : displayedLines.length === 0 ? (
                     <p className="p-6 text-center text-muted-foreground">
                        Aucune ligne
                     </p>
                  ) : (
                     <pre className="p-3 whitespace-pre-wrap break-words">
                        {displayedLines.map((line, i) => {
                           const shown = formatLogLine(line, {
                              localTime,
                              prettyJson,
                              timeZone: LOG_TIMEZONE,
                           });
                           return (
                              <div
                                 key={`${i}-${line.slice(0, 24)}`}
                                 className={cn(
                                    "border-b border-white/5 py-0.5",
                                    logLineClassName(line),
                                 )}
                              >
                                 {shown}
                              </div>
                           );
                        })}
                     </pre>
                  )}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
