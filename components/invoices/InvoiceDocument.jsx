"use client";

import {
   Document,
   Page,
   Text,
   View,
   StyleSheet,
   Image,
} from "@react-pdf/renderer";

// Facture moderne - design agence digitale
// Couleur d'accent Graph & Co : #F1AD1E
const ACCENT = "#F1AD1E";
const DARK = "#1e293b";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const RADIUS = 8;

const styles = StyleSheet.create({
   page: {
      padding: 0,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: "#334155",
   },
   accentBar: {
      height: 4,
      backgroundColor: ACCENT,
      marginBottom: 32,
   },
   mainContent: {
      paddingHorizontal: 40,
      paddingBottom: 120,
   },
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 32,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
   },
   headerLogo: {
      width: 44,
      height: 44,
   },
   headerRight: {
      alignItems: "flex-end",
   },
   invoiceNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: DARK,
      letterSpacing: 0.5,
   },
   invoiceDate: {
      fontSize: 12,
      color: MUTED,
      marginTop: 6,
   },
   twoColumns: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 48,
      marginBottom: 32,
   },
   columnBox: {
      flex: 1,
      padding: 16,
      backgroundColor: "#fafafa",
      borderLeftWidth: 3,
      borderLeftColor: ACCENT,
      borderTopRightRadius: RADIUS,
      borderBottomRightRadius: RADIUS,
   },
   sectionTitle: {
      fontSize: 8,
      textTransform: "uppercase",
      letterSpacing: 2,
      color: MUTED,
      marginBottom: 10,
   },
   headerSectionTitle: {
      fontSize: 8,
      textTransform: "uppercase",
      letterSpacing: 2,
      color: MUTED,
      marginBottom: 5,
   },
   companyName: {
      fontSize: 13,
      fontWeight: "bold",
      color: DARK,
      marginBottom: 4,
   },
   companyLine: {
      fontSize: 10,
      color: "#475569",
      marginBottom: 1,
      lineHeight: 1.25,
   },
   paymentConditions: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#475569",
      marginTop: 10,
      lineHeight: 1.25,
   },
   section: {
      marginBottom: 28,
   },
   table: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: RADIUS,
   },
   tableHeader: {
      flexDirection: "row",
      backgroundColor: ACCENT,
      color: "white",
      paddingVertical: 12,
      paddingHorizontal: 14,
      fontSize: 9,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1,
      borderTopLeftRadius: RADIUS,
      borderTopRightRadius: RADIUS,
   },
   tableRow: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
      fontSize: 10,
   },
   tableRowLast: {
      borderBottomWidth: 0,
   },
   tableRowAlt: {
      backgroundColor: "#fafafa",
   },
   colDesc: {
      flex: 3,
   },
   colQty: {
      flex: 0.8,
      textAlign: "right",
   },
   colUnit: {
      flex: 1.2,
      textAlign: "right",
   },
   colTotal: {
      flex: 1.2,
      textAlign: "right",
      fontWeight: "bold",
   },
   totalsSection: {
      marginTop: 24,
      alignItems: "flex-end",
      width: "55%",
      marginLeft: "auto",
      padding: 16,
      backgroundColor: "#fafafa",
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: RADIUS,
   },
   totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 6,
      paddingHorizontal: 8,
      fontSize: 11,
   },
   totalLabel: {
      color: MUTED,
      fontWeight: "bold",
   },
   totalValue: {
      fontWeight: "bold",
      color: DARK,
   },
   totalMain: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 2,
      borderTopColor: ACCENT,
      fontSize: 15,
      fontWeight: "bold",
      color: ACCENT,
   },
   paymentSection: {
      marginTop: 24,
      width: "55%",
      marginLeft: "auto",
      padding: 16,
      backgroundColor: "#fafafa",
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: RADIUS,
   },
   paymentTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: DARK,
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 1,
   },
   paymentLine: {
      fontSize: 10,
      color: "#475569",
      marginBottom: 4,
      lineHeight: 1.5,
   },
   paymentLabel: {
      fontWeight: "bold",
      color: DARK,
   },
   footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: "center",
      paddingVertical: 24,
      paddingHorizontal: 40,
      backgroundColor: "#f8fafc",
      borderTopWidth: 1,
      borderTopColor: BORDER,
   },
   footerThanks: {
      fontSize: 13,
      fontWeight: "bold",
      color: DARK,
      marginBottom: 10,
   },
   footerLegal: {
      fontSize: 7,
      color: MUTED,
      lineHeight: 1.5,
      textAlign: "center",
   },
});

function formatDateFR(dateStr) {
   if (!dateStr) return "";
   const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
   if (match) return `${match[3]}/${match[2]}/${match[1]}`;
   return dateStr;
}

