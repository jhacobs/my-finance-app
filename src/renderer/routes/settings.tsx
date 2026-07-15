import { createFileRoute } from "@tanstack/react-router";
import { authMiddleware } from "@/renderer/auth/middleware";
import MainLayout from "@/renderer/layout/main-layout";
import TransferRulesSettings from "@/renderer/components/transfer-rules-settings";

export const Route = createFileRoute("/settings")({
  component: Settings,
  beforeLoad: async () => {
    await authMiddleware();
  },
});

function Settings() {
  return (
    <MainLayout>
      <div className="max-w-2xl">
        <TransferRulesSettings />
      </div>
    </MainLayout>
  );
}
