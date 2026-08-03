"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "lucide-react";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SEGMENT_LABELS = {
   wordpress: "Wordpress",
   dashboard: "Tableau de bord",
   sites: "Sites",
   monitoring: "Monitoring",
   agence: "Agence",
   plugins: "Extensions",
   connexions: "Connexions",
   docker: "Docker",
   registry: "Images",
   cheatsheet: "Cheatsheet",
   vps: "VPS",
   stats: "Stats",
   sql: "SQL",
   clients: "Clients",
   factures: "Factures",
   devis: "Devis",
   contrats: "Contrats",
   generators: "Ajouter",
   "nouveau-client": "Nouveau client",
   facture: "Génération de facture",
   contrat: "Génération de contrat",
   tailscale: "Tailscale",
   nas: "NAS Unraid",
   caddy: "Caddy",
   mapping: "Mapping",
   redirects: "Redirections",
   ssl: "SSL",
   securite: "Sécurité",
   fail2ban: "Fail2Ban",
   ufw: "UFW",
   "mises-a-jour": "Mises à jour",
   backups: "Sauvegardes",
   cron: "Cron",
   stockage: "Stockage",
   fichiers: "Fichiers",
   settings: "Réglages",
   logs: "Logs",
   deploy: "Déploiements",
   git: "Git",
};

function segmentLabel(segment, segments) {
   if (segment === "sites" && segments[0] === "wordpress") return "Stats";
   if (segment === "stats" && segments[0] === "vps") return "Stats VPS";
   return SEGMENT_LABELS[segment] || segment;
}

function getBreadcrumbSegments(pathname) {
   const segments = pathname.split("/").filter(Boolean);
   if (segments.length === 0) return [];
   return segments.map((segment, i) => {
      const href = "/" + segments.slice(0, i + 1).join("/");
      const label = segmentLabel(segment, segments);
      return { href, label };
   });
}

export function AppBreadcrumbs() {
   const pathname = usePathname();
   const segments = getBreadcrumbSegments(pathname);

   if (pathname === "/" || pathname === "") {
      return (
         <Breadcrumb>
            <BreadcrumbList>
               <BreadcrumbItem>
                  <BreadcrumbLink href="/" render={<Link href="/" />}>
                     <HomeIcon className="size-4" />
                  </BreadcrumbLink>
               </BreadcrumbItem>
            </BreadcrumbList>
         </Breadcrumb>
      );
   }

   return (
      <Breadcrumb>
         <BreadcrumbList>
            <BreadcrumbItem>
               <BreadcrumbLink href="/" render={<Link href="/" />}>
                  <HomeIcon className="size-4" />
               </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((seg, i) => (
               <React.Fragment key={seg.href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                     {i === segments.length - 1 ? (
                        <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                     ) : (
                        <BreadcrumbLink
                           href={seg.href}
                           render={<Link href={seg.href} />}
                        >
                           {seg.label}
                        </BreadcrumbLink>
                     )}
                  </BreadcrumbItem>
               </React.Fragment>
            ))}
         </BreadcrumbList>
      </Breadcrumb>
   );
}
