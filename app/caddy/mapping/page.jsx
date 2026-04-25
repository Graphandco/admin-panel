import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { caddyMapping } from "@/app/actions/caddy";
import { HostsList } from "@/components/caddy/HostsList";

export const dynamic = "force-dynamic";

export default async function CaddyMappingPage() {
   let rows = [];
   let error = null;
   try {
      const data = await caddyMapping();
      rows = data.mapping || [];
   } catch (e) {
      error = e.message;
   }

   return (
      <div>
         <h2 className="text-xl font-bold text-white mb-4">Caddy — Mapping</h2>
         <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
            Hôtes reconnus par Caddy, cibles <code>reverse_proxy</code> (réseau Docker) et
            adresses d&apos;écoute. Extrait de la config chargée (API d&apos;admin Caddy).
         </p>
         {error && (
            <p className="text-destructive text-sm mb-4" role="alert">
               {error}
            </p>
         )}
         <div className="rounded-md border border-border/40 overflow-x-auto">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Hôtes</TableHead>
                     <TableHead>Listen</TableHead>
                     <TableHead>Serveur (clé config)</TableHead>
                     <TableHead>Upstream</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {rows.length === 0 && !error ? (
                     <TableRow>
                        <TableCell
                           colSpan={4}
                           className="text-muted-foreground text-sm"
                        >
                           Aucune route reverse_proxy extraite. Vérifiez l&apos;API admin ou
                           la version Caddy.
                        </TableCell>
                     </TableRow>
                  ) : (
                     rows.map((r, i) => (
                        <TableRow key={i}>
                           <TableCell className="max-w-md align-top">
                              <HostsList hosts={r.hosts} />
                           </TableCell>
                           <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                              {r.listen}
                           </TableCell>
                           <TableCell className="text-xs text-muted-foreground">
                              {r.server}
                           </TableCell>
                           <TableCell className="font-mono text-sm">{r.upstream}</TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
