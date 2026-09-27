import { useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { Search } from "lucide-react";
import type { SearchType } from "@/shared/types";
import { PageFinderDialog } from "./PageFinderDialog";

export function PageFinder(props: {
  workspaceId: string;
  siteId: string;
  propertyUrl: string;
  days: number;
  type: SearchType;
  onOpen: (url: string) => void;
}) {
  const [opened, setOpened] = useState(false);

  useHotkeys([["/", () => setOpened(true)]]);

  return (
    <>
      <Tooltip label="Find a page  /" withArrow>
        <ActionIcon variant="default" size={36} radius="md" onClick={() => setOpened(true)} aria-label="Find a page">
          <Search size={16} />
        </ActionIcon>
      </Tooltip>
      <PageFinderDialog {...props} opened={opened} onClose={() => setOpened(false)} />
    </>
  );
}
