import {
   Card,
   CardAction,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";

export function StatusCard({ Icon, color, label, value }) {
   const iconClass =
      color === "white"
         ? "text-white p-2 bg-white/10 border border-white/20 rounded-md"
         : `text-${color}-500 p-2 bg-${color}-500/10 border border-${color}-500/20 rounded-md`;

   return (
      <Card>
         <CardHeader>
            <CardTitle>
               <Icon size={36} className={iconClass} />
            </CardTitle>
            <CardAction>
               <span className="text-white text-xl md:text-2xl lg:text-3xl font-bold">
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
