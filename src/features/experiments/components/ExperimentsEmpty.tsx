import { FlaskConical } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";

export function ExperimentsEmpty({ canEdit, hasSites, onCreate }: { canEdit: boolean; hasSites: boolean; onCreate: () => void }) {
  return (
    <EmptyState
      icon={FlaskConical}
      title="Run your first A/B test"
      description="Try a new headline, button or page against the original and see which one gets more visitors to your goal."
      action={canEdit && hasSites ? { label: "New A/B test", onClick: onCreate } : undefined}
      actionNote={!hasSites ? "Add a site first. Tests run through its tracking code." : canEdit ? undefined : "An editor of this workspace can create tests."}
    />
  );
}
