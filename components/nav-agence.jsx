"use client";

import { ChevronRight } from "lucide-react";
import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarMenuSub,
   SidebarMenuSubButton,
   SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavAgence({ items }) {
   return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
         <SidebarGroupLabel>Agence</SidebarGroupLabel>
         <SidebarMenu>
            {items.map((item) =>
               item.items?.length ? (
                  <Collapsible
                     key={item.title}
                     defaultOpen={item.isActive}
                     className="group/collapsible"
                  >
                     <SidebarMenuItem>
                        <CollapsibleTrigger
                           render={<SidebarMenuButton tooltip={item.title} />}
                           className="group/trigger hover:text-card"
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
                                    >
                                       <span>{subItem.title}</span>
                                    </SidebarMenuSubButton>
                                 </SidebarMenuSubItem>
                              ))}
                           </SidebarMenuSub>
                        </CollapsibleContent>
                     </SidebarMenuItem>
                  </Collapsible>
               ) : (
                  <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton render={<a href={item.url} />}>
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
