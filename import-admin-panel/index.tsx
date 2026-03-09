import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { ContractData } from "./types";
import "./styles.css";

const initialData: ContractData = {
   nom_societe: "Ma Super Entreprise",
   nom_client: "Jean Dupont",
   adresse: "10 rue de la Paix, 75000 Paris",
   email: "jean.dupont@example.com",
   nom_de_domaine: "www.mon-super-site.com",
   domaines_redirection: "",
   prix_realisation: "1 500 €",
   prix_annuel: "150 €",
   lieu: "Colmar",
   date: new Date().toLocaleDateString("fr-FR"),
};

const App = () => {
   const [data, setData] = useState<ContractData>(initialData);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setData((prev) => ({ ...prev, [name]: value }));
   };

   const handlePrint = () => {
      window.focus();
      window.print();
   };

   return (
      <div className="app-container">
         <LeftPanel data={data} onChange={handleChange} onPrint={handlePrint} />
         <RightPanel data={data} />
      </div>
   );
};

const container = document.getElementById("root");
if (container) {
   const root = createRoot(container);
   root.render(<App />);
}
