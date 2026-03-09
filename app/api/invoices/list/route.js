import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const INVOICES_DIR = process.env.INVOICES_DIR || path.join(process.cwd(), "invoices");

export async function GET() {
   try {
      let files = [];
      try {
         const entries = await readdir(INVOICES_DIR, { withFileTypes: true });
         files = entries
            .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".pdf"))
            .map((e) => ({
               name: e.name,
               path: `/api/invoices/download?file=${encodeURIComponent(e.name)}`,
            }))
            .sort((a, b) => b.name.localeCompare(a.name));
      } catch (err) {
         if (err.code !== "ENOENT") throw err;
      }
      return NextResponse.json({ invoices: files });
   } catch (err) {
      console.error("invoice list error:", err.message);
      return NextResponse.json(
         { error: err.message || "Erreur lors de la lecture" },
         { status: 500 }
      );
   }
}
