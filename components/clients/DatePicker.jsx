"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DatePicker({ value, onChange, placeholder, id }) {
   return (
      <Input
         id={id}
         type="date"
         value={value || ""}
         onChange={(e) => onChange?.(e.target.value || "")}
      />
   );
}
