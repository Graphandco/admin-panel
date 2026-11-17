export function DevModeBanner() {
   if (process.env.NEXT_PUBLIC_PANEL_MODE !== "development") {
      return null;
   }

   return (
      <div className="shrink-0 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-200">
         Mode développement — hot-reload actif ·{" "}
         <span className="font-medium text-amber-100">dev.vps.graphandco.com</span>
      </div>
   );
}
