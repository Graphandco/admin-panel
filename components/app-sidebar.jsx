"use client";

import * as React from "react";
import {
   Container,
   Home,
   UsersIcon,
   FileTextIcon,
   PlusIcon,
   Globe,
} from "lucide-react";
// import { SiTailscale } from "react-icons/si";

import { NavMain } from "@/components/nav-main";
import { NavAgence } from "@/components/nav-agence";
import { NavReseau } from "@/components/nav-reseau";
import { NavUser } from "@/components/nav-user";
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarHeader,
   SidebarRail,
   SidebarMenuItem,
   SidebarMenu,
   SidebarGroup,
   SidebarMenuButton,
   useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";

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

   vpsItems: [
      {
         title: "Docker",
         url: "/docker",
         icon: Container,
         // isActive: true,
         items: [
            {
               title: "Containers",
               url: "/docker",
            },
            {
               title: "Cheatsheet",
               url: "/docker/cheatsheet",
            },
         ],
      },
      {
         title: "Wordpress",
         url: "/wordpress/dashboard",
         icon: WordPressIcon,
         items: [
            {
               title: "Tableau de bord",
               url: "/wordpress/dashboard",
            },
            {
               title: "Sites",
               url: "/wordpress/sites",
            },
            {
               title: "Extensions",
               url: "/wordpress/plugins",
            },
            {
               title: "Connexions",
               url: "/wordpress/connexions",
            },
         ],
      },
      // {
      //    title: "Documentation",
      //    url: "#",
      //    icon: BookOpen,
      //    items: [
      //       {
      //          title: "Introduction",
      //          url: "#",
      //       },
      //       {
      //          title: "Get Started",
      //          url: "#",
      //       },
      //       {
      //          title: "Tutorials",
      //          url: "#",
      //       },
      //       {
      //          title: "Changelog",
      //          url: "#",
      //       },
      //    ],
      // },
      // {
      //    title: "Settings",
      //    url: "#",
      //    icon: Settings2,
      //    items: [
      //       {
      //          title: "General",
      //          url: "#",
      //       },
      //       {
      //          title: "Team",
      //          url: "#",
      //       },
      //       {
      //          title: "Billing",
      //          url: "#",
      //       },
      //       {
      //          title: "Limits",
      //          url: "#",
      //       },
      //    ],
      // },
   ],
   agenceItems: [
      {
         title: "Clients",
         url: "/clients",
         icon: UsersIcon,
         items: [
            { title: "Liste", url: "/clients" },
            { title: "Factures", url: "/clients/factures" },
            { title: "Contrats", url: "/clients/contrats" },
         ],
      },
      {
         title: "Sites",
         url: "/agence/sites",
         icon: Globe,
      },
      {
         title: "Ajouter",
         url: "/clients/generators/nouveau-client",
         icon: PlusIcon,
         items: [
            { title: "Nouveau client", url: "/clients/generators/nouveau-client" },
            { title: "Nouvelle facture", url: "/clients/generators/facture" },
            { title: "Nouveau contrat", url: "/clients/generators/contrat" },
         ],
      },
   ],
   reseauItems: [
      {
         title: "Tailscale",
         url: "/tailscale",
         icon: TailscaleIcon,
      },
   ],
};

export function AppSidebar({ ...props }) {
   const { isMobile, setOpenMobile } = useSidebar();

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
                     >
                        <Home className="size-4 shrink-0" />
                        <span>Accueil</span>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
               </SidebarMenu>
            </SidebarGroup>
            <NavMain items={sidebarData.vpsItems} />
            <NavAgence items={sidebarData.agenceItems} />
            <NavReseau items={sidebarData.reseauItems} />
         </SidebarContent>
         <SidebarFooter className="text-white">
            <NavUser user={sidebarData.user} />
         </SidebarFooter>
         <SidebarRail />
      </Sidebar>
   );
}
