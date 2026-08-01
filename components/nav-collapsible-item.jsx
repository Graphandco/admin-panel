"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
   SidebarMenuItem,
   SidebarMenuButton,
   SidebarMenuSub,
   SidebarMenuSubButton,
   SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
   pathnameMatchesNavSection,
   isNavSubItemActive,
} from "@/lib/nav-matches";
import { notificationBadgeClassName } from "@/lib/notification-badge";
import { cn } from "@/lib/utils";

function NavCountBadge({ count }) {
   if (!count || count < 1) return null;
   return (
      <span className={notificationBadgeClassName}>
         {count > 99 ? "99+" : count}
      </span>
   );
}

/**
 * Sous-menu sidebar : ouverture au clic sur le trigger,
 * reste déplié lorsque la route active est dans la section.
 */
export function NavCollapsibleItem({ item, triggerClassName }) {
   const pathname = usePathname();
   const matches = pathnameMatchesNavSection(pathname, item);
   const [open, setOpen] = useState(matches);

   useEffect(() => {
      if (matches) setOpen(true);
      else setOpen(false);
   }, [matches, pathname]);

   const parentBadge = item.badge || 0;

   return (
      <Collapsible
         open={matches || open}
         onOpenChange={(v) => {
            if (!matches) setOpen(v);
         }}
         className="group/collapsible"
      >
         <SidebarMenuItem>
            <CollapsibleTrigger
               render={
                  <SidebarMenuButton
                     tooltip={item.title}
                     className={cn(
                        "hover:text-background data-open:hover:text-background",
                        triggerClassName,
                     )}
                  />
               }
            >
               {item.icon && <item.icon />}
               <span>{item.title}</span>
               <span className="ml-auto flex items-center gap-1">
                  <NavCountBadge count={parentBadge} />
                  <ChevronRight className="transition-transform duration-200 group-data-panel-open/trigger:rotate-90" />
               </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
               <SidebarMenuSub>
                  {item.items.map((subItem) => (
                     <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                           render={<a href={subItem.url} />}
                           isActive={isNavSubItemActive(
                              pathname,
                              subItem,
                              item.items,
                           )}
                        >
                           <span className="flex-1">{subItem.title}</span>
                           <NavCountBadge count={subItem.badge} />
                        </SidebarMenuSubButton>
                     </SidebarMenuSubItem>
                  ))}
               </SidebarMenuSub>
            </CollapsibleContent>
         </SidebarMenuItem>
      </Collapsible>
   );
}
