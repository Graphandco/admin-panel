"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
   Archive,
   CalendarClock,
   ChartColumnIncreasing,
   Database,
   FileText,
   FolderOpen,
   HardDrive,
   Home,
   Lock,
   Globe,
   PieChart,
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
import { cn } from "@/lib/utils";

function WordPressIcon({ className, ...props }) {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 512 512"
         aria-hidden
         fill="currentColor"
         className={cn("size-4 shrink-0", className)}
         {...props}
      >
         <path d="M256 8a248 248 0 1 0 0 496 248 248 0 1 0 0-496zM33 256c0-32.3 6.9-63 19.3-90.7L158.7 456.7C84.3 420.5 33 344.2 33 256zM256 479c-21.9 0-43-3.2-63-9.1l66.9-194.4 68.5 187.8c.5 1.1 1 2.1 1.6 3.1-23.1 8.1-48 12.6-74 12.6zm30.7-327.5c13.4-.7 25.5-2.1 25.5-2.1 12-1.4 10.6-19.1-1.4-18.4 0 0-36.1 2.8-59.4 2.8-21.9 0-58.7-2.8-58.7-2.8-12-.7-13.4 17.7-1.4 18.4 0 0 11.4 1.4 23.4 2.1l34.7 95.2-48.8 146.3-81.2-241.5c13.4-.7 25.5-2.1 25.5-2.1 12-1.4 10.6-19.1-1.4-18.4 0 0-36.1 2.8-59.4 2.8-4.2 0-9.1-.1-14.4-.3 39.9-60.5 108.4-100.5 186.3-100.5 58 0 110.9 22.2 150.6 58.5-1-.1-1.9-.2-2.9-.2-21.9 0-37.4 19.1-37.4 39.6 0 18.4 10.6 33.9 21.9 52.3 8.5 14.8 18.4 33.9 18.4 61.5 0 19.1-7.3 41.2-17 72.1l-22.2 74.3-80.7-239.6zm81.4 297.2l68.1-196.9c12.7-31.8 17-57.2 17-79.9 0-8.2-.5-15.8-1.5-22.9 17.4 31.8 27.3 68.2 27.3 107 0 82.3-44.6 154.1-110.9 192.7z" />
      </svg>
   );
}

function DockerIcon({ className, ...props }) {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 748.77 537.58"
         aria-hidden
         fill="currentColor"
         className={cn("size-4 shrink-0", className)}
         {...props}
      >
         <path d="M741.35,202.82c-15.33-10.1-34.15-16.12-54.37-16.12-2.33,0-4.62.08-6.9.22l.3-.03c-11.15.03-22.05,1.03-32.65,2.87l1.15-.17c-5.88-33.93-25.62-62.37-53.05-79.77l-.47-.27-10.73-6.2-7.05,10.2c-8.4,12.8-14.97,27.7-18.9,43.62l-.2.97c-2.23,8.1-3.5,17.4-3.5,27,0,20.78,6,40.13,16.35,56.45l-.25-.43c-15.92,7.47-34.53,12.2-54.1,13.1H23.43c-12.9.03-23.35,10.45-23.4,23.33H.03c-.03,1.4-.03,3.07-.03,4.75,0,43.77,7.93,85.7,22.43,124.43l-.8-2.45c13.95,40.82,40.3,74.38,74.5,97.03l.7.43c43.6,22.57,95.2,35.8,149.87,35.8,5.17,0,10.3-.12,15.42-.35l-.73.02h1.5c31.8,0,62.88-3.03,93-8.8l-3.08.5c44.87-8.4,84.87-23.47,121.13-44.33l-1.85.97c31.42-18.38,58.27-40.53,81.13-66.3l.3-.35c33.13-39,60.07-84.53,78.63-134.12l1.03-3.12h6.9c1.38.05,2.97.1,4.58.1,30.65,0,58.5-12.03,79.08-31.63l-.05.05c9.43-8.95,16.9-19.83,21.82-32.03l.23-.6,3.05-8.98-7.43-5.8ZM69.12,239.87h66.15c3.17-.03,5.75-2.6,5.75-5.77h0v-58.9c0-3.17-2.58-5.75-5.75-5.77h-66.15c-3.18.03-5.75,2.6-5.75,5.77h0v58.93c0,3.17,2.57,5.75,5.75,5.75h.02-.02ZM160.22,239.87h66.1c3.17,0,5.77-2.57,5.77-5.77h0v-58.9c0-3.17-2.57-5.75-5.75-5.77h-66.15c-3.2,0-5.8,2.6-5.8,5.8h0v58.87c.02,3.2,2.6,5.77,5.8,5.77h.02ZM252.67,239.87h66.15c3.17-.03,5.75-2.6,5.75-5.77h0v-58.9c0-3.17-2.57-5.75-5.75-5.77h-66.15c-3.17.03-5.75,2.6-5.75,5.77h0v58.9c0,3.17,2.57,5.77,5.77,5.77h-.03ZM344.07,239.87h66.07c3.2,0,5.78-2.57,5.8-5.77v-58.87h0c0-3.2-2.6-5.8-5.8-5.8h-66.07c-3.17,0-5.77,2.57-5.77,5.77h0v58.93c0,3.17,2.57,5.75,5.75,5.75h.03ZM160.22,155.18h66.1c3.2-.03,5.77-2.6,5.77-5.8h0v-58.87h0c0-3.17-2.57-5.77-5.77-5.77h-66.1c-3.2,0-5.77,2.57-5.8,5.77v58.87c.02,3.2,2.6,5.77,5.8,5.8h0ZM252.67,155.18h66.15c3.17-.03,5.75-2.62,5.75-5.8h0v-58.87h0c0-3.17-2.57-5.77-5.77-5.77h-66.07c-3.17,0-5.77,2.57-5.77,5.77h0v58.87c.03,3.2,2.57,5.77,5.77,5.8h-.05ZM344.07,155.18h66.07c3.2-.03,5.78-2.6,5.8-5.8v-58.87c-.02-3.2-2.6-5.77-5.8-5.77h-66.07c-3.17,0-5.77,2.57-5.77,5.77h0v58.87c0,3.2,2.57,5.77,5.77,5.8h0ZM344.07,70.47h66.07c3.2,0,5.8-2.6,5.8-5.8h0V5.77c-.02-3.2-2.6-5.77-5.8-5.77h-66.07c-3.17,0-5.77,2.58-5.77,5.77h0v58.92c0,3.17,2.57,5.75,5.75,5.75h.03v.03ZM436.25,239.87h66.1c3.2,0,5.78-2.57,5.8-5.77v-58.87h0c0-3.2-2.6-5.8-5.8-5.8h-66.1c-3.2,0-5.78,2.57-5.78,5.77v58.9c0,3.17,2.58,5.77,5.78,5.77h0Z" />
      </svg>
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
         icon: Globe,
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
         icon: DockerIcon,
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
         title: "Stockage",
         url: "/vps/stockage",
         icon: PieChart,
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
                        className="text-white hover:text-background"
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
