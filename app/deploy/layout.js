export const metadata = {
  title: "Déploiements - Graph & Co",
  description: "Redeploy des images depuis le registry privé",
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
