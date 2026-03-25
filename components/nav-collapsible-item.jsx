"use client";

import { useEffect, useRef, useState } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";

const HOVER_LEAVE_MS = 150;

/**
 * Sous-menu sidebar : ouverture au survol (desktop), au clic (mobile),
 * reste déplié lorsque la route active est dans la section.
 */
export function NavCollapsibleItem({ item, triggerClassName }) {
   const pathname = usePathname();
   const isMobile = useIsMobile();
   const matches = pathnameMatchesNavSection(pathname, item);
   const [open, setOpen] = useState(matches);
   const leaveTimerRef = useRef(null);

   useEffect(() => {
      if (matches) setOpen(true);
      else setOpen(false);
   }, [matches, pathname]);

   useEffect(() => {
      return () => {
         if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      };
   }, []);

   const handleMouseEnter = () => {
      if (isMobile) return;
      if (leaveTimerRef.current) {
         clearTimeout(leaveTimerRef.current);
         leaveTimerRef.current = null;
      }
      setOpen(true);
   };

   const handleMouseLeave = () => {
      if (isMobile) return;
      if (matches) return;
      leaveTimerRef.current = setTimeout(() => {
         setOpen(false);
         leaveTimerRef.current = null;
      }, HOVER_LEAVE_MS);
   };

   return (
      <Collapsible
         open={matches || open}
         onOpenChange={(v) => {
            if (!matches) setOpen(v);
         }}
         className="group/collapsible"
      >
         <SidebarMenuItem
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
         >
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
