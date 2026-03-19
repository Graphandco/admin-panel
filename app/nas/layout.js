export const metadata = {
  title: "NAS - Graph & Co",
  description: "Tableau de bord des NAS Unraid et Synology (RAM, CPU)",
};

export default function Layout({ children }) {
  return (
    <div>
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">NAS</h1>
        <div id="nas-refresh-portal" />
      </header>
      {children}
    </div>
  );
}
