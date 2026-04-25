/**
 * access.log Caddy (NDJSON) : une entrée JSON par ligne → indentation lisible.
 * Les autres lignes (stdout texte) sont laissées telles quelles.
 */
export function prettifyCaddyLogText(text) {
   if (text == null || text === "") return text;
   const lines = text.split("\n");
   const parts = [];
   for (const line of lines) {
      const t = line.trim();
      if (!t) {
         parts.push("");
         continue;
      }
      if (t.startsWith("{") || t.startsWith("[")) {
         try {
            parts.push(JSON.stringify(JSON.parse(t), null, 2));
            continue;
         } catch {
            /* pas du JSON d'une seule ligne */
         }
      }
      parts.push(line);
   }
   return parts.join("\n\n");
}
