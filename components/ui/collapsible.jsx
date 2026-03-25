"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { cn } from "@/lib/utils";

function Collapsible(props) {
   return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger(props) {
   return (
      <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
   );
}

/**
 * Base UI : la hauteur doit être liée à --collapsible-panel-height + transition + états
 * data-starting-style / data-ending-style (voir doc Base UI Collapsible).
 */
function CollapsibleContent({ className, ...props }) {
   return (
      <CollapsiblePrimitive.Panel
         data-slot="collapsible-content"
         className={cn(
            "overflow-hidden [&[hidden]:not([hidden='until-found'])]:hidden",
            "h-[var(--collapsible-panel-height)]",
            "transition-[height] duration-200 ease-out",
            "data-[starting-style]:h-0 data-[ending-style]:h-0",
            className,
         )}
         {...props}
      />
   );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
