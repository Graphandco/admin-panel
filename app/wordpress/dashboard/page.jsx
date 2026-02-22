import SitesRecapCard from "@/components/wordpress/SitesRecapCard";
import PluginsCard from "@/components/wordpress/PluginsCard";
import RecentChangesCard from "@/components/wordpress/RecentChangesCard";

export default function WordPressDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SitesRecapCard />
        <PluginsCard />
        <RecentChangesCard />
      </div>
    </div>
  );
}
