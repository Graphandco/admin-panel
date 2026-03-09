import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const CONTRACTS_DIR = process.env.CONTRACTS_DIR || path.join(process.cwd(), "contracts");

export async function GET(request) {
   try {
      const { searchParams } = new URL(request.url);
      const file = searchParams.get("file");
      if (!file || file.includes("..") || file.includes("/") || file.includes("\\")) {
         return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
      }
      const filepath = path.join(CONTRACTS_DIR, file);
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
      console.error("contract download error:", err.message);
      return NextResponse.json(
         { error: err.message || "Erreur lors du téléchargement" },
         { status: 500 }
      );
   }
}
