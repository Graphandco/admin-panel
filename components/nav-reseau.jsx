"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   useSidebar,
} from "@/components/ui/sidebar";
import { isNavLinkActive } from "@/lib/nav-matches";

export function NavReseau({ items }) {
   const pathname = usePathname();
   const { isMobile, setOpenMobile } = useSidebar();
   const closeMobile = () => {
      if (isMobile) setOpenMobile(false);
   };

   return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
         <SidebarGroupLabel>Réseau</SidebarGroupLabel>
         <SidebarMenu>
            {items.map((item) => (
               <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                     render={<Link href={item.url} onClick={closeMobile} />}
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
