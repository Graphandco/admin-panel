import {
   Building2Icon,
   UserIcon,
   MailIcon,
   GlobeIcon,
   PhoneIcon,
   MapPinIcon,
   CalendarIcon,
   BanknoteIcon,
   FileTextIcon,
} from "lucide-react";

function formatDate(str) {
   if (!str) return "—";
   try {
      const [y, m, d] = String(str).split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("fr-FR", {
         day: "2-digit",
         month: "short",
         year: "numeric",
      });
   } catch {
      return str;
   }
}

function formatNumber(val) {
   if (val == null || val === "") return "—";
   const n = Number(val);
   return isNaN(n) ? "—" : n.toLocaleString("fr-FR");
}

export function ClientModalInfos({ client }) {
   if (!client) return null;

   const c = client;
   return (
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
         <dt className="flex items-center gap-2 text-muted-foreground">
            <Building2Icon className="size-3.5 shrink-0" />
            Entreprise
         </dt>
         <dd>{c.company || "—"}</dd>
         <dt className="flex items-center gap-2 text-muted-foreground">
            <UserIcon className="size-3.5 shrink-0" />
            Nom
         </dt>
         <dd>{c.name || "—"}</dd>
         <dt className="flex items-center gap-2 text-muted-foreground">
            <MailIcon className="size-3.5 shrink-0" />
            Email
         </dt>
         <dd>
            {c.email ? (
               <a
                  href={`mailto:${c.email}`}
                  className="text-primary hover:underline"
               >
                  {c.email}
               </a>
            ) : (
               "—"
            )}
         </dd>
         <dt className="flex items-center gap-2 text-muted-foreground">
            <GlobeIcon className="size-3.5 shrink-0" />
            Site web
         </dt>
         <dd>
            {(() => {
               const urls =
                  c.websites?.length > 0
                     ? c.websites
                     : c.website
                        ? [c.website]
                        : [];
               return urls.length > 0 ? (
                  urls.map((url, i) => (
                     <a
                        key={i}
                        href={
                           url.startsWith("http") ? url : `https://${url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline block"
                     >
                        {url.replace(/^https?:\/\//i, "")}
                     </a>
                  ))
               ) : (
                  "—"
               );
            })()}
         </dd>
         <dt className="flex items-center gap-2 text-muted-foreground">
            <PhoneIcon className="size-3.5 shrink-0" />
            Téléphone
         </dt>
         <dd>{c.phone || "—"}</dd>
         <dt className="flex items-center gap-2 text-muted-foreground">
            <MapPinIcon className="size-3.5 shrink-0" />
            Adresse
         </dt>
         <dd>
            {c.adresse ? (
               <>
                  {c.adresse}
                  {(c.post_code || c.city) && (
                     <span className="block mt-0.5">
                        {[c.post_code, c.city].filter(Boolean).join(" ")}
                     </span>
                  )}
               </>
            ) : c.post_code || c.city ? (
               [c.post_code, c.city].filter(Boolean).join(" ")
            ) : (
               "—"
            )}
         </dd>
         <dt className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="size-3.5 shrink-0" />
            Date de paiement
         </dt>
         <dd>{formatDate(c.payment_date)}</dd>
         <dt className="flex items-center gap-2 text-muted-foreground">
            <BanknoteIcon className="size-3.5 shrink-0" />
            Coût annuel
         </dt>
         <dd>{formatNumber(c.annual_cost)} €</dd>
         <dt className="flex items-center gap-2 text-muted-foreground">
            <BanknoteIcon className="size-3.5 shrink-0" />
            Coût de création
         </dt>
         <dd>{formatNumber(c.creation_cost)} €</dd>
         <dt className="flex items-center gap-2 text-muted-foreground">
            <FileTextIcon className="size-3.5 shrink-0" />
            Facture
         </dt>
         <dd>{c.invoice ? "Oui" : "Non"}</dd>
      </dl>
   );
}
