import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { caddyRedirects } from "@/app/actions/caddy";
import { HostsList } from "@/components/caddy/HostsList";

export const dynamic = "force-dynamic";

export default async function CaddyRedirectsPage() {
   let rows = [];
   let error = null;
   try {
      rows = await caddyRedirects();
   } catch (e) {
      error = e.message;
   }

   return (
      <div>
         <h2 className="text-xl font-bold text-white mb-4">Caddy — Redirections</h2>
         <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
            Redirections issues de la config JSON active (ex. <code>redir</code>, réponses
            3xx, etc.).
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
                     <TableHead>Code</TableHead>
                     <TableHead>Cible / Location</TableHead>
                     <TableHead>Listen</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {rows.length === 0 && !error ? (
                     <TableRow>
                        <TableCell
                           colSpan={4}
                           className="text-muted-foreground text-sm"
                        >
                           Aucune redirection extraite.
                        </TableCell>
                     </TableRow>
                  ) : (
                     rows.map((r, i) => (
                        <TableRow key={i}>
                           <TableCell className="max-w-md align-top">
                              <HostsList hosts={r.hosts} />
                           </TableCell>
                           <TableCell className="whitespace-nowrap">{r.code}</TableCell>
                           <TableCell className="font-mono text-sm break-all max-w-md">
                              {r.to}
                           </TableCell>
                           <TableCell className="text-xs text-muted-foreground">
                              {r.listen}
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
