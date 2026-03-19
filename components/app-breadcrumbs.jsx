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
   agence: "Agence",
   plugins: "Extensions",
   connexions: "Connexions",
   docker: "Docker",
   vps: "VPS",
   stats: "Stats VPS",
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
};

function getBreadcrumbSegments(pathname) {
   const segments = pathname.split("/").filter(Boolean);
   if (segments.length === 0) return [];
   return segments.map((segment, i) => {
      const href = "/" + segments.slice(0, i + 1).join("/");
      const label = SEGMENT_LABELS[segment] || segment;
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
