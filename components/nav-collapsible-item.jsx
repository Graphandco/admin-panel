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
               render={<SidebarMenuButton tooltip={item.title} />}
               className={triggerClassName}
            >
               {item.icon && <item.icon />}
               <span>{item.title}</span>
               <ChevronRight className="ml-auto transition-transform duration-200 group-data-panel-open/trigger:rotate-90" />
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
                           <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                     </SidebarMenuSubItem>
                  ))}
               </SidebarMenuSub>
            </CollapsibleContent>
         </SidebarMenuItem>
      </Collapsible>
   );
}
