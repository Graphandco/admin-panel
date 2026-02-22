import { StatusCard } from "@/components/ui/status-card";
import { Container, Clock, Ban } from "lucide-react";

const CARDS = [
   { id: "total", Icon: Container, color: "blue", label: "Containers" },
   { id: "running", Icon: Clock, color: "green", label: "En cours" },
   { id: "stopped", Icon: Ban, color: "slate", label: "Arrêtés" },
];

export function StatusCards({ total = 0, running = 0, stopped = 0 }) {
   const values = { total, running, stopped };

   return (
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
         {CARDS.map(({ id, Icon, color, label }) => (
            <StatusCard
               key={id}
               Icon={Icon}
               color={color}
               label={label}
               value={values[id]}
            />
         ))}
      </div>
   );
}
