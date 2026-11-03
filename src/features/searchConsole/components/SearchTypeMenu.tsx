import { Menu, UnstyledButton } from "@mantine/core";
import { Check, ChevronsUpDown } from "lucide-react";
import type { SearchType } from "@/shared/types";
import { SEARCH_TYPE_OPTIONS } from "../searchMetrics";
import classes from "./searchConsole.module.css";

const ALL = SEARCH_TYPE_OPTIONS.flatMap((g) => g.items);

export function SearchTypeMenu({
  type,
  onChange,
  disabled,
}: {
  type: SearchType;
  onChange: (type: SearchType) => void;
  disabled?: boolean;
}) {
  const current = ALL.find((o) => o.value === type) ?? ALL[0];

  return (
    <Menu position="bottom-start" width={200} disabled={disabled}>
      <Menu.Target>
        <UnstyledButton className={classes.typeButton} aria-label={`Search type: ${current.label}`}>
          {current.label}
          <ChevronsUpDown size={12} className={classes.typeChevron} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {SEARCH_TYPE_OPTIONS.map((group, i) => (
          <div key={group.group}>
            {i > 0 && <Menu.Divider />}
            <Menu.Label>{group.group}</Menu.Label>
            {group.items.map((o) => {
              const on = o.value === type;
              return (
                <Menu.Item
                  key={o.value}
                  className={classes.typeItem}
                  data-on={on || undefined}
                  rightSection={on ? <Check size={13} className={classes.typeCheck} /> : undefined}
                  onClick={() => onChange(o.value as SearchType)}
                >
                  {o.label}
                </Menu.Item>
              );
            })}
          </div>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
