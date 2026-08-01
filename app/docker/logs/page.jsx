"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RedirectInner() {
   const router = useRouter();
   const searchParams = useSearchParams();

   useEffect(() => {
      const q = new URLSearchParams();
      q.set("source", "docker");
      const container = searchParams.get("container");
      if (container) q.set("container", container);
      router.replace(`/logs?${q.toString()}`);
   }, [router, searchParams]);

   return (
      <div className="py-16 text-center text-muted-foreground text-sm">
         Redirection vers Logs…
      </div>
   );
}

export default function DockerLogsRedirectPage() {
   return (
      <Suspense fallback={null}>
         <RedirectInner />
      </Suspense>
   );
}
