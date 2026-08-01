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
import { isNavFlatItemActive } from "@/lib/nav-matches";
import { notificationBadgeClassName } from "@/lib/notification-badge";

function NavCountBadge({ count }) {
   if (!count || count < 1) return null;
   return (
      <span className={`ml-auto ${notificationBadgeClassName}`}>
         {count > 99 ? "99+" : count}
      </span>
   );
}

export function NavSection({ label, items, hideOnIconCollapse = false }) {
   const pathname = usePathname();
   return (
      <SidebarGroup
         className={
            hideOnIconCollapse
               ? "group-data-[collapsible=icon]:hidden"
               : undefined
         }
      >
         <SidebarGroupLabel>{label}</SidebarGroupLabel>
         <SidebarMenu>
            {items.map((item) =>
               item.items?.length ? (
                  <NavCollapsibleItem
                     key={item.title}
                     item={item}
                     triggerClassName="group/trigger text-white hover:text-background"
                  />
               ) : (
                  <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton
                        render={<a href={item.url} />}
                        isActive={isNavFlatItemActive(pathname, item, items)}
                     >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <NavCountBadge count={item.badge} />
                     </SidebarMenuButton>
                  </SidebarMenuItem>
               ),
            )}
         </SidebarMenu>
      </SidebarGroup>
   );
}

export function NavMain({ items, label = "VPS" }) {
   return <NavSection label={label} items={items} />;
}
