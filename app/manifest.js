/** @type {import('next').MetadataRoute.Manifest} */
export default function manifest() {
   return {
      name: "Admin Panel - Graph & Co",
      short_name: "Admin Panel",
      description: "Panneau d'administration de Graph & Co",
      start_url: "/",
      scope: "/",
      display: "standalone",
      orientation: "any",
      background_color: "#0f1219",
      theme_color: "#0f1219",
      categories: ["business", "utilities"],
      icons: [
         {
            src: "/logo192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
         },
         {
            src: "/logo256.png",
            sizes: "256x256",
            type: "image/png",
            purpose: "any",
         },
         {
            src: "/logo384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any",
         },
         {
            src: "/logo512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
         },
         {
            src: "/maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
         },
      ],
   };
}
