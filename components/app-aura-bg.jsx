import { cn } from "@/lib/utils";

/**
 * Fond Aura « Glass Moonstone »
 * @see https://auragradients.vercel.app/?gradient=glass-moonstone&category=glass
 * @param {object} props
 * @param {boolean} [props.contained] — absolute dans un parent (Sheet), pas fixed viewport
 * @param {string} [props.className]
 */
export function AppAuraBg({ contained = false, className } = {}) {
   return (
      <div
         className={cn(
            contained ? "app-aura-bg-contained" : "app-aura-bg",
            className,
         )}
         aria-hidden="true"
      >
         <div className="app-aura-layer app-aura-l1" />
         <div className="app-aura-layer app-aura-l2" />
         <div className="app-aura-layer app-aura-l3" />
         <div className="app-aura-layer app-aura-l4" />
      </div>
   );
}
