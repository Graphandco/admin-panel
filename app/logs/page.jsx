import { Suspense } from "react";
import LogsHubPage from "./logs-hub";

export default function LogsPage() {
   return (
      <Suspense
         fallback={
            <div className="py-16 text-center text-muted-foreground text-sm">
               Chargement des logs…
            </div>
         }
      >
         <LogsHubPage />
      </Suspense>
   );
}
