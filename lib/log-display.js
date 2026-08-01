/**
 * Coloration / formatage logs (inspiré DockPanel)
 * Timestamps Docker = UTC → conversion Europe/Paris par défaut
 */

export const LOG_TIMEZONE = "Europe/Paris";

/** Préfixe Docker : 2026-07-31T21:09:16.956660881Z */
const DOCKER_TS_RE =
   /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)(\s+)([\s\S]*)$/;

export function detectLogLevel(line) {
   const s = String(line || "");
   if (/\b(error|err|fatal|panic|crit|critical|emerg)\b|\b5\d{2}\b/i.test(s)) {
      return "error";
   }
   if (/\b(warn|warning)\b|\b4\d{2}\b/i.test(s)) {
      return "warn";
   }
   if (/\b(info|notice|debug)\b/i.test(s)) {
      return "info";
   }
   return "default";
}

export function logLineClassName(line) {
   const level = detectLogLevel(line);
   if (level === "error") return "text-red-400";
   if (level === "warn") return "text-amber-400";
   if (level === "info") return "text-sky-400/90";
   return "text-foreground/85";
}

/**
 * @param {string|number|Date} input ISO string, Date, or unix seconds/ms
 */
export function formatInTimeZone(input, timeZone = LOG_TIMEZONE) {
   let d;
   if (input instanceof Date) {
      d = input;
   } else if (typeof input === "number") {
      d = new Date(input > 1e12 ? input : input * 1000);
   } else {
      d = new Date(String(input));
   }
   if (Number.isNaN(d.getTime())) return String(input);
   return new Intl.DateTimeFormat("fr-FR", {
      timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
   }).format(d);
}

function localizeJsonPayload(text, { localTime, timeZone }) {
   const t = String(text || "").trim();
   if (!(t.startsWith("{") || t.startsWith("["))) return null;
   try {
      const obj = JSON.parse(t);
      if (localTime && obj && typeof obj === "object" && !Array.isArray(obj)) {
         if (typeof obj.ts === "number") {
            obj.time = formatInTimeZone(obj.ts, timeZone);
         }
      }
      return JSON.stringify(obj, null, 2);
   } catch {
      return null;
   }
}

/**
 * Affiche une ligne de log : timestamps locaux + JSON pretty optionnel
 * @param {string} line
 * @param {{ localTime?: boolean, prettyJson?: boolean, timeZone?: string }} opts
 */
export function formatLogLine(
   line,
   {
      localTime = true,
      prettyJson = true,
      timeZone = LOG_TIMEZONE,
   } = {},
) {
   const raw = String(line ?? "");
   const m = raw.match(DOCKER_TS_RE);

   let prefix = "";
   let body = raw;

   if (m) {
      const iso = m[1];
      const sep = m[2];
      body = m[3];
      if (localTime) {
         prefix = `${formatInTimeZone(iso, timeZone)}${sep}`;
      } else {
         prefix = `${iso}${sep}`;
      }
   }

   if (prettyJson) {
      const pretty = localizeJsonPayload(body, { localTime, timeZone });
      if (pretty != null) return prefix + pretty;
   }

   return prefix + body;
}

/** @deprecated use formatLogLine with options */
export function prettifyOnly(line) {
   return formatLogLine(line, { localTime: false, prettyJson: true });
}

/**
 * Résout un param ?container= vers un id Docker (id, shortId ou nom)
 */
export function resolveDockerContainerId(list, param) {
   if (!param || !list?.length) return null;
   const p = String(param).trim().replace(/^\//, "");
   if (!p) return null;

   const byId = list.find(
      (c) =>
         c.id === p ||
         c.shortId === p ||
         (c.id && c.id.startsWith(p)) ||
         (c.shortId && p.startsWith(c.shortId)),
   );
   if (byId) return byId.id;

   const byName = list.find(
      (c) =>
         c.name === p ||
         c.name?.replace(/^\//, "") === p ||
         c.name?.toLowerCase() === p.toLowerCase(),
   );
   return byName?.id || null;
}
