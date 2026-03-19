"use client";

import dynamic from "next/dynamic";

const QuoteGenerator = dynamic(
   () =>
      import("@/components/quotes/QuoteGenerator").then((mod) => mod.QuoteGenerator),
   {
      ssr: false,
      loading: () => (
         <div className="animate-pulse py-12 text-center text-muted-foreground">
            Chargement...
         </div>
      ),
   }
);

export default function GenerateurDevisPage() {
   return (
      <div className="space-y-6">
         <QuoteGenerator />
      </div>
   );
}
