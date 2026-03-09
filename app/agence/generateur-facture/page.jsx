"use client";

import dynamic from "next/dynamic";

const InvoiceGenerator = dynamic(
   () =>
      import("@/components/invoices/InvoiceGenerator").then(
         (mod) => mod.InvoiceGenerator
      ),
   {
      ssr: false,
      loading: () => (
         <div className="animate-pulse py-12 text-center text-muted-foreground">
            Chargement...
         </div>
      ),
   }
);

export default function GenerateurFacturePage() {
   return (
      <div className="space-y-6">
         <InvoiceGenerator />
      </div>
   );
}
