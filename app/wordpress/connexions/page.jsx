import Connexions from "@/components/wordpress/Connexions";

export default function WordPressConnexionsPage() {
   return (
      <div className="space-y-6">
         <div>
            <h2 className="text-xl font-semibold">Connexions</h2>
            <p className="text-muted-foreground text-sm mt-1">
               Dernières connexions au backoffice WordPress (10 dernières
               sessions actives).
            </p>
         </div>
         <Connexions />
      </div>
   );
}
