import DeployPage from "@/components/deploy/DeployPage";

export const metadata = {
  title: "Déploiements Git - Graph & Co",
  description: "Lance les scripts deploy.sh (GitHub Actions + docker compose)",
};

export default function DeployGitRoute() {
  return <DeployPage />;
}
