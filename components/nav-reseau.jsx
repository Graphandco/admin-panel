"use client";

import { usePathname } from "next/navigation";
import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from "@/components/ui/sidebar";
import { isNavLinkActive } from "@/lib/nav-matches";

export function NavReseau({ items }) {
   const pathname = usePathname();
   return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
         <SidebarGroupLabel>Réseau</SidebarGroupLabel>
         <SidebarMenu>
            {items.map((item) => (
               <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                     render={<a href={item.url} />}
                     isActive={isNavLinkActive(pathname, item.url)}
                  >
                     {item.icon && <item.icon />}
                     <span className="">{item.title}</span>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            ))}
         </SidebarMenu>
      </SidebarGroup>
   );
}
