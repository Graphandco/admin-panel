import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const INVOICES_DIR = process.env.INVOICES_DIR || path.join(process.cwd(), "invoices");

export async function POST(request) {
   try {
      const formData = await request.formData();
      const file = formData.get("file");
      const invoiceNumber = formData.get("invoiceNumber");

      if (!file || typeof file.arrayBuffer !== "function") {
         return NextResponse.json(
            { error: "Fichier PDF requis" },
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
