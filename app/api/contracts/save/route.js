import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const CONTRACTS_DIR = process.env.CONTRACTS_DIR || path.join(process.cwd(), "contracts");
const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://admin-api:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

async function createContractInDb({ clientId, filename }) {
   const url = `${ADMIN_API_URL}/api/contracts`;
   const res = await fetch(url, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         ...(ADMIN_API_KEY && { "X-API-Key": ADMIN_API_KEY }),
      },
      body: JSON.stringify({
         client_id: Number(clientId),
         filename,
      }),
   });
   const data = await res.json();
   if (!data.success) throw new Error(data.error || "Erreur création contrat en base");
   return data.contract;
}

export async function POST(request) {
   try {
      const formData = await request.formData();
      const file = formData.get("file");
      const clientId = formData.get("clientId");

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

      await mkdir(CONTRACTS_DIR, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = String(formData.get("clientName") || "client")
         .replace(/[^a-zA-Z0-9-_àâäéèêëïîôùûüç\s]/g, "")
         .replace(/\s+/g, "_")
         .slice(0, 50);
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `contrat_${safeName}_${timestamp}.pdf`;
      const filepath = path.join(CONTRACTS_DIR, filename);

      await writeFile(filepath, buffer);

      try {
         await createContractInDb({
            clientId,
            filename,
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
      console.error("contract save error:", err.message);
      return NextResponse.json(
         { error: err.message || "Erreur lors de la sauvegarde" },
         { status: 500 }
      );
   }
}
