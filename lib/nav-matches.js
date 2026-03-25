/**
 * Indique si le pathname courant correspond à une entrée avec sous-menu
 * (URL parente ou l'une des URLs des sous-entrées).
 */
export function pathnameMatchesNavSection(pathname, item) {
   if (!item.items?.length) return false;
   const paths = [item.url, ...item.items.map((i) => i.url)].filter(Boolean);
   return paths.some(
      (u) => pathname === u || pathname.startsWith(`${u}/`),
   );
}

/**
 * Lien simple (sans sous-menu) : actif sur l'URL exacte ou les sous-chemins.
 * Pour l'accueil `/`, seule la route exacte compte.
 */
export function isNavLinkActive(pathname, url) {
   if (!url) return false;
   if (url === "/") return pathname === "/";
   return pathname === url || pathname.startsWith(`${url}/`);
}

/**
 * Sous-lien : actif si c'est la correspondance la plus longue parmi les frères
 * (évite que « Liste » /clients reste actif sur /clients/factures).
 */
export function isNavSubItemActive(pathname, subItem, allSubItems) {
   const candidates = allSubItems.filter(
      (s) =>
         pathname === s.url ||
         (s.url && pathname.startsWith(`${s.url}/`)),
   );
   if (candidates.length === 0) return false;
   const best = candidates.reduce((a, b) =>
      a.url.length >= b.url.length ? a : b,
   );
   return best.url === subItem.url;
}
