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
   quoteNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: DARK,
      letterSpacing: 0.5,
   },
   quoteDate: {
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
      flex: 2.6,
   },
   colQty: {
      flex: 0.8,
      textAlign: "right",
   },
   colUnit: {
      flex: 1.4,
      textAlign: "right",
   },
   colDiscount: {
      flex: 0.8,
      textAlign: "right",
   },
   colTotal: {
      flex: 1.2,
      textAlign: "right",
      fontWeight: "bold",
   },
   totalsSection: {
      marginTop: 12,
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
   acceptNotice: {
      marginTop: 24,
      width: "55%",
      marginLeft: "auto",
      padding: 16,
      backgroundColor: "#fafafa",
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: RADIUS,
   },
   acceptNoticeText: {
      fontSize: 10,
      color: "#475569",
      lineHeight: 1.5,
      fontStyle: "italic",
   },
   dateSignatureRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 32,
      paddingHorizontal: 24,
      gap: 48,
   },
   dateSignatureItem: {
      flex: 1,
      flexDirection: "column",
      alignItems: "flex-start",
   },
   dateSignatureLabel: {
      fontSize: 9,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: MUTED,
      marginBottom: 24,
   },
   validUntil: {
      fontSize: 10,
      color: "#475569",
      marginBottom: 8,
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

function getValidUntilDate(quoteDateStr) {
   if (!quoteDateStr) return "";
   const match = String(quoteDateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
   if (!match) return quoteDateStr;
   const [_, y, m, d] = match.map(Number);
   const date = new Date(y, m - 1, d);
   date.setMonth(date.getMonth() + 1);
   const yy = date.getFullYear();
   const mm = String(date.getMonth() + 1).padStart(2, "0");
   const dd = String(date.getDate()).padStart(2, "0");
   return `${yy}-${mm}-${dd}`;
}

function formatEuro(value) {
   const n = Number(value);
   if (isNaN(n)) return "0,00";
   return n
      .toLocaleString("fr-FR", { minimumFractionDigits: 2 })
      .replace(/\s/g, " ");
}

export function QuoteDocument({
   client,
   quoteNumber,
   quoteDate,
   services = [],
   logoDataUrl = null,
   company = {},
}) {
   function getDiscountPercent(s) {
      const v = s.discountPercent;
      if (v === "" || v === null || v === undefined) return 0;
      const n = Number(v);
      return !isNaN(n) && n >= 0 && n <= 100 ? n : 0;
   }

   const totalTTC = services.reduce((sum, s) => {
      const subtotal = (Number(s.quantity) || 0) * (Number(s.unitPrice) || 0);
      const discount = getDiscountPercent(s) / 100;
      return sum + subtotal * (1 - discount);
   }, 0);

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
                     <Text style={styles.quoteNumber}>
                        Devis n° {quoteNumber}
                     </Text>
                     <Text style={styles.quoteDate}>
                        {formatDateFR(quoteDate)}
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
                     <Text style={styles.headerSectionTitle}>À</Text>
                     <Text style={styles.companyName}>
                        {client?.company || client?.name || ""}
                     </Text>
                     {client?.company && client?.name ? (
                        <Text style={styles.companyLine}>{client.name}</Text>
                     ) : null}
                     {client?.adresse ? (
                        <Text style={styles.companyLine}>{client.adresse}</Text>
                     ) : null}
                     {(client?.post_code || client?.city) ? (
                        <Text style={styles.companyLine}>
                           {[client.post_code, client.city].filter(Boolean).join(" ")}
                        </Text>
                     ) : null}
                  </View>
               </View>

               <View style={styles.section}>
                  <Text style={styles.validUntil}>
                     Devis valide jusqu'au :{" "}
                     {formatDateFR(getValidUntilDate(quoteDate))}
                  </Text>
                  <View style={styles.table}>
                     <View style={styles.tableHeader}>
                        <Text style={styles.colDesc}>Désignation</Text>
                        <Text style={styles.colQty}>Qté</Text>
                        <Text style={styles.colUnit}>Prix TTC</Text>
                        <Text style={styles.colDiscount}>Remise %</Text>
                        <Text style={styles.colTotal}>Total TTC</Text>
                     </View>
                     {services.map((s, i) => {
                        const qty = Number(s.quantity) || 0;
                        const unit = Number(s.unitPrice) || 0;
                        const discountPct = getDiscountPercent(s);
                        const subtotal = qty * unit;
                        const total =
                           discountPct > 0
                              ? subtotal * (1 - discountPct / 100)
                              : subtotal;
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
                                 {formatEuro(unit)} €
                              </Text>
                              <Text style={styles.colDiscount}>
                                 {discountPct > 0 ? `${discountPct} %` : "—"}
                              </Text>
                              <Text style={styles.colTotal}>
                                 {formatEuro(total)} €
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
                        {formatEuro(totalTTC)} €
                     </Text>
                  </View>
               </View>

               <View style={styles.acceptNotice}>
                  <Text style={styles.acceptNoticeText}>
                     Si ce devis vous convient, merci de le retourner signé
                     précédé de la mention « bon pour accord ».
                  </Text>
                  <View style={styles.dateSignatureRow}>
                     <View style={styles.dateSignatureItem}>
                        <Text style={styles.dateSignatureLabel}>Date</Text>
                     </View>
                     <View style={styles.dateSignatureItem}>
                        <Text style={styles.dateSignatureLabel}>Signature</Text>
                     </View>
                  </View>
               </View>
            </View>

            <View style={styles.footer}>
               <Text style={styles.footerThanks}>Merci de votre confiance</Text>
               <Text style={styles.footerLegal}>{footerLegal}</Text>
            </View>
         </Page>
      </Document>
   );
}
