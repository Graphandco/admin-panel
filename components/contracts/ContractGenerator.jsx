"use client";

import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { ContractDocument } from "./ContractDocument";
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
import { Loader2Icon, DownloadIcon } from "lucide-react";

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

const defaultData = {
   nom_societe: "",
   nom_client: "",
   adresse: "",
   email: "",
   nom_de_domaine: "",
   domaines_redirection: "",
   prix_realisation: "1 500 €",
   prix_annuel: "150 €",
   lieu: "Colmar",
   date: new Date().toLocaleDateString("fr-FR"),
};

export function ContractGenerator() {
   const [clients, setClients] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [selectedClientId, setSelectedClientId] = useState("");
   const [data, setData] = useState({ ...defaultData });
   const [generating, setGenerating] = useState(false);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      clientsList()
         .then(setClients)
         .catch((err) => setError(err.message))
         .finally(() => setLoading(false));
   }, []);

   const selectedClient = clients.find(
      (c) => String(c.id) === selectedClientId,
   );

   useEffect(() => {
      if (selectedClient) {
         setData((prev) => ({
            ...prev,
            nom_societe: selectedClient.company || selectedClient.name || "",
            nom_client: selectedClient.name || "",
            adresse: selectedClient.adresse || "",
            email: selectedClient.email || "",
         }));
      }
   }, [selectedClient]);

   function handleChange(e) {
      const { name, value } = e.target;
      setData((prev) => ({ ...prev, [name]: value }));
   }

   async function handleGenerateAndDownload() {
      if (!selectedClient) {
         alert("Veuillez sélectionner un client.");
         return;
      }
      if (!data.nom_societe?.trim()) {
         alert("Veuillez renseigner le nom de la société.");
         return;
      }

      setGenerating(true);
      try {
         const logoDataUrl = await getLogoDataUrl();
         const blob = await pdf(
            <ContractDocument data={data} logoDataUrl={logoDataUrl} />,
         ).toBlob();

         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         const safeName = (
            selectedClient.company ||
            selectedClient.name ||
            "client"
         )
            .replace(/[^a-zA-Z0-9-_àâäéèêëïîôùûüç\s]/g, "")
            .replace(/\s+/g, "_")
            .slice(0, 50);
         const timestamp = new Date().toISOString().slice(0, 10);
         a.download = `contrat_${safeName}_${timestamp}.pdf`;
         a.click();
         URL.revokeObjectURL(url);

         setSaving(true);
         const formData = new FormData();
         formData.append("file", blob, a.download);
         formData.append("clientId", String(selectedClient.id));
         formData.append(
            "clientName",
            selectedClient.company || selectedClient.name || "",
         );

         const res = await fetch("/api/contracts/save", {
            method: "POST",
            body: formData,
         });
         if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg = errData.error || `Erreur ${res.status}`;
            const details = errData.details
               ? `\n\nDétail : ${errData.details}`
               : "";
            const hint =
               msg.toLowerCase().includes("not found") || res.status === 404
                  ? "\n\n→ Redémarrez le conteneur admin-api pour charger les routes contrats."
                  : "";
            alert(`${msg}${details}${hint}`);
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
               <h2 className="text-xl font-semibold mb-4 text-primary">
                  Nouveau contrat
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
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardContent className="pt-6">
               <h2 className="text-lg font-semibold mb-4">
                  Informations contrat
               </h2>
               <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                     <Label htmlFor="nom_societe">
                        Nom de la société (Client)
                     </Label>
                     <Input
                        id="nom_societe"
                        name="nom_societe"
                        value={data.nom_societe}
                        onChange={handleChange}
                        placeholder="Société"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="nom_client">Représentant (Client)</Label>
                     <Input
                        id="nom_client"
                        name="nom_client"
                        value={data.nom_client}
                        onChange={handleChange}
                        placeholder="Nom du contact"
                     />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                     <Label htmlFor="adresse">Adresse</Label>
                     <Input
                        id="adresse"
                        name="adresse"
                        value={data.adresse}
                        onChange={handleChange}
                        placeholder="Adresse complète"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input
                        id="email"
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={handleChange}
                        placeholder="email@exemple.com"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="nom_de_domaine">
                        Nom de domaine principal
                     </Label>
                     <Input
                        id="nom_de_domaine"
                        name="nom_de_domaine"
                        value={data.nom_de_domaine}
                        onChange={handleChange}
                        placeholder="www.exemple.com"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="domaines_redirection">
                        Domaines de redirection (optionnel)
                     </Label>
                     <Input
                        id="domaines_redirection"
                        name="domaines_redirection"
                        value={data.domaines_redirection}
                        onChange={handleChange}
                        placeholder="domaine.fr, domaine.net"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="prix_realisation">Prix création</Label>
                     <Input
                        id="prix_realisation"
                        name="prix_realisation"
                        value={data.prix_realisation}
                        onChange={handleChange}
                        placeholder="1 500 €"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="prix_annuel">
                        Prix maintenance annuel
                     </Label>
                     <Input
                        id="prix_annuel"
                        name="prix_annuel"
                        value={data.prix_annuel}
                        onChange={handleChange}
                        placeholder="150 €"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="lieu">Lieu de signature</Label>
                     <Input
                        id="lieu"
                        name="lieu"
                        value={data.lieu}
                        onChange={handleChange}
                        placeholder="Colmar"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="date">Date de signature</Label>
                     <Input
                        id="date"
                        name="date"
                        value={data.date}
                        onChange={handleChange}
                        placeholder={new Date().toLocaleDateString("fr-FR")}
                     />
                  </div>
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
