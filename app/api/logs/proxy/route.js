/**
 * Proxy SSE / snapshot vers admin-api (clé API côté serveur Next).
 * EventSource navigateur → same-origin → admin-api.
 */
const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://admin-api:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildUpstream(request) {
   const src = new URL(request.url);
   const kind = src.searchParams.get("kind"); // docker | caddy
   const id = src.searchParams.get("id");
   const mode = src.searchParams.get("mode") || "snapshot"; // snapshot | stream
   const tail = src.searchParams.get("tail") || "200";
   const timestamps = src.searchParams.get("timestamps") ?? "1";
   const filter = src.searchParams.get("filter") || "";

   if (!kind || !id) {
      return { error: "kind et id requis", status: 400 };
   }
   if (kind !== "docker" && kind !== "caddy") {
      return { error: "kind invalide", status: 400 };
   }

   const base =
      kind === "docker"
         ? `/api/logs/docker/${encodeURIComponent(id)}`
         : `/api/logs/caddy/${encodeURIComponent(id)}`;

   const q = new URLSearchParams();
   q.set("tail", tail);
   if (kind === "docker") q.set("timestamps", timestamps);
   if (filter) q.set("filter", filter);

   const path =
      mode === "stream" ? `${base}/stream?${q}` : `${base}?${q}`;

   return { url: `${ADMIN_API_URL}${path}` };
}

export async function GET(request) {
   const built = buildUpstream(request);
   if (built.error) {
      return Response.json({ success: false, error: built.error }, { status: built.status });
   }

   const headers = {};
   if (ADMIN_API_KEY) headers["X-API-Key"] = ADMIN_API_KEY;

   const mode = new URL(request.url).searchParams.get("mode") || "snapshot";

   try {
      const upstream = await fetch(built.url, {
         headers,
         cache: "no-store",
         signal: request.signal,
      });

      if (mode === "stream") {
         if (!upstream.ok || !upstream.body) {
            const errText = await upstream.text().catch(() => "");
            return Response.json(
               {
                  success: false,
                  error: errText.slice(0, 300) || `Upstream ${upstream.status}`,
               },
               { status: upstream.status || 502 },
            );
         }

         return new Response(upstream.body, {
            status: 200,
            headers: {
               "Content-Type": "text/event-stream; charset=utf-8",
               "Cache-Control": "no-cache, no-transform",
               Connection: "keep-alive",
               "X-Accel-Buffering": "no",
            },
         });
      }

      const data = await upstream.json();
      return Response.json(data, { status: upstream.status });
   } catch (err) {
      if (err.name === "AbortError") {
         return new Response(null, { status: 499 });
      }
      return Response.json(
         { success: false, error: err.message || "Proxy logs échoué" },
         { status: 502 },
      );
   }
}
