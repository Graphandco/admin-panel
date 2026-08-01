"use client";

import { NavSection } from "@/components/nav-main";

export function NavAgence({ items }) {
   return <NavSection label="Agence" items={items} hideOnIconCollapse />;
}
