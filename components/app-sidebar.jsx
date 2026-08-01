"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
   Archive,
   CalendarClock,
   ChartColumnIncreasing,
   Container,
   Database,
   FileText,
   FolderOpen,
   HardDrive,
   Home,
   Lock,
   Monitor,
   Plus,
   Rocket,
   ScrollText,
   ShoppingCart,
   Users,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { NavSection } from "@/components/nav-main";
import { NavAgence } from "@/components/nav-agence";
import { NavReseau } from "@/components/nav-reseau";
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarRail,
   useSidebar,
} from "@/components/ui/sidebar";
import { isNavLinkActive } from "@/lib/nav-matches";
import { useUpdateCounts } from "@/hooks/use-update-counts";

function WordPressIcon(props) {
   return (
      <Image
         src="/wordpress.svg"
         alt="WordPress"
         width={16}
         height={16}
         {...props}
      />
   );
}

function TailscaleIcon(props) {
   return (
      <Image
         src="/tailscale.png"
         alt="Tailscale"
         className="fill-white"
         width={16}
         height={16}
         {...props}
      />
   );
}

const sidebarData = {
   user: {
      name: "Régis",
      email: "contact@graphandco.com",
      avatar: "/avatar.webp",
   },
   monitoring: [
      {
         title: "Stats VPS",
         url: "/vps/stats",
         icon: ChartColumnIncreasing,
      },
      {
         title: "Sites",
         url: "/monitoring/sites",
         icon: Monitor,
      },
      {
         title: "Logs",
         url: "/logs",
         icon: ScrollText,
      },
   ],
   stack: [
      {
         title: "Docker",
         url: "/docker",
         icon: Container,
         items: [
            { title: "Stats", url: "/docker/stats" },
            { title: "Containers", url: "/docker" },
            { title: "Images", url: "/docker/registry" },
            { title: "Cheatsheet", url: "/docker/cheatsheet" },
         ],
      },
      {
         title: "Caddy",
         url: "/caddy",
         icon: ShoppingCart,
         items: [
            { title: "Tableau de bord", url: "/caddy" },
            { title: "Mapping", url: "/caddy/mapping" },
            { title: "Redirections", url: "/caddy/redirects" },
            { title: "SSL", url: "/caddy/ssl" },
         ],
      },
      {
         title: "Wordpress",
         url: "/wordpress/dashboard",
         icon: WordPressIcon,
         items: [
            { title: "Tableau de bord", url: "/wordpress/dashboard" },
            { title: "Stats", url: "/wordpress/sites" },
            { title: "Extensions", url: "/wordpress/plugins" },
            { title: "Connexions", url: "/wordpress/connexions" },
         ],
      },
      {
         title: "Déploiements",
         url: "/deploy",
         icon: Rocket,
      },
   ],
   systeme: [
      {
         title: "Sécurité",
         url: "/vps/securite/fail2ban",
         icon: Lock,
         items: [
            { title: "Fail2Ban", url: "/vps/securite/fail2ban" },
            { title: "UFW", url: "/vps/securite/ufw" },
            { title: "Mises à jour", url: "/vps/securite/mises-a-jour" },
         ],
      },
      {
         title: "SQL",
         url: "/vps/sql",
         icon: Database,
      },
      {
         title: "Sauvegardes",
         url: "/vps/backups",
         icon: Archive,
      },
      {
         title: "Cron",
         url: "/vps/cron",
         icon: CalendarClock,
      },
      {
         title: "Fichiers",
         url: "/vps/fichiers",
         icon: FolderOpen,
      },
   ],
   agence: [
      {
         title: "Clients",
         url: "/clients",
         icon: Users,
      },
      {
         title: "Documents",
         url: "/clients/factures",
         icon: FileText,
         items: [
            { title: "Factures", url: "/clients/factures" },
            { title: "Devis", url: "/clients/devis" },
            { title: "Contrats", url: "/clients/contrats" },
         ],
      },
      {
         title: "Ajouter",
         url: "/clients/generators/nouveau-client",
         icon: Plus,
         items: [
            {
               title: "Nouveau client",
               url: "/clients/generators/nouveau-client",
            },
            { title: "Nouveau site", url: "/clients/generators/site" },
            { title: "Nouvelle facture", url: "/clients/generators/facture" },
            { title: "Nouveau devis", url: "/clients/generators/devis" },
            { title: "Nouveau contrat", url: "/clients/generators/contrat" },
         ],
      },
   ],
   reseau: [
      {
         title: "NAS",
         url: "/nas",
         icon: HardDrive,
      },
      {
         title: "Tailscale",
         url: "/tailscale",
         icon: TailscaleIcon,
      },
   ],
};

function withUpdateBadges(items, counts) {
   return items.map((item) => {
      if (item.title === "Sécurité") {
         return {
            ...item,
            badge: counts?.apt || 0,
            items: item.items?.map((sub) =>
               sub.url === "/vps/securite/mises-a-jour"
                  ? { ...sub, badge: counts?.apt || 0 }
                  : sub,
            ),
         };
      }
      if (item.title === "Docker") {
         return {
            ...item,
            badge: counts?.docker || 0,
            items: item.items?.map((sub) =>
               sub.url === "/docker/registry"
                  ? { ...sub, badge: counts?.docker || 0 }
                  : sub,
            ),
         };
      }
      if (item.title === "Wordpress") {
         return {
            ...item,
            badge: counts?.wordpress || 0,
            items: item.items?.map((sub) =>
               sub.url === "/wordpress/plugins"
                  ? { ...sub, badge: counts?.wordpress || 0 }
                  : sub,
            ),
         };
      }
      return item;
   });
}

export function AppSidebar({ ...props }) {
   const { isMobile, setOpenMobile } = useSidebar();
   const pathname = usePathname();
   const { data: counts } = useUpdateCounts();

   const stack = withUpdateBadges(sidebarData.stack, counts);
   const systeme = withUpdateBadges(sidebarData.systeme, counts);

   return (
      <Sidebar collapsible="icon" {...props}>
         <SidebarHeader>
            <Link href="/" className="flex items-center px-2 gap-4">
               <Image
                  src="/logo.svg"
                  alt="Graph and Co"
                  width={32}
                  height={32}
               />
               <div className="grid flex-1 leading-tight">
                  <span className="truncate text-sm font-medium text-white">
                     Admin Panel
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                     Graph and Co
                  </span>
               </div>
            </Link>
         </SidebarHeader>
         <SidebarContent className="text-white">
            <SidebarGroup>
               <SidebarMenu>
                  <SidebarMenuItem>
                     <SidebarMenuButton
                        render={
                           <Link
                              href="/"
                              onClick={() => isMobile && setOpenMobile(false)}
                           />
                        }
                        className="text-white hover:text-card"
                        isActive={isNavLinkActive(pathname, "/")}
                     >
                        <Home className="size-4 shrink-0" />
                        <span>Accueil</span>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
               </SidebarMenu>
            </SidebarGroup>
            <NavSection label="Monitoring" items={sidebarData.monitoring} />
            <NavSection label="Stack" items={stack} />
            <NavSection label="Système" items={systeme} />
            <NavAgence items={sidebarData.agence} />
            <NavReseau items={sidebarData.reseau} />
         </SidebarContent>
         <SidebarFooter className="text-white">
            <NavUser user={sidebarData.user} />
         </SidebarFooter>
         <SidebarRail />
      </Sidebar>
   );
}
