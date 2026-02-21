export const metadata = {
  title: "Admin Panel - Graph and Co",
  description:
     "Panneau d'administration de Graph and Co",
  openGraph: {
     title: "Admin Panel - Graph and Co",
     description:
        "Panneau d'administration de Graph and Co",
     url: "https://admin.graphandco.com",
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

export default function Page() {
  return (

        <div>
          <h1 className="text-2xl text-white font-bold mb-4">Homepage</h1>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
        </div>
  )
}
