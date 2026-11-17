import {
   Card,
   CardAction,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLOR_STYLES = {
   white: "text-white p-2 bg-white/10 border border-white/20 rounded-md",
   green: "text-green-500 p-2 bg-green-500/10 border border-green-500/20 rounded-md",
   amber: "text-amber-500 p-2 bg-amber-500/10 border border-amber-500/20 rounded-md",
   sky: "text-sky-500 p-2 bg-sky-500/10 border border-sky-500/20 rounded-md",
   red: "text-red-500 p-2 bg-red-500/10 border border-red-500/20 rounded-md",
};

export function StatusCard({ Icon, color = "white", label, value, className }) {
   const iconClass = COLOR_STYLES[color] || COLOR_STYLES.white;

   return (
      <Card className={cn("h-full", className)}>
         <CardHeader>
            <CardTitle>
               <Icon size={36} className={iconClass} />
            </CardTitle>
            <CardAction>
               <span className="text-white text-xl md:text-2xl lg:text-3xl font-bold tabular-nums">
                  {value}
               </span>
            </CardAction>
         </CardHeader>
         <CardContent>
            <p className="text-primary md:text-lg uppercase font-light">
               {label}
            </p>
         </CardContent>
      </Card>
   );
}
