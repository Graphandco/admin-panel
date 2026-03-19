export const metadata = {
  title: "Déploiements - Graph & Co",
  description: "Lance les déploiements (deploy.sh) des projets",
};

export default function Layout({ children }) {
  return (
    <div>
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Déploiements</h1>
      </header>
      {children}
    </div>
  );
}