export function InvoiceDocument({
   client,
   invoiceNumber,
   invoiceDate,
   services = [],
   logoDataUrl = null,
   company = {},
}) {
   const totalTTC = services.reduce(
      (sum, s) => sum + (Number(s.quantity) || 0) * (Number(s.unitPrice) || 0),
      0,
   );

   const footerParts = [
      "Exonéré de TVA, art. 293-B du CGI",
      company.user,
      [company.street, company.town].filter(Boolean).join(" "),
      company.siret ? `N°SIRET ${company.siret}` : "",
   ].filter(Boolean);
   const footerLegal = company.footerLegal || footerParts.join(" - ");

   return (
      <Document>
         <Page size="A4" style={styles.page}>
            <View style={styles.accentBar} />
            <View style={styles.mainContent}>
               <View style={styles.header}>
                  <View>
                     {logoDataUrl ? (
                        <Image style={styles.headerLogo} src={logoDataUrl} />
                     ) : null}
                  </View>
                  <View style={styles.headerRight}>
                     <Text style={styles.invoiceNumber}>
                        Facture n° {invoiceNumber}
                     </Text>
                     <Text style={styles.invoiceDate}>
                        {formatDateFR(invoiceDate)}
                     </Text>
                  </View>
               </View>

               <View style={styles.twoColumns}>
                  <View style={styles.columnBox}>
                     <Text style={styles.headerSectionTitle}>Émetteur</Text>
                     <Text style={styles.companyName}>
                        {company.name || "Graph and Co"}
                     </Text>
                     {company.user ? (
                        <Text style={styles.companyLine}>{company.user}</Text>
                     ) : null}
                     {company.street ? (
                        <Text style={styles.companyLine}>{company.street}</Text>
                     ) : null}
                     {company.town ? (
                        <Text style={styles.companyLine}>{company.town}</Text>
                     ) : null}
                     {company.phone ? (
                        <Text style={styles.companyLine}>
                           Tél. {company.phone}
                        </Text>
                     ) : null}
                     {company.email ? (
                        <Text style={styles.companyLine}>{company.email}</Text>
                     ) : null}
                     {company.siret ? (
                        <Text style={styles.companyLine}>
                           N°SIRET {company.siret}
                        </Text>
                     ) : null}
                  </View>
                  <View style={styles.columnBox}>
                     <Text style={styles.headerSectionTitle}>Facturé à</Text>
                     <Text style={styles.companyName}>
                        {client?.company || client?.name || ""}
                     </Text>
                     {client?.company && client?.name ? (
                        <Text style={styles.companyLine}>{client.name}</Text>
                     ) : null}
                     {client?.adresse ? (
                        <Text style={styles.companyLine}>{client.adresse}</Text>
                     ) : null}
                     <Text style={styles.paymentConditions}>
                        Conditions de réglement : 15 jours
                     </Text>
                  </View>
               </View>

               <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                     Détail des prestations
                  </Text>
                  <View style={styles.table}>
                     <View style={styles.tableHeader}>
                        <Text style={styles.colDesc}>Désignation</Text>
                        <Text style={styles.colQty}>Qté</Text>
                        <Text style={styles.colUnit}>Prix unit. TTC</Text>
                        <Text style={styles.colTotal}>Total TTC</Text>
                     </View>
                     {services.map((s, i) => {
                        const qty = Number(s.quantity) || 0;
                        const unit = Number(s.unitPrice) || 0;
                        const total = qty * unit;
                        return (
                           <View
                              key={i}
                              style={[
                                 styles.tableRow,
                                 i % 2 === 1 ? styles.tableRowAlt : {},
                                 i === services.length - 1
                                    ? styles.tableRowLast
                                    : {},
                              ]}
                           >
                              <Text style={styles.colDesc}>
                                 {s.description || "—"}
                              </Text>
                              <Text style={styles.colQty}>{qty}</Text>
                              <Text style={styles.colUnit}>
                                 {unit.toLocaleString("fr-FR", {
                                    minimumFractionDigits: 2,
                                 })}{" "}
                                 €
                              </Text>
                              <Text style={styles.colTotal}>
                                 {total.toLocaleString("fr-FR", {
                                    minimumFractionDigits: 2,
                                 })}{" "}
                                 €
                              </Text>
                           </View>
                        );
                     })}
                  </View>
               </View>

               <View style={styles.totalsSection}>
                  <View style={[styles.totalRow, styles.totalMain]}>
                     <Text style={styles.totalLabel}>Total TTC</Text>
                     <Text style={styles.totalValue}>
                        {totalTTC.toLocaleString("fr-FR", {
                           minimumFractionDigits: 2,
                        })}{" "}
                        €
                     </Text>
                  </View>
               </View>

               {company.iban || company.bic ? (
                  <View style={styles.paymentSection}>
                     <Text style={styles.paymentTitle}>
                        Informations de paiement
                     </Text>
                     {company.iban ? (
                        <Text style={styles.paymentLine}>
                           <Text style={styles.paymentLabel}>IBAN</Text> :{" "}
                           {company.iban}
                        </Text>
                     ) : null}
                     {company.bic ? (
                        <Text style={styles.paymentLine}>
                           <Text style={styles.paymentLabel}>BIC</Text> :{" "}
                           {company.bic}
                        </Text>
                     ) : null}
                  </View>
               ) : null}
            </View>

            <View style={styles.footer}>
               <Text style={styles.footerThanks}>Merci de votre confiance</Text>
               <Text style={styles.footerLegal}>{footerLegal}</Text>
            </View>
         </Page>
      </Document>
   );
}
