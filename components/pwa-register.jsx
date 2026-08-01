"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker PWA (prod / HTTPS uniquement côté navigateur).
 */
export function PwaRegister() {
   useEffect(() => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator)) return;

      const register = async () => {
         try {
            await navigator.serviceWorker.register("/sw.js", { scope: "/" });
         } catch (err) {
            console.warn("PWA SW registration failed:", err?.message || err);
         }
      };

      // Laisse le first paint se faire
      if (document.readyState === "complete") {
         register();
      } else {
         window.addEventListener("load", register, { once: true });
      }
   }, []);

   return null;
}
