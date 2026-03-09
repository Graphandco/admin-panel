"use client";

import { useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { InvoiceDocument } from "./InvoiceDocument";
import { clientsList } from "@/app/actions/clients";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Loader2Icon,
   DownloadIcon,
   PlusIcon,
   Trash2Icon,
} from "lucide-react";

const EMPTY_SERVICE = { description: "", quantity: 1, unitPrice: "" };
const DRAFT_STORAGE_KEY = "invoice-form-draft";

async function getLogoDataUrl() {
   const base = typeof window !== "undefined" ? window.location.origin : "";
   try {
      const res = await fetch(`${base}/logo.svg`);
      if (!res.ok) return null;
      const svgText = await res.text();
      const img = new Image();
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      return new Promise((resolve) => {
         img.onload = () => {
            const canvas = document.createElement("canvas");
            const size = 96;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, size, size);
            const dataUrl = canvas.toDataURL("image/png");
            URL.revokeObjectURL(url);
            resolve(dataUrl);
         };
         img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
         };
         img.src = url;
      });
   } catch {
      return null;
   }
}

function formatDateForInput(dateStr) {
   if (!dateStr) return "";
   const d = new Date(dateStr);
   if (isNaN(d.getTime())) return "";
   return d.toISOString().slice(0, 10);
}

