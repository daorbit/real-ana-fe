import { Button, Menu } from "@mantine/core";
import { ChevronDown, FileSearch } from "lucide-react";
import { useIndexCheckRun } from "../../useIndexCheckRun";
import { useSearchEntitlements } from "../../useSearchEntitlements";
import classes from "./indexing.module.css";

const SIZES = [10, 25, 50];

export function IndexCheckButton({ workspaceId, siteId }: { workspaceId: string; siteId: string }) {
  const { inspectionsLeft, canInspect } = useSearchEntitlements();
  const { run, stop, progress } = useIndexCheckRun(workspaceId, siteId);

  if (progress) {
    return (
      <div className={classes.run} role="status">
        <span className={classes.runText}>
          Checked {progress.done} of {progress.total}
        </span>
        <Button variant="default" onClick={stop}>
          Stop
        </Button>
      </div>
    );
  }

  return (
    <div className={classes.run}>
      {inspectionsLeft !== null && (
        <span className={classes.runText}>{inspectionsLeft.toLocaleString()} index checks left</span>
      )}
      <Menu position="bottom-end" width={220}>
        <Menu.Target>
          <Button leftSection={<FileSearch size={15} />} rightSection={<ChevronDown size={14} />} disabled={!canInspect}>
            Check pages
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Uses one index check per page</Menu.Label>
          {SIZES.map((size) => (
            <Menu.Item key={size} onClick={() => void run(size)}>
              Next {size} pages
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
