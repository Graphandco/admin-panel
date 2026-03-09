"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { clientCreate } from "@/app/actions/clients";
import { ClientForm } from "@/components/clients/ClientForm";

export default function NouveauClientPage() {
   const router = useRouter();
   const [saving, setSaving] = useState(false);

   async function handleSubmit(payload) {
      setSaving(true);
      try {
         await clientCreate(payload);
         router.push("/clients");
      } catch (err) {
         alert(err.message || "Erreur");
      } finally {
         setSaving(false);
      }
   }

   function handleCancel() {
      router.push("/clients");
   }

   return (
      <div className="space-y-6">
         <Card>
            <CardContent className="pt-6">
               <h2 className="text-xl font-semibold mb-4 text-primary">
                  Nouveau client
               </h2>
               <ClientForm
                  client={null}
                  mode="add"
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  saving={saving}
               />
            </CardContent>
         </Card>
      </div>
   );
}
