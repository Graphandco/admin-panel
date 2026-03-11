"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Loader2Icon } from "lucide-react";
import { clientsList } from "@/app/actions/clients";
import { agenceSiteCreate } from "@/app/actions/agence-sites";

export default function NouveauSitePage() {
   const router = useRouter();
   const [clients, setClients] = useState([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [form, setForm] = useState({
      client_id: "",
      address: "",
      backoffice: "",
   });

   useEffect(() => {
      clientsList()
         .then(setClients)
         .catch(() => setClients([]))
         .finally(() => setLoading(false));
   }, []);

   async function handleSubmit(e) {
      e.preventDefault();
      if (!form.client_id) {
         alert("Veuillez sélectionner un client");
         return;
      }
      setSaving(true);
      try {
         await agenceSiteCreate({
            client_id: parseInt(form.client_id, 10),
            address: form.address.trim(),
            backoffice: form.backoffice.trim(),
         });
         router.push("/agence/sites");
      } catch (err) {
         alert(err.message || "Erreur lors de la création");
      } finally {
         setSaving(false);
      }
   }

   function handleCancel() {
      router.push("/agence/sites");
   }

   if (loading) {
      return (
         <div className="flex items-center justify-center py-16">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <Card>
            <CardContent className="pt-6">
               <h2 className="text-xl font-semibold mb-4 text-primary">
                  Nouveau site
               </h2>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                     <div className="space-y-2">
                        <Label htmlFor="client_id">Client *</Label>
                        <Select
                           value={form.client_id}
                           onValueChange={(v) =>
                              setForm((f) => ({ ...f, client_id: v }))
                           }
                           required
                        >
                           <SelectTrigger id="client_id">
                              <SelectValue placeholder="Sélectionner un client" />
                           </SelectTrigger>
                           <SelectContent>
                              {clients.map((c) => (
                                 <SelectItem key={c.id} value={String(c.id)}>
                                    {c.company || c.name || `Client #${c.id}`}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Adresse (URL) *</Label>
                        <Input
                           id="address"
                           type="url"
                           value={form.address}
                           onChange={(e) =>
                              setForm((f) => ({ ...f, address: e.target.value }))
                           }
                           placeholder="https://example.com"
                           required
                        />
                     </div>
                     <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="backoffice">Backoffice</Label>
                        <Input
                           id="backoffice"
                           value={form.backoffice}
                           onChange={(e) =>
                              setForm((f) => ({
                                 ...f,
                                 backoffice: e.target.value,
                              }))
                           }
                           placeholder="https://example.com/wp-admin"
                        />
                     </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                     <Button type="submit" disabled={saving}>
                        {saving ? (
                           <>
                              <Loader2Icon className="size-4 animate-spin mr-2" />
                              Enregistrement…
                           </>
                        ) : (
                           "Créer le site"
                        )}
                     </Button>
                     <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                     >
                        Annuler
                     </Button>
                  </div>
               </form>
            </CardContent>
         </Card>
      </div>
   );
}