export function InvoiceGenerator() {
   const [clients, setClients] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [selectedClientId, setSelectedClientId] = useState("");
   const [invoiceNumber, setInvoiceNumber] = useState("");
   const [invoiceDate, setInvoiceDate] = useState(
      formatDateForInput(new Date())
   );
   const [services, setServices] = useState([{ ...EMPTY_SERVICE }]);
   const [generating, setGenerating] = useState(false);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      clientsList()
         .then(setClients)
         .catch((err) => setError(err.message))
         .finally(() => setLoading(false));
   }, []);

   const hasLoadedDraft = useRef(false);
   useEffect(() => {
      try {
         const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
         if (raw) {
            const draft = JSON.parse(raw);
            if (draft.selectedClientId != null) setSelectedClientId(draft.selectedClientId);
            if (draft.invoiceNumber != null) setInvoiceNumber(draft.invoiceNumber);
            if (draft.invoiceDate != null) setInvoiceDate(draft.invoiceDate);
            if (Array.isArray(draft.services) && draft.services.length > 0) {
               setServices(
                  draft.services.map((s) => ({
                     description: s?.description ?? "",
                     quantity: s?.quantity ?? 1,
                     unitPrice: s?.unitPrice ?? "",
                  }))
               );
            }
         }
      } catch {
         // ignore invalid JSON
      }
      const t = setTimeout(() => {
         hasLoadedDraft.current = true;
      }, 0);
      return () => clearTimeout(t);
   }, []);

   useEffect(() => {
      if (!hasLoadedDraft.current) return;
      const draft = {
         selectedClientId,
         invoiceNumber,
         invoiceDate,
         services,
      };
      try {
         localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch {
         // quota or privacy mode
      }
   }, [selectedClientId, invoiceNumber, invoiceDate, services]);

   const selectedClient = clients.find((c) => String(c.id) === selectedClientId);

   function addService() {
      setServices((s) => [...s, { ...EMPTY_SERVICE }]);
   }

   function removeService(index) {
      setServices((s) => s.filter((_, i) => i !== index));
   }

   function updateService(index, field, value) {
      setServices((s) =>
         s.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
         )
      );
   }

   async function handleGenerateAndDownload() {
      if (!selectedClient) {
         alert("Veuillez sélectionner un client.");
         return;
      }
      if (!invoiceNumber.trim()) {
         alert("Veuillez renseigner le numéro de facture.");
         return;
      }
      const validServices = services.filter(
         (s) => s.description?.trim() && (Number(s.quantity) || 0) > 0
      );
      if (validServices.length === 0) {
         alert("Ajoutez au moins une prestation avec une description.");
         return;
      }

      const totalTtc = validServices.reduce(
         (sum, s) => sum + (Number(s.quantity) || 0) * (Number(s.unitPrice) || 0),
         0
      );

      setGenerating(true);
      try {
         const logoDataUrl = await getLogoDataUrl();
         const company = {
            name: process.env.NEXT_PUBLIC_INVOICE_COMPANY_NAME || "",
            user: process.env.NEXT_PUBLIC_INVOICE_COMPANY_USER || "",
            street: process.env.NEXT_PUBLIC_INVOICE_COMPANY_STREET || "",
            town: process.env.NEXT_PUBLIC_INVOICE_COMPANY_TOWN || "",
            phone: process.env.NEXT_PUBLIC_INVOICE_COMPANY_PHONE || "",
            email: process.env.NEXT_PUBLIC_INVOICE_COMPANY_EMAIL || "",
            siret: process.env.NEXT_PUBLIC_INVOICE_COMPANY_SIRET || "",
            iban: process.env.NEXT_PUBLIC_INVOICE_COMPANY_IBAN || "",
            bic: process.env.NEXT_PUBLIC_INVOICE_COMPANY_BIC || "",
         };
         const blob = await pdf(
            <InvoiceDocument
               client={selectedClient}
               invoiceNumber={invoiceNumber.trim()}
               invoiceDate={invoiceDate || formatDateForInput(new Date())}
               services={validServices}
               logoDataUrl={logoDataUrl}
               company={company}
            />
         ).toBlob();

         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         const safeNum = invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_");
         a.download = `facture_${safeNum}_${selectedClient.company || selectedClient.name || "client"}.pdf`;
         a.click();
         URL.revokeObjectURL(url);

         // Sauvegarder sur le serveur
         setSaving(true);
         const formData = new FormData();
         formData.append(
            "file",
            blob,
            `facture_${safeNum}_${selectedClient.company || selectedClient.name || "client"}.pdf`
         );
         formData.append("invoiceNumber", invoiceNumber.trim());
         formData.append("clientId", String(selectedClient.id));
         formData.append("totalTtc", String(totalTtc));

         const res = await fetch("/api/invoices/save", {
            method: "POST",
            body: formData,
         });
         if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            const msg = data.error || `Erreur ${res.status}`;
            const details = data.details ? `\n\nDétail : ${data.details}` : "";
            const hint =
               msg.toLowerCase().includes("not found") || res.status === 404
                  ? "\n\n→ Redémarrez le conteneur admin-api pour charger les routes factures."
                  : "";
            alert(`${msg}${details}${hint}`);
         }
         try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
         } catch {
            // ignore
         }
      } catch (err) {
         alert(err.message || "Erreur lors de la génération");
      } finally {
         setGenerating(false);
         setSaving(false);
      }
   }

   if (loading) {
      return (
         <Card>
            <CardContent className="flex items-center justify-center py-16">
               <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </CardContent>
         </Card>
      );
   }

   if (error) {
      return (
         <Card>
            <CardContent className="py-8">
               <p className="text-destructive">{error}</p>
            </CardContent>
         </Card>
      );
   }

   return (
      <div className="space-y-6">
         <Card>
            <CardContent className="pt-6">
               <h2 className="text-lg font-semibold mb-4">
                  Nouvelle facture
               </h2>
               <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                     <Label htmlFor="client">Client *</Label>
                     <Select
                        value={selectedClientId}
                        onValueChange={setSelectedClientId}
                     >
                        <SelectTrigger id="client">
                           <SelectValue placeholder="Sélectionner un client">
                              {selectedClient
                                 ? selectedClient.company ||
                                   selectedClient.name ||
                                   `Client #${selectedClient.id}`
                                 : null}
                           </SelectValue>
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
                     <Label htmlFor="invoiceNumber">N° de facture *</Label>
                     <Input
                        id="invoiceNumber"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        placeholder="Ex: FACT-2025-001"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="invoiceDate">Date</Label>
                     <Input
                        id="invoiceDate"
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                     />
                  </div>
               </div>

               {selectedClient && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/50">
                     <p className="text-sm font-medium text-muted-foreground mb-2">
                        Informations client
                     </p>
                     <p className="text-sm">
                        {selectedClient.company && (
                           <>
                              <span className="font-medium">
                                 {selectedClient.company}
                              </span>
                              {selectedClient.name && (
                                 <> — {selectedClient.name}</>
                              )}
                           </>
                        )}
                        {!selectedClient.company && selectedClient.name}
                     </p>
                     {selectedClient.adresse && (
                        <p className="text-sm text-muted-foreground">
                           {selectedClient.adresse}
                        </p>
                     )}
                     {selectedClient.email && (
                        <p className="text-sm text-muted-foreground">
                           {selectedClient.email}
                        </p>
                     )}
                  </div>
               )}
            </CardContent>
         </Card>

         <Card>
            <CardContent className="pt-6">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Prestations</h2>
                  <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={addService}
                  >
                     <PlusIcon className="size-4 mr-1" />
                     Ajouter
                  </Button>
               </div>
               <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                     <div className="col-span-6">Désignation</div>
                     <div className="col-span-2 text-right">Quantité</div>
                     <div className="col-span-2 text-right">Prix unit. TTC (€)</div>
                     <div className="col-span-2"></div>
                  </div>
                  {services.map((s, i) => (
                     <div
                        key={i}
                        className="grid grid-cols-12 gap-2 items-center"
                     >
                        <div className="col-span-6">
                           <Input
                              value={s.description}
                              onChange={(e) =>
                                 updateService(i, "description", e.target.value)
                              }
                              placeholder="Description de la prestation"
                           />
                        </div>
                        <div className="col-span-2">
                           <Input
                              type="number"
                              min="0"
                              step="1"
                              value={s.quantity}
                              onChange={(e) =>
                                 updateService(
                                    i,
                                    "quantity",
                                    e.target.value
                                 )
                              }
                           />
                        </div>
                        <div className="col-span-2">
                           <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={s.unitPrice}
                              onChange={(e) =>
                                 updateService(i, "unitPrice", e.target.value)
                              }
                              placeholder="0.00"
                           />
                        </div>
                        <div className="col-span-2">
                           <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeService(i)}
                              disabled={services.length <= 1}
                              className="text-destructive hover:text-destructive"
                           >
                              <Trash2Icon className="size-4" />
                           </Button>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
               <Button
                  onClick={handleGenerateAndDownload}
                  disabled={generating || !selectedClient}
                  className="cursor-pointer"
               >
                  {generating ? (
                     <Loader2Icon className="size-4 mr-2 animate-spin" />
                  ) : (
                     <DownloadIcon className="size-4 mr-2" />
                  )}
                  Générer et télécharger le PDF
                  {saving && (
                     <span className="ml-2 text-xs opacity-80">
                        (sauvegarde...)
                     </span>
                  )}
               </Button>
            </CardContent>
         </Card>
      </div>
   );
}
