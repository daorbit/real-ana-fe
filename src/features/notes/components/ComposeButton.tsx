import { Loader, Tooltip, UnstyledButton } from "@mantine/core";
import { SquarePen } from "lucide-react";
import classes from "@/features/notes/components/Notes.module.css";

export function ComposeButton({ onClick, loading = false }: { onClick: () => void; loading?: boolean }) {
  return (
    <Tooltip label="New note" withArrow openDelay={400}>
      <UnstyledButton className={classes.compose} onClick={onClick} disabled={loading} aria-label="New note">
        {loading ? <Loader size={14} color="var(--accent-2)" /> : <SquarePen size={17} />}
      </UnstyledButton>
    </Tooltip>
  );
}
