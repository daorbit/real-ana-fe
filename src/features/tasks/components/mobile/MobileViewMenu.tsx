import { Button, Menu } from "@mantine/core";
import { Check, ChevronDown } from "lucide-react";
import type { BoardView } from "../../types";
import { VIEWS } from "../toolbarOptions";
import classes from "./MobileControls.module.css";

export function MobileViewMenu({ view, onView }: { view: BoardView; onView: (value: BoardView) => void }) {
  const current = VIEWS.find((item) => item.value === view) ?? VIEWS[0];
  const Icon = current.icon;

  return (
    <Menu position="bottom-start">
      <Menu.Target>
        <Button
          className={classes.control}
          variant="default"
          leftSection={<Icon size={16} />}
          rightSection={<ChevronDown size={15} />}
          aria-label={`View: ${current.label}`}
        >
          {current.label}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>View</Menu.Label>
        {VIEWS.map(({ value, label, icon: ItemIcon }) => (
          <Menu.Item
            key={value}
            leftSection={<ItemIcon size={18} />}
            rightSection={value === view ? <Check size={16} /> : null}
            onClick={() => onView(value)}
          >
            {label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
