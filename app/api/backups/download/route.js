import { NextResponse } from "next/server";

const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://admin-api:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

/**
 * Proxy téléchargement d'un fichier depuis un snapshot Restic (restic dump).
 * GET /api/backups/download?snapshot=xxx&path=/absolute/path
 */
export async function GET(request) {
   try {
      const { searchParams } = new URL(request.url);
      const snapshot = searchParams.get("snapshot") || "";
      const filePath = searchParams.get("path") || "";

      if (!/^[a-f0-9]{8,64}$/i.test(snapshot)) {
         return NextResponse.json({ error: "Snapshot invalide" }, { status: 400 });
      }
      if (!filePath.startsWith("/") || filePath.includes("\0")) {
         return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
      }

      const url =
         `${ADMIN_API_URL}/api/backups/snapshots/${encodeURIComponent(snapshot)}/dump` +
         `?path=${encodeURIComponent(filePath)}`;

      const headers = {};
      if (ADMIN_API_KEY) headers["X-API-Key"] = ADMIN_API_KEY;

      const upstream = await fetch(url, { headers, cache: "no-store" });

      if (!upstream.ok) {
         let message = "Erreur lors du téléchargement";
         try {
            const data = await upstream.json();
            message = data.error || message;
         } catch {
            /* ignore */
         }
         return NextResponse.json({ error: message }, { status: upstream.status });
      }

      const contentType =
         upstream.headers.get("Content-Type") || "application/octet-stream";
      const disposition =
         upstream.headers.get("Content-Disposition") ||
         `attachment; filename="download.bin"`;

      return new NextResponse(upstream.body, {
         status: 200,
         headers: {
            "Content-Type": contentType,
            "Content-Disposition": disposition,
            "Cache-Control": "no-store",
         },
      });
   } catch (err) {
      console.error("backup download error:", err.message);
      return NextResponse.json(
         { error: err.message || "Erreur lors du téléchargement" },
         { status: 500 },
      );
   }
}
