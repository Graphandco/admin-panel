import PluginsTab from "@/components/wordpress/PluginsTab";

export default function WordPressPluginsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Extensions</h2>
      <PluginsTab />
    </div>
  );
}
