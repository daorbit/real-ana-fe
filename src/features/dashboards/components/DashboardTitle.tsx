import { useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { Pencil } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RenameDashboardModal } from "@/features/dashboards/components/RenameDashboardModal";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export function DashboardTitle({
  name,
  icon: Icon,
  canEdit,
  onRename,
}: {
  name: string;
  icon: LucideIcon;
  canEdit: boolean;
  onRename: (next: string) => Promise<boolean>;
}) {
  const [renaming, setRenaming] = useState(false);

  return (
    <div className={classes.titleRow}>
      <span className={classes.titleIcon}><Icon size={18} /></span>
      <h1 className={classes.title}>{name}</h1>
      {canEdit && (
        <>
          <Tooltip label="Rename" withArrow>
            <ActionIcon variant="subtle" color="gray" aria-label="Rename dashboard" onClick={() => setRenaming(true)}>
              <Pencil size={15} />
            </ActionIcon>
          </Tooltip>
          <RenameDashboardModal
            opened={renaming}
            name={name}
            onClose={() => setRenaming(false)}
            onSave={onRename}
          />
        </>
      )}
    </div>
  );
}
