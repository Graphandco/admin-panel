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
            <h1 className="text-2xl font-bold mb-4 text-white">Docker</h1>
            {children}
        </div>
    )
}