import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const QUOTES_DIR = process.env.QUOTES_DIR || path.join(process.cwd(), "quotes");

export async function GET(request) {
   try {
      const { searchParams } = new URL(request.url);
      const file = searchParams.get("file");
      const preview = searchParams.get("preview");
      if (!file || file.includes("..") || file.includes("/") || file.includes("\\")) {
         return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
      }
      const filepath = path.join(QUOTES_DIR, file);
      const buffer = await readFile(filepath);
      const disposition =
         preview === "1" ? "inline" : `attachment; filename="${file}"`;
      return new NextResponse(buffer, {
         headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": disposition,
         },
      });
   } catch (err) {
      if (err.code === "ENOENT") {
         return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
      }
      console.error("quote download error:", err.message);
      return NextResponse.json(
         { error: err.message || "Erreur lors du téléchargement" },
         { status: 500 }
      );
   }
}
