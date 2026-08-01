import { Geist, Geist_Mono, Outfit } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { NotificationsBell } from "@/components/notifications-bell";
import { Separator } from "@/components/ui/separator";
import {
   SidebarInset,
   SidebarProvider,
   SidebarTrigger,
} from "@/components/ui/sidebar";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
   variable: "--font-geist-sans",
   subsets: ["latin"],
});

const geistMono = Geist_Mono({
   variable: "--font-geist-mono",
   subsets: ["latin"],
});

const APP_NAME = "Admin Panel - Graph & Co";
const APP_DESCRIPTION = "Panneau d'administration de Graph & Co";

export const metadata = {
   applicationName: APP_NAME,
   title: APP_NAME,
   description: APP_DESCRIPTION,
   manifest: "/manifest.webmanifest",
   metadataBase: new URL("https://admin.graphandco.com"),
   appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Admin Panel",
   },
   formatDetection: {
      telephone: false,
   },
   icons: {
      icon: [
         { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
         { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
         { url: "/logo192.png", sizes: "192x192", type: "image/png" },
         { url: "/logo512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
         { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
   },
   openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      url: "https://admin.graphandco.com",
      siteName: "Admin Panel",
      images: [
         {
            url: "https://graphandco.com/og-image.jpg",
            width: 1200,
            height: 630,
            alt: "Graph & Co - accueil",
         },
      ],
      type: "website",
   },
};

export const viewport = {
   themeColor: "#0f1219",
   colorScheme: "dark",
   width: "device-width",
   initialScale: 1,
   viewportFit: "cover",
};

export default function RootLayout({ children }) {
   return (
      <html lang="fr" className={outfit.variable}>
         <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            suppressHydrationWarning={true}
         >
            <TooltipProvider>
               <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                     <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/10 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex min-w-0 items-center gap-2 px-4 md:px-8">
                           <SidebarTrigger className="-ml-1" />
                           <Separator orientation="vertical" className="mr-2" />
                           <AppBreadcrumbs />
                        </div>
                        <div className="flex shrink-0 items-center pe-4 md:pe-8">
                           <NotificationsBell />
                        </div>
                     </header>
                     <div className="flex flex-1 flex-col gap-4 py-4 px-4 md:px-8">
                        {children}
                     </div>
                  </SidebarInset>
               </SidebarProvider>
            </TooltipProvider>
            <Toaster position="bottom-right" richColors />
            <PwaRegister />
         </body>
      </html>
   );
}
