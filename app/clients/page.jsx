import { ClientsTab } from "@/components/clients/ClientsTab";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestion des clients — ajout, modification et suppression.
        </p>
      </div>
      <ClientsTab />
    </div>
  );
}
