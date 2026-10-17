import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { useTitle } from "@/shared/lib/useTitle";
import { useInstagramReturn } from "@/features/social/useInstagramReturn";
import { ConnectionsBoard } from "@/features/integrations/components/board/ConnectionsBoard";

export default function Apps() {
  useTitle("Apps");
  useInstagramReturn();

  return (
    <AppShell>
      <PageHeader
        title="Apps"
        description="Turn on Quantalog apps, and connect the social accounts and the email, payment, calendar and chat tools your workspace uses."
      />
      <ConnectionsBoard />
    </AppShell>
  );
}
