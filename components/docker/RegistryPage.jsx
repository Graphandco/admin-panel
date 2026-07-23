"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
   getRegistryOverview,
   deleteRegistryManifest,
   runRegistryGarbageCollect,
   getRegistryTagDetail,
} from "@/app/actions/registry";
import { StatusCard } from "@/components/ui/status-card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
   BoxIcon,
   CheckIcon,
   ChevronDownIcon,
   ChevronRightIcon,
   CopyIcon,
   InfoIcon,
   Loader2Icon,
   PackageIcon,
   RefreshCwIcon,
   SearchIcon,
   Trash2Icon,
   EraserIcon,
   Ban,
} from "lucide-react";

const LOGIN_CMD = "docker login dockerhub.graphandco.com -u graphandco";

function formatSize(bytes) {
   if (bytes == null || !Number.isFinite(bytes)) return "—";
   if (bytes < 1024) return `${bytes} B`;
   const units = ["KB", "MB", "GB", "TB"];
   let n = bytes / 1024;
   let i = 0;
   while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i += 1;
   }
   return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function shortDigest(digest) {
   if (!digest) return "—";
   const hex = digest.replace(/^sha256:/, "");
   return hex.length > 12 ? `${hex.slice(0, 12)}…` : hex;
}

function formatDate(iso) {
   if (!iso) return "—";
   const d = new Date(iso);
   if (isNaN(d.getTime())) return "—";
   return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });
}

function tagsSharingDigest(repo, digest) {
   if (!digest || !repo?.tags) return [];
   return repo.tags.filter((t) => t.digest === digest).map((t) => t.name);
}

function CopyBtn({ value, label = "Copier" }) {
   const [copied, setCopied] = useState(false);
   async function onCopy() {
      try {
         await navigator.clipboard.writeText(value);
         setCopied(true);
         toast.success("Copié dans le presse-papiers");
         setTimeout(() => setCopied(false), 1500);
      } catch {
         toast.error("Impossible de copier");
      }
   }
   return (
      <button
         type="button"
         onClick={onCopy}
         className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-7 w-7 shrink-0",
         )}
         title={label}
      >
         {copied ? (
            <CheckIcon className="size-3.5 text-green-500" />
         ) : (
            <CopyIcon className="size-3.5" />
         )}
      </button>
   );
}

