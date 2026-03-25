"use client";

import { usePathname } from "next/navigation";
import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavCollapsibleItem } from "@/components/nav-collapsible-item";
import { isNavLinkActive } from "@/lib/nav-matches";

export function NavMain({ items }) {
   const pathname = usePathname();
   return (
      <SidebarGroup>
         <SidebarGroupLabel>VPS</SidebarGroupLabel>
         <SidebarMenu>
            {items.map((item) =>
               item.items?.length ? (
                  <NavCollapsibleItem
                     key={item.title}
                     item={item}
                     triggerClassName="group/trigger text-white hover:text-card"
                  />
               ) : (
                  <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton
                        render={<a href={item.url} />}
                        isActive={isNavLinkActive(pathname, item.url)}
                     >
                        {item.icon && <item.icon />}
                        <span className="">{item.title}</span>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
               ),
            )}
         </SidebarMenu>
      </SidebarGroup>
   );
}
