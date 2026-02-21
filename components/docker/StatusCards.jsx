import {
   Card,
   CardAction,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Container, Clock, CircleX } from "lucide-react";

export function StatusCards({
   total = 0,
   running = 0,
   stopped = 0,
}) {
   return (
      <div className="flex flex-wrap gap-6">
            <Card className="w-full sm:w-xs">
               <CardHeader>
                  <CardTitle>
                     <Container
                        size={36}
                        className="text-blue-500 p-2 bg-blue-500/10 border border-blue-500/20 rounded-md"
                     />
                  </CardTitle>
                  <CardAction>
                     <span className="text-white text-3xl font-bold">
                        {total}
                     </span>
                  </CardAction>
               </CardHeader>
               <CardContent>
                  <p className="text-lg uppercase font-light">Containers</p>
               </CardContent>
            </Card>
            <Card className="w-full sm:w-xs">
               <CardHeader>
                  <CardTitle>
                     <Clock
                        size={36}
                        className="text-green-500 p-2 bg-green-500/10 border border-green-500/20 rounded-md"
                     />
                  </CardTitle>
                  <CardAction>
                     <span className="text-white text-3xl font-bold">
                        {running}
                     </span>
                  </CardAction>
               </CardHeader>
               <CardContent>
                  <p className="text-lg uppercase font-light">En cours</p>
               </CardContent>
            </Card>
            <Card className="w-full sm:w-xs">
               <CardHeader>
                  <CardTitle>
                     <CircleX
                        size={36}
                        className="text-slate-500 p-2 bg-slate-500/10 border border-slate-500/20 rounded-md"
                     />
                  </CardTitle>
                  <CardAction>
                     <span className="text-white text-3xl font-bold">
                        {stopped}
                     </span>
                  </CardAction>
               </CardHeader>
               <CardContent>
                  <p className="text-lg uppercase font-light">Arrêtés</p>
               </CardContent>
            </Card>
      </div>
   );
}
