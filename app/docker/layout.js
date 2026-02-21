export const metadata = {
    title: "Docker Panel - Graph & Co",
    description:
       "Panneau d'administration des conteneurs Docker de Graph & Co",
    openGraph: {
       title: "Docker Panel - Graph & Co",
       description:
          "Panneau d'administration de Graph & Co",
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

export default function Layout({ children }) {
    return (
        <div>
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Docker</h1>
                <div id="docker-refresh-portal" />
            </header>
            {children}
        </div>
    )
}