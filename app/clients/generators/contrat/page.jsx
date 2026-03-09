"use client";

import dynamic from "next/dynamic";

const ContractGenerator = dynamic(
   () =>
      import("@/components/contracts/ContractGenerator").then(
         (mod) => mod.ContractGenerator
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

export default function GenerateurContratPage() {
   return (
      <div className="space-y-6">
         <ContractGenerator />
      </div>
   );
}
