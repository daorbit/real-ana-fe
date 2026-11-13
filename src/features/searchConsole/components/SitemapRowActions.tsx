import { ActionIcon, Button, Loader, Tooltip } from "@mantine/core";
import { Trash2 } from "lucide-react";
import classes from "./sitemaps.module.css";

export function SitemapRowActions({
  busy,
  onResubmit,
  onRemove,
}: {
  busy: boolean;
  onResubmit: () => void;
  onRemove: () => void;
}) {
  if (busy) return <Loader size={14} color="gray" />;

  return (
    <span className={classes.rowButtons}>
      <Button variant="default" size="compact-sm" radius="xl" onClick={onResubmit}>
        Resubmit
      </Button>
      <Tooltip label="Remove sitemap" withArrow>
        <ActionIcon variant="default" size={28} radius="xl" aria-label="Remove sitemap" onClick={onRemove}>
          <Trash2 size={13} />
        </ActionIcon>
      </Tooltip>
    </span>
  );
}
