"use client";

import {
   BadgeCheck,
   Bell,
   ChevronsUpDown,
   CreditCard,
   LogOut,
   Sparkles,
   EarthIcon,
   ChartLine,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   SidebarMenu,
   SidebarMenuItem,
   useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavUser({ user }) {
   const { isMobile } = useSidebar();

   return (
      <SidebarMenu>
         <SidebarMenuItem>
            <DropdownMenu>
               <DropdownMenuTrigger
                  nativeButton={false}
                  render={
                     <div
                        role="button"
                        tabIndex={0}
                        className={cn(
                           "ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground gap-2 rounded-md p-2 text-start text-sm group-has-data-[sidebar=menu-action]/menu-item:pe-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 data-active:font-medium flex w-full h-12 items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
                           "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                        )}
                     />
                  }
               >
                  <Avatar className="h-8 w-8 rounded-lg">
                     <AvatarImage src={user.avatar} alt={user.name} />
                     <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                     <span className="truncate font-medium">{user.name}</span>
                     <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
               </DropdownMenuTrigger>
               <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
               >
                  <DropdownMenuGroup>
                     <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                           <Avatar className="h-8 w-8 rounded-lg">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback className="rounded-lg">
                                 CN
                              </AvatarFallback>
                           </Avatar>
                           <div className="grid flex-1 text-left text-sm leading-tight">
                              <span className="truncate font-medium">
                                 {user.name}
                              </span>
                              <span className="truncate text-xs">
                                 {user.email}
                              </span>
                           </div>
                        </div>
                     </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                     <DropdownMenuItem>
                        <Sparkles />
                        Upgrade to Pro
                     </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                     <DropdownMenuItem>
                        <BadgeCheck />
                        Account
                     </DropdownMenuItem>
                     <Link href="https://stats.graphandco.com/" target="_blank">
                        <DropdownMenuItem>
                           <ChartLine />
                           Statistiques Matomo
                        </DropdownMenuItem>
                     </Link>
                     <Link
                        href="https://hpanel.hostinger.com/vps/496857/overview"
                        target="_blank"
                     >
                        <DropdownMenuItem>
                           <EarthIcon />
                           Panel Hostinger
                        </DropdownMenuItem>
                     </Link>
                     <DropdownMenuItem>
                        <Bell />
                        Notifications
                     </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                     <LogOut />
                     Log out
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </SidebarMenuItem>
      </SidebarMenu>
   );
}
