import { Anchor, Button } from "@mantine/core";
import { LockOpen, Power } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/features/integrations/components/logos/BrandMarks";
import { useToggleWorkspaceApp } from "@/features/integrations/hooks/useToggleWorkspaceApp";
import { useAppUnlock } from "@/features/integrations/hooks/useAppUnlock";
import { WORKSPACE_APP_INFO } from "@/features/integrations/lib/quantalogApps";
import { PanelControls } from "@/features/notes/components/PanelControls";
import classes from "@/features/notes/components/Notes.module.css";
import { appsPath } from "@/features/integrations/lib/appsPath";

const INFO = WORKSPACE_APP_INFO.notes;

export function NotesAppGate({
  expanded,
  onToggleExpand,
  onClose,
}: {
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}) {
  const app = useToggleWorkspaceApp("notes");
  const unlock = useAppUnlock("notes");

  return (
    <>
      <header className={classes.listHead}>
        <div className={classes.listHeadTop} data-drag-handle>
          <h2 className={classes.largeTitle}>Notes</h2>
          <PanelControls expanded={expanded} onToggleExpand={onToggleExpand} onClose={onClose} />
        </div>
      </header>
      <div className={classes.empty}>
        <BrandMark id={INFO.tileId} size={52} />
        <span className={classes.emptyTitle}>{INFO.name}</span>
        <span className={classes.emptyText}>{INFO.tagline}</span>
        {app.canManage && unlock.locked ? (
          <Button
            size="sm"
            radius="xl"
            leftSection={<LockOpen size={14} />}
            component={Link}
            to={appsPath(INFO.tileId)}
            onClick={onClose}
          >
            {unlock.priceLabel ? `Unlock for ${unlock.priceLabel}` : "Unlock Notes"}
          </Button>
        ) : app.canManage ? (
          <Button size="sm" radius="xl" leftSection={<Power size={14} />} loading={app.saving} onClick={() => void app.toggle(true)}>
            Enable Notes
          </Button>
        ) : (
          <span className={classes.emptyText}>
            Ask a workspace admin to {unlock.locked ? "unlock" : "enable"} it in{" "}
            <Anchor component={Link} to={appsPath(INFO.tileId)} size="sm" onClick={onClose}>
              Apps
            </Anchor>
            .
          </span>
        )}
      </div>
    </>
  );
}
