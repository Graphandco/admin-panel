import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const INVOICES_DIR = process.env.INVOICES_DIR || path.join(process.cwd(), "invoices");

export async function GET(request) {
   try {
      const { searchParams } = new URL(request.url);
      const file = searchParams.get("file");
      if (!file || file.includes("..") || file.includes("/") || file.includes("\\")) {
         return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
      }
      const filepath = path.join(INVOICES_DIR, file);
      const buffer = await readFile(filepath);
      return new NextResponse(buffer, {
         headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${file}"`,
         },
      });
   } catch (err) {
      if (err.code === "ENOENT") {
         return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
      }
      console.error("invoice download error:", err.message);
      return NextResponse.json(
         { error: err.message || "Erreur lors du téléchargement" },
         { status: 500 }
      );
   }
}
