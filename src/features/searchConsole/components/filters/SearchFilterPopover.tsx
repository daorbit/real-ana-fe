import { useState } from "react";
import { Popover, UnstyledButton } from "@mantine/core";
import { ListFilter } from "lucide-react";
import type { SearchFilter, SearchType } from "@/shared/types";
import { SearchFilterForm } from "./SearchFilterForm";
import layout from "../searchConsole.module.css";

export function SearchFilterPopover({
  type,
  onAdd,
  disabled,
}: {
  type: SearchType;
  onAdd: (filter: SearchFilter) => void;
  disabled?: boolean;
}) {
  const [opened, setOpened] = useState(false);

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-start" width={320} radius="md" trapFocus>
      <Popover.Target>
        <UnstyledButton className={layout.typeButton} disabled={disabled} onClick={() => setOpened((o) => !o)}>
          <ListFilter size={14} aria-hidden />
          Add filter
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown>
        {opened && (
          <SearchFilterForm
            type={type}
            onSubmit={(filter) => {
              onAdd(filter);
              setOpened(false);
            }}
          />
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
