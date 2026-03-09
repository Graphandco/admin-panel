"use client";

import {
   Document,
   Page,
   Text,
   View,
   StyleSheet,
   Image,
} from "@react-pdf/renderer";

const ACCENT = "#F1AD1E";
const DARK = "#0f172a";

const styles = StyleSheet.create({
   page: {
      padding: 40,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: "#333",
      lineHeight: 1.5,
   },
   header: {
      alignItems: "center",
      marginBottom: 24,
   },
   logo: {
      width: 60,
      height: 60,
      marginBottom: 8,
   },
   title: {
      fontSize: 14,
      fontWeight: "bold",
      color: DARK,
      textTransform: "uppercase",
      textAlign: "center",
   },
   sectionTitle: {
      fontSize: 11,
      fontWeight: "bold",
      color: DARK,
      textAlign: "center",
      marginTop: 20,
      marginBottom: 12,
   },
   separator: {
      width: 80,
      height: 2,
      backgroundColor: "#ea580c",
      alignSelf: "center",
      marginTop: 4,
      marginBottom: 12,
   },
   partiesRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      gap: 16,
   },
   partyBox: {
      flex: 1,
      fontSize: 9,
   },
   partyLabel: {
      fontWeight: "bold",
      color: DARK,
      marginBottom: 4,
   },
   partySep: {
      textAlign: "center",
      fontWeight: "bold",
      marginVertical: 8,
   },
   paragraph: {
      marginBottom: 8,
      textAlign: "justify",
   },
   articleTitle: {
      fontWeight: "bold",
      color: DARK,
      fontSize: 10,
      marginTop: 14,
      marginBottom: 6,
   },
   bulletList: {
      marginLeft: 16,
      marginBottom: 8,
   },
   bulletItem: {
      marginBottom: 4,
   },
   signaturesSection: {
      marginTop: 32,
   },
   signaturesRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 24,
      gap: 24,
   },
   signatureBox: {
      flex: 1,
   },
   signatureLabel: {
      fontWeight: "bold",
      color: DARK,
      marginBottom: 4,
   },
   signatureMention: {
      fontSize: 8,
      color: "#666",
      fontStyle: "italic",
      marginBottom: 24,
   },
});

