import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const QUOTES_DIR = process.env.QUOTES_DIR || path.join(process.cwd(), "quotes");
const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://admin-api:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

async function createQuoteInDb({ clientId, quoteNumber, filename, totalTtc }) {
   const url = `${ADMIN_API_URL}/api/quotes`;
   const res = await fetch(url, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         ...(ADMIN_API_KEY && { "X-API-Key": ADMIN_API_KEY }),
      },
      body: JSON.stringify({
         client_id: Number(clientId),
         quote_number: String(quoteNumber || ""),
         filename,
         total_ttc: totalTtc != null ? Number(totalTtc) : null,
      }),
   });
   const data = await res.json();
   if (!data.success) throw new Error(data.error || "Erreur création devis en base");
   return data.quote;
}

export async function POST(request) {
   try {
      const formData = await request.formData();
      const file = formData.get("file");
      const quoteNumber = formData.get("quoteNumber");
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

      await mkdir(QUOTES_DIR, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      const safeNum = String(quoteNumber || "devis")
         .replace(/[^a-zA-Z0-9-_]/g, "_");
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `devis_${safeNum}_${timestamp}.pdf`;
      const filepath = path.join(QUOTES_DIR, filename);

      await writeFile(filepath, buffer);

      try {
         await createQuoteInDb({
            clientId,
            quoteNumber: quoteNumber || "",
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
      console.error("quote save error:", err.message);
      return NextResponse.json(
         { error: err.message || "Erreur lors de la sauvegarde" },
         { status: 500 }
      );
   }
}
