import React from "react";
import { ContractData } from "./types";

const Logo = () => (
   <svg
      width="100"
      height="100"
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
   >
      <g transform="matrix(0.850257, 0, 0, 0.850257, -208.708878, -228.22673)">
         <path
            fill="#F1AD1E"
            d="M829.513,579.789c-2.166-23.494-22.186-41.05-45.455-40.476l-1.59,0.062l-0.408,0.02l-15.758,0.607 l-1.07,0.039c-2.418,0.102-4.82,0.122-7.205,0.062c-38.086-0.965-72.033-21.822-90.684-53.306c-0.021-0.009-0.021-0.02-0.021-0.029 c-0.197-0.341-0.393-0.673-0.598-1.014c-0.012-0.029-0.031-0.048-0.045-0.078v-0.01c-27.518-46.17-79.893-75.006-136.981-69.759 c-79.198,7.289-137.488,77.401-130.209,156.589c7.288,79.199,77.401,137.488,156.59,130.209 c46.602-4.293,85.953-30.324,108.988-67.166c0.01-0.01,0.01-0.02,0.018-0.041c0.252-0.422,0.514-0.844,0.783-1.268 c0.037-0.051,0.064-0.104,0.102-0.164c5.805-8.928,15.486-15.211,26.92-16.258c19.797-1.816,37.328,12.752,39.152,32.549 c0.719,7.775-1.1,15.197-4.756,21.461c-0.287,0.484-0.586,0.959-0.885,1.434c-34.5,55.469-93.652,94.699-163.721,101.146 c-118.792,10.928-223.956-76.516-234.883-195.299c-10.929-118.792,76.516-223.957,195.308-234.885 c52.054-4.784,101.498,9.32,141.542,36.673c25.746,17.592,47.605,40.669,63.77,67.713c0.238,0.389,0.465,0.77,0.684,1.159 c0.021,0.05,0.055,0.088,0.086,0.136c6.963,11.201,19.857,18.135,33.893,16.846c19.797-1.814,34.375-19.346,32.561-39.143 c-0.465-5.094-1.977-9.84-4.293-14.057c-0.01-0.01-0.021-0.029-0.021-0.039c-0.326-0.556-0.652-1.111-0.988-1.666 c-18.684-31.303-43.078-58.617-71.613-80.625c-55.574-42.853-126.842-65.631-202.22-58.688 c-158.387,14.568-274.977,154.782-260.398,313.168C270.673,744.08,410.887,860.67,569.272,846.102 c139.168-12.811,246.068-122.625,260.07-256.533c0.008-0.031,0.006-0.061,0.016-0.09c0.061-0.635,0.131-1.279,0.191-1.932 c0.018-0.07,0.023-0.141,0.02-0.221C829.767,584.863,829.749,582.342,829.513,579.789z M549.485,631.006 c-39.593,3.639-74.656-25.506-78.294-65.1c-3.641-39.605,25.506-74.656,65.1-78.294c39.605-3.641,74.656,25.505,78.294,65.099 C618.226,592.314,589.079,627.365,549.485,631.006z"
         />
      </g>
   </svg>
);

interface RightPanelProps {
   data: ContractData;
}

