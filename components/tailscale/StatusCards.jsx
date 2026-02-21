import {
   Card,
   CardAction,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Smartphone, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";

export function StatusCards({
   total = 0,
   active = 0,
   inactive = 0,
   onRefresh,
   loading,
}) {
   return (
      <>
         <div className="flex justify-end items-center pb-4 px-1">
            {onRefresh && (
               <button
                  onClick={onRefresh}
                  disabled={loading}
                  className={cn(buttonVariants({}))}
               >
                  {loading ? (
                     <Loader2Icon className="size-4 mr-1 animate-spin" />
                  ) : (
                     <RefreshCwIcon className="size-4 mr-1" />
                  )}
                  Actualiser
               </button>
            )}
         </div>
         <div className="flex flex-wrap gap-6">
            <Card className="w-full sm:w-xs">
               <CardHeader>
                  <CardTitle>
                     <Smartphone
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
                  <p className="text-lg uppercase font-light">Appareils</p>
               </CardContent>
            </Card>
            <Card className="w-full sm:w-xs">
               <CardHeader>
                  <CardTitle>
                     <Wifi
                        size={36}
                        className="text-green-500 p-2 bg-green-500/10 border border-green-500/20 rounded-md"
                     />
                  </CardTitle>
                  <CardAction>
                     <span className="text-white text-3xl font-bold">
                        {active}
                     </span>
                  </CardAction>
               </CardHeader>
               <CardContent>
                  <p className="text-lg uppercase font-light">Actifs</p>
               </CardContent>
            </Card>
            <Card className="w-full sm:w-xs">
               <CardHeader>
                  <CardTitle>
                     <WifiOff
                        size={36}
                        className="text-slate-500 p-2 bg-slate-500/10 border border-slate-500/20 rounded-md"
                     />
                  </CardTitle>
                  <CardAction>
                     <span className="text-white text-3xl font-bold">
                        {inactive}
                     </span>
                  </CardAction>
               </CardHeader>
               <CardContent>
                  <p className="text-lg uppercase font-light">Inactifs</p>
               </CardContent>
            </Card>
         </div>
      </>
   );
}
