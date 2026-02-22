import { StatusCard } from "@/components/ui/status-card";
import { Smartphone, Wifi, WifiOff } from "lucide-react";

const CARDS = [
   { id: "total", Icon: Smartphone, color: "blue", label: "Appareils" },
   { id: "active", Icon: Wifi, color: "green", label: "Actifs" },
   { id: "inactive", Icon: WifiOff, color: "slate", label: "Inactifs" },
];

export function StatusCards({ total = 0, active = 0, inactive = 0 }) {
   const values = { total, active, inactive };

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
