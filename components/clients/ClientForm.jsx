"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/clients/DatePicker";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

const EMPTY_FORM = {
   name: "",
   company: "",
   email: "",
   website: "",
   phone: "",
   adresse: "",
   payment_date: "",
   annual_cost: "",
   creation_cost: "",
   invoice: false,
};

function clientToForm(c) {
   if (!c) return EMPTY_FORM;
   return {
      name: c.name ?? "",
      company: c.company ?? "",
      email: c.email ?? "",
      website: c.website ?? "",
      phone: c.phone ?? "",
      adresse: c.adresse ?? "",
      payment_date: c.payment_date ?? "",
      annual_cost: c.annual_cost != null ? String(c.annual_cost) : "",
      creation_cost: c.creation_cost != null ? String(c.creation_cost) : "",
      invoice: Boolean(c.invoice),
   };
}

export function ClientForm({ client, mode, onSubmit, onCancel, saving }) {
   const [form, setForm] = useState(() => clientToForm(client));

   useEffect(() => {
      setForm(clientToForm(client));
   }, [client?.id]);

   function handleSubmit(e) {
      e.preventDefault();
      const payload = {
         ...form,
         annual_cost: form.annual_cost !== "" ? Number(form.annual_cost) : null,
         creation_cost: form.creation_cost !== "" ? Number(form.creation_cost) : null,
      };
      onSubmit(payload);
   }

   return (
      <form onSubmit={handleSubmit} className="space-y-3">
         <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="grid gap-2">
               <Label htmlFor="name">Nom *</Label>
               <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
               />
            </div>
            <div className="grid gap-2">
               <Label htmlFor="company">Entreprise</Label>
               <Input
                  id="company"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
               />
            </div>
            <div className="grid gap-2">
               <Label htmlFor="email">Email</Label>
               <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
               />
            </div>
            <div className="grid gap-2">
               <Label htmlFor="website">Site web</Label>
               <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
               />
            </div>
            <div className="grid gap-2">
               <Label htmlFor="phone">Téléphone</Label>
               <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
               />
            </div>
            <div className="grid gap-2">
               <Label htmlFor="payment_date">Date de paiement</Label>
               <DatePicker
                  id="payment_date"
                  value={form.payment_date}
                  onChange={(v) => setForm((f) => ({ ...f, payment_date: v }))}
               />
            </div>
            <div className="grid gap-2 col-span-2">
               <Label htmlFor="adresse">Adresse</Label>
               <Input
                  id="adresse"
                  value={form.adresse}
                  onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))}
               />
            </div>
            <div className="grid gap-2">
               <Label htmlFor="annual_cost">Coût annuel</Label>
               <Input
                  id="annual_cost"
                  type="number"
                  step="0.01"
                  value={form.annual_cost}
                  onChange={(e) => setForm((f) => ({ ...f, annual_cost: e.target.value }))}
               />
            </div>
            <div className="grid gap-2">
               <Label htmlFor="creation_cost">Coût de création</Label>
               <Input
                  id="creation_cost"
                  type="number"
                  step="0.01"
                  value={form.creation_cost}
                  onChange={(e) => setForm((f) => ({ ...f, creation_cost: e.target.value }))}
               />
            </div>
         </div>
         <div className="flex items-center gap-2">
            <input
               type="checkbox"
               id="invoice"
               checked={form.invoice}
               onChange={(e) => setForm((f) => ({ ...f, invoice: e.target.checked }))}
               className="size-4 rounded border"
            />
            <Label htmlFor="invoice">Facture</Label>
         </div>
         <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} size="sm">
               Annuler
            </Button>
            <Button type="submit" disabled={saving} size="sm">
               {saving ? <Loader2Icon className="size-4 animate-spin mr-1" /> : null}
               {mode === "edit" ? "Enregistrer" : "Créer"}
            </Button>
         </div>
      </form>
   );
}