export const RightPanel: React.FC<RightPanelProps> = ({ data }) => {
   return (
      <div className="preview-area">
         <div className="contract-paper">
            {/* Header */}
            <div className="contract-header">
               <div
                  style={{
                     display: "flex",
                     justifyContent: "center",
                     marginBottom: "1rem",
                  }}
               >
                  <Logo />
               </div>
               <div className="contract-title">
                  Contrat de création et de maintenance de site internet
               </div>
            </div>

            <div className="section-title">Entre les soussignés :</div>

            {/* Parties */}
            <div className="parties-container">
               <div className="party-box">
                  <div className="provider-name">Graph and Co,</div>
                  <div>
                     Nom commercial de <strong>M. Régis Daum</strong>,
                  </div>
                  <div>
                     Auto-entrepreneur immatriculé sous le numéro SIREN/SIRET :
                     803049154 00021,
                  </div>
                  <div>
                     Domicilié à :
                     <strong>
                        1 rue de la Lucelle, 68127 Sainte-Croix-en-Plaine
                     </strong>
                     ,
                  </div>
                  <div>Adresse e-mail : contact@graphandco.com,</div>
                  <div style={{ marginTop: "0.5rem" }}>
                     Ci-après dénommé <strong>« le Prestataire »</strong>,
                  </div>
               </div>

               <div className="party-separator">ET</div>

               <div className="party-box">
                  <div className="variable">{data.nom_societe},</div>
                  <div>
                     Représentée par :{" "}
                     <span className="variable">{data.nom_client}</span>,
                  </div>
                  <div>
                     Domicilié à / Siège social :{" "}
                     <span className="variable">{data.adresse}</span>
                  </div>
                  <div>
                     Adresse e-mail :{" "}
                     <span className="variable">{data.email}</span>,
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                     Ci-après dénommé <strong>« le Client »</strong>,
                  </div>
               </div>
            </div>

            <div className="section-title">
               Il a été convenu ce qui suit :
               <span className="section-separator"></span>
            </div>

            {/* Articles */}

            <div className="article-title">Article 1 – Objet du contrat</div>
            <p>
               Le présent contrat a pour objet la création, la mise en ligne et
               la maintenance d’un site Internet pour le Client par le
               Prestataire.
               <br />
               Le Prestataire s’engage à concevoir un site conforme aux besoins
               exprimés par le Client dans le cahier des charges ou dans les
               échanges préalables.
            </p>
            <p>
               Le développement pourra être effectué sur un domaine temporaire
               ou une plateforme de préproduction avant la mise en ligne
               définitive sur le nom de domaine du Client : <br />
               <strong>{data.nom_de_domaine}</strong>
               {data.domaines_redirection &&
                  data.domaines_redirection.trim() !== "" && (
                     <>
                        <br />
                        <br />
                        Les noms de domaine suivants seront également paramétrés
                        pour rediriger vers le nom de domaine principal :<br />
                        <strong>{data.domaines_redirection}</strong>
                     </>
                  )}
            </p>

            <div className="article-title">
               Article 2 – Prestations incluses
            </div>
            <p>La prestation comprend :</p>
            <ul>
               <li>La conception graphique et ergonomique du site,</li>
               <li>L’intégration du contenu fourni par le Client,</li>
               <li>Le développement et la mise en ligne du site,</li>
               <li>L’hébergement (si prévu par le Prestataire),</li>
               <li>
                  La maintenance technique et les mises à jour mineures pendant
                  la première année suivant la mise en ligne.
               </li>
            </ul>
            <p>
               Les modifications structurelles ou les évolutions importantes
               feront l’objet d’un devis complémentaire.
            </p>

            <div className="article-title">
               Article 3 – Prix et modalités de paiement
            </div>
            <p>
               Le coût global de la création du site est fixé à{" "}
               <strong>{data.prix_realisation}</strong>.<br />
               Ce tarif comprend la conception, la mise en ligne et la
               maintenance pendant la première année.
            </p>
            <p>
               Modalités de paiement :<br />
               • 50 % à la signature du présent contrat (acompte non
               remboursable),
               <br />• 50 % à la livraison du site (avant mise en ligne
               définitive).
            </p>
            <p>
               À l’issue de la première année, la maintenance et la gestion
               annuelle seront facturées <strong>{data.prix_annuel}</strong> TTC
               par an, payables d’avance à la date anniversaire de la mise en
               ligne.
            </p>

            <div className="article-title">Article 4 – Durée du contrat</div>
            <p>
               Le présent contrat est conclu pour une durée initiale d’un (1) an
               à compter de la mise en ligne du site. Il est renouvelable
               tacitement pour des périodes successives d’un an, sauf
               dénonciation écrite par l’une des parties avec un préavis de 30
               jours avant la date d’échéance.
            </p>
            <p>
               En cas de résiliation par le Client avant la fin de la période en
               cours, aucun remboursement prorata temporis ne sera effectué
               (ceci est légal en B2B, dès lors que la clause est expressément
               acceptée).
            </p>

            <div className="article-title">
               Article 5 – Obligations du Prestataire
            </div>
            <p>Le Prestataire s’engage à :</p>
            <ul>
               <li>
                  Réaliser le site conformément aux spécifications convenues,
               </li>
               <li>
                  Respecter les délais de livraison dans la mesure du possible,
               </li>
               <li>
                  Assurer la maintenance technique pendant la durée convenue,
               </li>
               <li>Informer le Client de tout dysfonctionnement majeur.</li>
            </ul>

            <div className="article-title">
               Article 6 – Obligations du Client
            </div>
            <p>Le Client s’engage à :</p>
            <ul>
               <li>
                  Fournir dans les délais convenus tous les éléments nécessaires
                  à la création du site (textes, images, logos, etc.),
               </li>
               <li>
                  Respecter les droits d’auteur relatifs aux contenus fournis,
               </li>
               <li>
                  Payer les sommes dues selon les modalités prévues au présent
                  contrat.
               </li>
            </ul>

            <div className="article-title">
               Article 7 – Propriété intellectuelle
            </div>
            <p>
               Le Prestataire reste titulaire des droits d’auteur sur les
               éléments graphiques et techniques qu’il a créés jusqu’au paiement
               intégral du prix. Après paiement complet, les droits
               d’utilisation du site sont transférés au Client, à l’exception
               des éléments sous licence ou appartenant à des tiers.
            </p>

            <div className="article-title">
               Article 8 – Hébergement et nom de domaine
            </div>
            <p>
               Sauf mention contraire, l’hébergement et le nom de domaine
               peuvent être gérés par le Prestataire dans le cadre du contrat de
               maintenance. En cas de résiliation du contrat, le Prestataire
               transmettra au Client, sur demande, les accès techniques
               nécessaires au transfert.
            </p>

            <div className="article-title">Article 9 – Responsabilités</div>
            <p>
               Le Prestataire ne saurait être tenu responsable des dommages
               indirects, perte de données ou de chiffre d’affaires, ou toute
               interruption du service indépendante de sa volonté (hébergeur,
               fournisseur d’accès, etc.). La responsabilité du Prestataire est
               limitée au montant total payé par le Client pour la prestation
               concernée.
            </p>

            <div className="article-title">Article 10 – Résiliation</div>
            <p>
               En cas de manquement grave par l’une des parties à ses
               obligations contractuelles, le contrat pourra être résilié de
               plein droit 30 jours après mise en demeure restée sans effet.
            </p>

            <div className="article-title">Article 11 – Confidentialité</div>
            <p>
               Chaque partie s’engage à garder strictement confidentielles les
               informations techniques, commerciales et stratégiques échangées
               dans le cadre du présent contrat.
            </p>

            <div className="article-title">
               Article 12 – Loi applicable et juridiction compétente
            </div>
            <p>
               Le présent contrat est régi par le droit français.
               <br />
               Tout litige relatif à son interprétation ou à son exécution sera
               soumis aux tribunaux compétents du ressort du domicile du
               Prestataire, sauf disposition légale contraire.
            </p>

            {/* Signatures */}
            <div className="signatures-section">
               <p>
                  Fait à <strong>{data.lieu}</strong>, le{" "}
                  <strong>{data.date}</strong>
               </p>
               <p style={{ fontSize: "0.9rem" }}>
                  En deux exemplaires originaux.
               </p>

               <div className="signatures-row">
                  <div className="signature-box">
                     <div className="signature-label">Le Prestataire</div>
                     <div className="signature-mention">
                        (Signature précédée de la mention « Lu et approuvé »)
                     </div>
                  </div>

                  <div className="signature-box">
                     <div className="signature-label">Le Client</div>
                     <div className="signature-mention">
                        (Signature précédée de la mention « Lu et approuvé »)
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