function TagDetailDialog({ open, onOpenChange, repository, tagName }) {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [tag, setTag] = useState(null);

   useEffect(() => {
      if (!open || !repository || !tagName) return;
      let cancelled = false;
      (async () => {
         setLoading(true);
         setError(null);
         setTag(null);
         const res = await getRegistryTagDetail(repository, tagName);
         if (cancelled) return;
         if (!res.success) {
            setError(res.error || "Erreur");
         } else {
            setTag(res.tag);
         }
         setLoading(false);
      })();
      return () => {
         cancelled = true;
      };
   }, [open, repository, tagName]);

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="w-[94vw] md:w-180 max-w-[94vw] md:max-w-180 max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-2">
               <DialogTitle className="font-mono text-base">
                  {repository}:{tagName}
               </DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6 overflow-y-auto space-y-5 flex-1 min-h-0">
               {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-10 justify-center">
                     <Loader2Icon className="size-5 animate-spin" />
                     Chargement des détails…
                  </div>
               ) : error ? (
                  <p className="text-destructive text-sm py-6 text-center">
                     {error}
                  </p>
               ) : tag ? (
                  <>
                     <div className="grid gap-3 sm:grid-cols-2 text-sm">
                        <div>
                           <p className="text-xs text-muted-foreground mb-1">
                              Taille compressée
                           </p>
                           <p className="font-medium">{formatSize(tag.size)}</p>
                        </div>
                        <div>
                           <p className="text-xs text-muted-foreground mb-1">
                              Créée le
                           </p>
                           <p className="font-medium">
                              {formatDate(tag.created)}
                           </p>
                        </div>
                        <div>
                           <p className="text-xs text-muted-foreground mb-1">
                              Architecture
                           </p>
                           <p className="font-medium font-mono">
                              {[tag.os, tag.architecture]
                                 .filter(Boolean)
                                 .join("/") || "—"}
                           </p>
                        </div>
                        <div>
                           <p className="text-xs text-muted-foreground mb-1">
                              Layers
                           </p>
                           <p className="font-medium">
                              {tag.layerCount ?? tag.layers?.length ?? "—"}
                           </p>
                        </div>
                     </div>

                     {tag.pullCommand && (
                        <div>
                           <p className="text-xs text-muted-foreground mb-1.5">
                              Pull
                           </p>
                           <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                              <code className="flex-1 text-xs font-mono break-all">
                                 {tag.pullCommand}
                              </code>
                              <CopyBtn value={tag.pullCommand} />
                           </div>
                        </div>
                     )}

                     {tag.digest && (
                        <div>
                           <p className="text-xs text-muted-foreground mb-1.5">
                              Digest
                           </p>
                           <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                              <code className="flex-1 text-xs font-mono break-all">
                                 {tag.digest}
                              </code>
                              <CopyBtn value={tag.digest} />
                           </div>
                        </div>
                     )}

                     {tag.platforms?.length > 0 && (
                        <div>
                           <p className="text-xs text-muted-foreground mb-2">
                              Plateformes
                           </p>
                           <div className="rounded-md border border-border/60 overflow-hidden">
                              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/30">
                                 <span>OS / Arch</span>
                                 <span>Digest</span>
                                 <span className="text-right">Taille</span>
                              </div>
                              {tag.platforms.map((p) => (
                                 <div
                                    key={
                                       p.digest || `${p.os}-${p.architecture}`
                                    }
                                    className="grid grid-cols-[1fr_1fr_auto] gap-2 px-3 py-1.5 text-xs border-t border-border/40"
                                 >
                                    <span className="font-mono">
                                       {[p.os, p.architecture, p.variant]
                                          .filter(Boolean)
                                          .join("/")}
                                    </span>
                                    <span
                                       className="font-mono text-muted-foreground truncate"
                                       title={p.digest || undefined}
                                    >
                                       {shortDigest(p.digest)}
                                    </span>
                                    <span className="text-right tabular-nums text-muted-foreground">
                                       {formatSize(p.size)}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {tag.layers?.length > 0 && (
                        <div>
                           <p className="text-xs text-muted-foreground mb-2">
                              Couches (layers)
                           </p>
                           <div className="rounded-md border border-border/60 overflow-hidden max-h-48 overflow-y-auto">
                              <div className="grid grid-cols-[auto_1fr_auto] gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/30 sticky top-0">
                                 <span>#</span>
                                 <span>Digest</span>
                                 <span className="text-right">Taille</span>
                              </div>
                              {tag.layers.map((l) => (
                                 <div
                                    key={l.digest || l.index}
                                    className="grid grid-cols-[auto_1fr_auto] gap-2 px-3 py-1.5 text-xs border-t border-border/40"
                                 >
                                    <span className="text-muted-foreground tabular-nums">
                                       {l.index}
                                    </span>
                                    <span
                                       className="font-mono text-muted-foreground truncate"
                                       title={l.digest || undefined}
                                    >
                                       {shortDigest(l.digest)}
                                    </span>
                                    <span className="text-right tabular-nums">
                                       {formatSize(l.size)}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {tag.history?.length > 0 && (
                        <div>
                           <p className="text-xs text-muted-foreground mb-2">
                              Historique (build)
                           </p>
                           <div className="rounded-md border border-border/60 overflow-hidden max-h-56 overflow-y-auto">
                              {tag.history.map((h) => (
                                 <div
                                    key={h.index}
                                    className="px-3 py-2 text-xs border-t border-border/40 first:border-t-0"
                                 >
                                    <div className="flex justify-between gap-2 text-muted-foreground mb-0.5">
                                       <span>#{h.index}</span>
                                       <span>{formatDate(h.created)}</span>
                                    </div>
                                    <pre className="font-mono whitespace-pre-wrap break-all text-[11px] leading-snug">
                                       {h.createdBy || h.comment || "—"}
                                    </pre>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {tag.mediaType && (
                        <p className="text-[11px] text-muted-foreground font-mono break-all">
                           {tag.mediaType}
                        </p>
                     )}
                  </>
               ) : null}
            </div>
         </DialogContent>
      </Dialog>
   );
}

export default function RegistryPage() {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [mounted, setMounted] = useState(false);
   const [search, setSearch] = useState("");
   const [expanded, setExpanded] = useState({});
   const [copied, setCopied] = useState(false);
   const [busyKey, setBusyKey] = useState(null);
   const [gcRunning, setGcRunning] = useState(false);
   const [detail, setDetail] = useState(null);

   async function copyLogin() {
      try {
         await navigator.clipboard.writeText(LOGIN_CMD);
         setCopied(true);
         toast.success("Commande copiée dans le presse-papiers");
         setTimeout(() => setCopied(false), 2000);
      } catch {
         toast.error("Impossible de copier la commande");
      }
   }

   async function load() {
      setLoading(true);
      setError(null);
      try {
         const overview = await getRegistryOverview();
         setData(overview);
         if (overview.error) setError(overview.error);
      } catch (err) {
         setError(err.message || "Erreur lors du chargement");
         setData(null);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      setMounted(true);
      load();
   }, []);

   const repositories = data?.repositories ?? [];
   const filtered = useMemo(() => {
      const q = search.trim().toLowerCase();
      if (!q) return repositories;
      return repositories.filter(
         (r) =>
            r.name.toLowerCase().includes(q) ||
            r.tags?.some((t) => t.name.toLowerCase().includes(q)),
      );
   }, [repositories, search]);

   function toggle(name) {
      setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
   }

   async function handleDeleteTag(repo, tag) {
      if (!tag.digest) {
         toast.error("Digest introuvable pour ce tag");
         return;
      }
      const siblings = tagsSharingDigest(repo, tag.digest).filter(
         (t) => t !== tag.name,
      );
      const siblingNote =
         siblings.length > 0
            ? `\n\nAttention : le même digest est aussi utilisé par : ${siblings.join(", ")}. Ces tags seront retirés également.`
            : "";
      const ok = confirm(
         `Supprimer ${repo.name}:${tag.name} ?\nDigest : ${shortDigest(tag.digest)}${siblingNote}\n\nLe garbage collector sera lancé ensuite pour libérer l'espace disque.`,
      );
      if (!ok) return;

      const key = `${repo.name}@${tag.name}`;
      setBusyKey(key);
      try {
         const del = await deleteRegistryManifest({
            repository: repo.name,
            digest: tag.digest,
            tag: tag.name,
         });
         if (!del.success) {
            toast.error(del.error || "Suppression échouée");
            return;
         }
         const affected = del.affectedTags?.length
            ? del.affectedTags.join(", ")
            : tag.name;
         toast.success(`Manifeste supprimé (${affected})`);

         setGcRunning(true);
         const gc = await runRegistryGarbageCollect({ dryRun: false });
         if (!gc.success) {
            toast.error(
               gc.error ||
                  "Manifeste supprimé, mais le garbage collect a échoué",
            );
         } else {
            toast.success("Espace disque nettoyé (garbage collect)");
         }
         await load();
      } catch (err) {
         toast.error(err.message || "Erreur");
      } finally {
         setBusyKey(null);
         setGcRunning(false);
      }
   }

   async function handleGc() {
      const ok = confirm(
         "Lancer le garbage collector du registry ?\nLes couches orphelines (sans manifeste) seront supprimées du disque.",
      );
      if (!ok) return;
      setGcRunning(true);
      try {
         const gc = await runRegistryGarbageCollect({ dryRun: false });
         if (!gc.success) {
            toast.error(gc.error || "Garbage collect échoué");
            return;
         }
         toast.success("Garbage collect terminé");
      } catch (err) {
         toast.error(err.message || "Erreur");
      } finally {
         setGcRunning(false);
      }
   }

   const refreshButton = (
      <div className="flex items-center gap-2">
         <button
            onClick={handleGc}
            disabled={loading || gcRunning || Boolean(busyKey)}
            className={cn(buttonVariants({ variant: "outline" }))}
            title="Libérer l'espace disque (garbage collect)"
         >
            {gcRunning ? (
               <Loader2Icon className="size-4 mr-1 animate-spin" />
            ) : (
               <EraserIcon className="size-4 mr-1" />
            )}
            Nettoyer le disque
         </button>
         <button
            onClick={load}
            disabled={loading || gcRunning}
            className={cn(buttonVariants({}))}
         >
            {loading ? (
               <Loader2Icon className="size-4 mr-1 animate-spin" />
            ) : (
               <RefreshCwIcon className="size-4 mr-1" />
            )}
            Actualiser
         </button>
      </div>
   );

   return (
      <>
         {mounted &&
            typeof document !== "undefined" &&
            createPortal(
               refreshButton,
               document.getElementById("docker-refresh-portal"),
            )}

         <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <StatusCard
               Icon={data?.online ? CheckIcon : Ban}
               color={data?.online ? "green" : "slate"}
               label="Statut"
               value={data?.online ? "Online" : "Offline"}
            />
            <StatusCard
               Icon={BoxIcon}
               color="blue"
               label="Repositories"
               value={data?.repositoryCount ?? 0}
            />
            <StatusCard
               Icon={PackageIcon}
               color="blue"
               label="Tags"
               value={data?.tagCount ?? 0}
            />
         </div>

         {data?.host && (
            <p className="text-sm text-muted-foreground mb-4 font-mono">
               {data.host}
            </p>
         )}

         <Card className="mt-2">
            <CardContent className="pt-4 space-y-4">
               <div className="relative max-w-sm">
                  <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Rechercher un repo ou un tag…"
                     className="pl-8"
                  />
               </div>

               {loading && !data ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                     <Loader2Icon className="size-5 animate-spin" />
                     Chargement du catalogue…
                  </div>
               ) : error && !repositories.length ? (
                  <p className="text-destructive text-sm py-6 text-center">
                     {error}
                  </p>
               ) : filtered.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">
                     Aucun repository trouvé.
                  </p>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className="w-8" />
                           <TableHead>Repository</TableHead>
                           <TableHead className="w-24 text-right">
                              Tags
                           </TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {filtered.map((repo) => {
                           const isOpen = Boolean(expanded[repo.name]);
                           return (
                              <TableRow
                                 key={repo.name}
                                 className="cursor-pointer"
                                 onClick={() => toggle(repo.name)}
                              >
                                 <TableCell className="align-top pt-3">
                                    {isOpen ? (
                                       <ChevronDownIcon className="size-4 text-muted-foreground" />
                                    ) : (
                                       <ChevronRightIcon className="size-4 text-muted-foreground" />
                                    )}
                                 </TableCell>
                                 <TableCell className="align-top">
                                    <div className="font-medium font-mono text-sm">
                                       {repo.name}
                                    </div>
                                    {isOpen && (
                                       <div
                                          className="mt-3 mb-1 space-y-1"
                                          onClick={(e) => e.stopPropagation()}
                                       >
                                          {(repo.tags?.length ?? 0) === 0 ? (
                                             <p className="text-xs text-muted-foreground">
                                                Aucun tag
                                             </p>
                                          ) : (
                                             <div className="rounded-md border border-border/60 overflow-hidden overflow-x-auto">
                                                <div className="grid grid-cols-[minmax(4rem,1fr)_minmax(5rem,1fr)_auto_auto_auto_auto] gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/30 min-w-130">
                                                   <span>Tag</span>
                                                   <span>Digest</span>
                                                   <span className="text-right">
                                                      Taille
                                                   </span>
                                                   <span>Arch</span>
                                                   <span>Créée</span>
                                                   <span className="w-14" />
                                                </div>
                                                {repo.tags.map((tag) => {
                                                   const key = `${repo.name}@${tag.name}`;
                                                   const busy = busyKey === key;
                                                   return (
                                                      <div
                                                         key={tag.name}
                                                         className="grid grid-cols-[minmax(4rem,1fr)_minmax(5rem,1fr)_auto_auto_auto_auto] gap-2 px-3 py-1.5 text-xs border-t border-border/40 items-center min-w-130"
                                                      >
                                                         <span className="font-mono">
                                                            {tag.name}
                                                         </span>
                                                         <span
                                                            className="font-mono text-muted-foreground truncate"
                                                            title={
                                                               tag.digest ||
                                                               undefined
                                                            }
                                                         >
                                                            {shortDigest(
                                                               tag.digest,
                                                            )}
                                                         </span>
                                                         <span className="text-right text-muted-foreground tabular-nums whitespace-nowrap">
                                                            {formatSize(
                                                               tag.size,
                                                            )}
                                                         </span>
                                                         <span className="font-mono text-muted-foreground whitespace-nowrap">
                                                            {[
                                                               tag.os,
                                                               tag.architecture,
                                                            ]
                                                               .filter(Boolean)
                                                               .join("/") ||
                                                               "—"}
                                                         </span>
                                                         <span className="text-muted-foreground whitespace-nowrap">
                                                            {formatDate(
                                                               tag.created,
                                                            )}
                                                         </span>
                                                         <div className="flex items-center justify-end gap-0.5">
                                                            <button
                                                               type="button"
                                                               onClick={() =>
                                                                  setDetail({
                                                                     repository:
                                                                        repo.name,
                                                                     tag: tag.name,
                                                                  })
                                                               }
                                                               className={cn(
                                                                  buttonVariants(
                                                                     {
                                                                        variant:
                                                                           "ghost",
                                                                        size: "icon",
                                                                     },
                                                                  ),
                                                                  "h-7 w-7",
                                                               )}
                                                               title="Détails du tag"
                                                            >
                                                               <InfoIcon className="size-3.5" />
                                                            </button>
                                                            <button
                                                               type="button"
                                                               disabled={
                                                                  busy ||
                                                                  gcRunning ||
                                                                  !tag.digest
                                                               }
                                                               onClick={() =>
                                                                  handleDeleteTag(
                                                                     repo,
                                                                     tag,
                                                                  )
                                                               }
                                                               className={cn(
                                                                  buttonVariants(
                                                                     {
                                                                        variant:
                                                                           "ghost",
                                                                        size: "icon",
                                                                     },
                                                                  ),
                                                                  "h-7 w-7 text-destructive hover:text-destructive",
                                                               )}
                                                               title="Supprimer ce tag"
                                                            >
                                                               {busy ? (
                                                                  <Loader2Icon className="size-3.5 animate-spin" />
                                                               ) : (
                                                                  <Trash2Icon className="size-3.5" />
                                                               )}
                                                            </button>
                                                         </div>
                                                      </div>
                                                   );
                                                })}
                                             </div>
                                          )}
                                       </div>
                                    )}
                                 </TableCell>
                                 <TableCell className="text-right align-top tabular-nums">
                                    {repo.tags?.length ?? 0}
                                 </TableCell>
                              </TableRow>
                           );
                        })}
                     </TableBody>
                  </Table>
               )}

               {error && repositories.length > 0 && (
                  <p className="text-amber-500 text-xs">{error}</p>
               )}
            </CardContent>
         </Card>

         <Card className="mt-4">
            <CardContent className="pt-4">
               <p className="text-sm text-muted-foreground mb-2">
                  Connexion au registry
               </p>
               <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                  <code className="flex-1 text-xs sm:text-sm font-mono break-all">
                     {LOGIN_CMD}
                  </code>
                  <button
                     type="button"
                     onClick={copyLogin}
                     className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "shrink-0 h-8 w-8",
                     )}
                     title={copied ? "Copié !" : "Copier"}
                  >
                     {copied ? (
                        <CheckIcon className="size-4 text-green-500" />
                     ) : (
                        <CopyIcon className="size-4" />
                     )}
                  </button>
               </div>
            </CardContent>
         </Card>

         <TagDetailDialog
            open={Boolean(detail)}
            onOpenChange={(o) => {
               if (!o) setDetail(null);
            }}
            repository={detail?.repository}
            tagName={detail?.tag}
         />
      </>
   );
}
