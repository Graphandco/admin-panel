import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const INVOICES_DIR = process.env.INVOICES_DIR || path.join(process.cwd(), "invoices");
const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://admin-api:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

async function createInvoiceInDb({ clientId, invoiceNumber, filename, totalTtc }) {
   const url = `${ADMIN_API_URL}/api/invoices`;
   const res = await fetch(url, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         ...(ADMIN_API_KEY && { "X-API-Key": ADMIN_API_KEY }),
      },
      body: JSON.stringify({
         client_id: Number(clientId),
         invoice_number: String(invoiceNumber || ""),
         filename,
         total_ttc: totalTtc != null ? Number(totalTtc) : null,
      }),
   });
   const data = await res.json();
   if (!data.success) throw new Error(data.error || "Erreur création facture en base");
   return data.invoice;
}

export async function POST(request) {
   try {
      const formData = await request.formData();
      const file = formData.get("file");
      const invoiceNumber = formData.get("invoiceNumber");
      const clientId = formData.get("clientId");
      const totalTtc = formData.get("totalTtc");

      if (!file || typeof file.arrayBuffer !== "function") {
         return NextResponse.json(
            { error: "Fichier PDF requis" },
            { status: 400 }
         );
      }
      if (!clientId) {
         return NextResponse.json(
            { error: "Client requis" },
            { status: 400 }
         );
      }

      await mkdir(INVOICES_DIR, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      const safeNum = String(invoiceNumber || "facture")
         .replace(/[^a-zA-Z0-9-_]/g, "_");
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `facture_${safeNum}_${timestamp}.pdf`;
      const filepath = path.join(INVOICES_DIR, filename);

      await writeFile(filepath, buffer);

      try {
         await createInvoiceInDb({
            clientId,
            invoiceNumber: invoiceNumber || "",
            filename,
            totalTtc: totalTtc != null ? Number(totalTtc) : null,
         });
      } catch (dbErr) {
         try {
            await unlink(filepath);
         } catch {
            /* ignore */
         }
         throw dbErr;
      }

      return NextResponse.json({
         success: true,
         filename,
         path: filepath,
      });
   } catch (err) {
      console.error("invoice save error:", err.message);
      return NextResponse.json(
         { error: err.message || "Erreur lors de la sauvegarde" },
         { status: 500 }
      );
   }
}
