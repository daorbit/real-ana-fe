import { PanelDrawer } from "@/shared/ui/PanelDrawer";
import type { AuditEntry } from "@/shared/types";
import { AuditDetailContent } from "./AuditDetailContent";
import { AuditDetailHead } from "./AuditDetailHead";

export function AuditDetailDrawer({
  entry,
  opened,
  onClose,
}: {
  entry: AuditEntry | null;
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <PanelDrawer
      opened={opened && Boolean(entry)}
      onClose={onClose}
      ariaLabel="Audit entry"
      size={440}
      header={entry && <AuditDetailHead entry={entry} />}
    >
      {entry && <AuditDetailContent entry={entry} />}
    </PanelDrawer>
  );
}
