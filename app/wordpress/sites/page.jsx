import SitesCards from "@/components/wordpress/SitesCards";

export default function WordPressSitesPage() {
   return (
      <div className="space-y-6">
         <div>
            <h2 className="text-xl font-semibold">Sites</h2>
            <p className="text-muted-foreground text-sm mt-1">
               Statistiques par type de contenu et espace disque par site ou
               pour l&apos;ensemble du multisite.
            </p>
         </div>
         <SitesCards />
      </div>
   );
}