export function ContractDocument({
   data = {},
   logoDataUrl = null,
}) {
   const nomSociete = data.nom_societe ?? "";
   const nomClient = data.nom_client ?? "";
   const adresse = data.adresse ?? "";
   const email = data.email ?? "";
   const nomDomaine = data.nom_de_domaine ?? "";
   const domainesRedirection = data.domaines_redirection ?? "";
   const prixRealisation = data.prix_realisation ?? "";
   const prixAnnuel = data.prix_annuel ?? "";
   const lieu = data.lieu ?? "";
   const date = data.date ?? "";

   return (
      <Document>
         <Page size="A4" style={styles.page}>
            <View style={styles.header}>
               {logoDataUrl ? (
                  <Image style={styles.logo} src={logoDataUrl} />
               ) : null}
               <Text style={styles.title}>
                  Contrat de création et de maintenance de site internet
               </Text>
            </View>

            <Text style={styles.sectionTitle}>Entre les soussignés :</Text>
            <View style={styles.separator} />

            <View style={styles.partiesRow}>
               <View style={styles.partyBox}>
                  <Text style={styles.partyLabel}>Graph and Co,</Text>
                  <Text>Nom commercial de M. Régis Daum,</Text>
                  <Text>
                     Auto-entrepreneur immatriculé sous le numéro SIREN/SIRET :
                     803049154 00021,
                  </Text>
                  <Text>
                     Domicilié à : 1 rue de la Lucelle, 68127
                     Sainte-Croix-en-Plaine,
                  </Text>
                  <Text>Adresse e-mail : contact@graphandco.com,</Text>
                  <Text style={{ marginTop: 6 }}>
                     Ci-après dénommé « le Prestataire »,
                  </Text>
               </View>
               <Text style={styles.partySep}>ET</Text>
               <View style={styles.partyBox}>
                  <Text style={styles.partyLabel}>{nomSociete},</Text>
                  <Text>Représentée par : {nomClient},</Text>
                  <Text>Domicilié à / Siège social : {adresse}</Text>
                  <Text>Adresse e-mail : {email},</Text>
                  <Text style={{ marginTop: 6 }}>
                     Ci-après dénommé « le Client »,
                  </Text>
               </View>
            </View>

            <Text style={styles.sectionTitle}>Il a été convenu ce qui suit :</Text>
            <View style={styles.separator} />

            <Text style={styles.articleTitle}>Article 1 – Objet du contrat</Text>
            <Text style={styles.paragraph}>
               Le présent contrat a pour objet la création, la mise en ligne et la
               maintenance d'un site Internet pour le Client par le Prestataire. Le
               Prestataire s'engage à concevoir un site conforme aux besoins
               exprimés par le Client dans le cahier des charges ou dans les
               échanges préalables.
            </Text>
            <Text style={styles.paragraph}>
               Le développement pourra être effectué sur un domaine temporaire ou
               une plateforme de préproduction avant la mise en ligne définitive sur
               le nom de domaine du Client : {nomDomaine}
               {domainesRedirection.trim()
                  ? `. Les noms de domaine suivants seront également paramétrés pour rediriger vers le nom de domaine principal : ${domainesRedirection}`
                  : ""}
            </Text>

            <Text style={styles.articleTitle}>Article 2 – Prestations incluses</Text>
            <Text style={styles.paragraph}>La prestation comprend :</Text>
            <View style={styles.bulletList}>
               <Text style={styles.bulletItem}>• La conception graphique et ergonomique du site,</Text>
               <Text style={styles.bulletItem}>• L'intégration du contenu fourni par le Client,</Text>
               <Text style={styles.bulletItem}>• Le développement et la mise en ligne du site,</Text>
               <Text style={styles.bulletItem}>• L'hébergement (si prévu par le Prestataire),</Text>
               <Text style={styles.bulletItem}>
                  • La maintenance technique et les mises à jour mineures pendant la
                  première année suivant la mise en ligne.
               </Text>
            </View>
            <Text style={styles.paragraph}>
               Les modifications structurelles ou les évolutions importantes feront
               l'objet d'un devis complémentaire.
            </Text>

            <Text style={styles.articleTitle}>Article 3 – Prix et modalités de paiement</Text>
            <Text style={styles.paragraph}>
               Le coût global de la création du site est fixé à {prixRealisation}. Ce
               tarif comprend la conception, la mise en ligne et la maintenance
               pendant la première année.
            </Text>
            <Text style={styles.paragraph}>
               Modalités de paiement : 50 % à la signature du présent contrat
               (acompte non remboursable), 50 % à la livraison du site (avant mise
               en ligne définitive).
            </Text>
            <Text style={styles.paragraph}>
               À l'issue de la première année, la maintenance et la gestion annuelle
               seront facturées {prixAnnuel} TTC par an, payables d'avance à la date
               anniversaire de la mise en ligne.
            </Text>

            <Text style={styles.articleTitle}>Article 4 – Durée du contrat</Text>
            <Text style={styles.paragraph}>
               Le présent contrat est conclu pour une durée initiale d'un (1) an à
               compter de la mise en ligne du site. Il est renouvelable tacitement
               pour des périodes successives d'un an, sauf dénonciation écrite par
               l'une des parties avec un préavis de 30 jours avant la date
               d'échéance. En cas de résiliation par le Client avant la fin de la
               période en cours, aucun remboursement prorata temporis ne sera
               effectué.
            </Text>

            <Text style={styles.articleTitle}>Article 5 – Obligations du Prestataire</Text>
            <Text style={styles.paragraph}>Le Prestataire s'engage à :</Text>
            <View style={styles.bulletList}>
               <Text style={styles.bulletItem}>• Réaliser le site conformément aux spécifications convenues,</Text>
               <Text style={styles.bulletItem}>• Respecter les délais de livraison dans la mesure du possible,</Text>
               <Text style={styles.bulletItem}>• Assurer la maintenance technique pendant la durée convenue,</Text>
               <Text style={styles.bulletItem}>• Informer le Client de tout dysfonctionnement majeur.</Text>
            </View>

            <Text style={styles.articleTitle}>Article 6 – Obligations du Client</Text>
            <Text style={styles.paragraph}>Le Client s'engage à :</Text>
            <View style={styles.bulletList}>
               <Text style={styles.bulletItem}>
                  • Fournir dans les délais convenus tous les éléments nécessaires à
                  la création du site (textes, images, logos, etc.),
               </Text>
               <Text style={styles.bulletItem}>• Respecter les droits d'auteur relatifs aux contenus fournis,</Text>
               <Text style={styles.bulletItem}>• Payer les sommes dues selon les modalités prévues au présent contrat.</Text>
            </View>

            <Text style={styles.articleTitle}>Article 7 – Propriété intellectuelle</Text>
            <Text style={styles.paragraph}>
               Le Prestataire reste titulaire des droits d'auteur sur les éléments
               graphiques et techniques qu'il a créés jusqu'au paiement intégral du
               prix. Après paiement complet, les droits d'utilisation du site sont
               transférés au Client.
            </Text>

            <Text style={styles.articleTitle}>Article 8 – Hébergement et nom de domaine</Text>
            <Text style={styles.paragraph}>
               Sauf mention contraire, l'hébergement et le nom de domaine peuvent
               être gérés par le Prestataire dans le cadre du contrat de
               maintenance. En cas de résiliation, le Prestataire transmettra au
               Client, sur demande, les accès techniques nécessaires au transfert.
            </Text>

            <Text style={styles.articleTitle}>Article 9 – Responsabilités</Text>
            <Text style={styles.paragraph}>
               Le Prestataire ne saurait être tenu responsable des dommages
               indirects, perte de données ou de chiffre d'affaires. La
               responsabilité du Prestataire est limitée au montant total payé par
               le Client pour la prestation concernée.
            </Text>

            <Text style={styles.articleTitle}>Article 10 – Loi applicable</Text>
            <Text style={styles.paragraph}>
               Le présent contrat est régi par le droit français. Tout litige sera
               soumis aux tribunaux compétents du ressort du domicile du
               Prestataire.
            </Text>

            <View style={styles.signaturesSection}>
               <Text style={styles.paragraph}>
                  Fait à {lieu}, le {date}
               </Text>
               <Text style={[styles.paragraph, { fontSize: 9 }]}>
                  En deux exemplaires originaux.
               </Text>
               <View style={styles.signaturesRow}>
                  <View style={styles.signatureBox}>
                     <Text style={styles.signatureLabel}>Le Prestataire</Text>
                     <Text style={styles.signatureMention}>
                        (Signature précédée de la mention « Lu et approuvé »)
                     </Text>
                  </View>
                  <View style={styles.signatureBox}>
                     <Text style={styles.signatureLabel}>Le Client</Text>
                     <Text style={styles.signatureMention}>
                        (Signature précédée de la mention « Lu et approuvé »)
                     </Text>
                  </View>
               </View>
            </View>
         </Page>
      </Document>
   );
}
