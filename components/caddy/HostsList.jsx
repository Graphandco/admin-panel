/**
 * Liste d’hôtes en colonne (évite une longue ligne séparée par des virgules).
 */
export function HostsList({ hosts }) {
   if (!hosts?.length) {
      return (
         <span className="text-muted-foreground">(défaut / filtre)</span>
      );
   }
   return (
      <ul className="m-0 list-none space-y-1 pl-0 text-sm max-w-md">
         {hosts.map((h) => (
            <li key={h} className="wrap-break-word">
               {h}
            </li>
         ))}
      </ul>
   );
}
