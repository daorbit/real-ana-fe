import { useState } from "react";
import { Popover, TextInput, UnstyledButton } from "@mantine/core";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlanIcon } from "@/features/billing/components/PlanIcons";
import type { Workspace } from "@/shared/types";
import { roleLabel } from "./format";
import classes from "./Workspaces.module.css";

interface Props {
  workspaces: Workspace[];
  active: Workspace;
  onSelect: (id: string) => void;
  onCreate?: () => void;
}

export function WorkspaceSwitcher({ workspaces, active, onSelect, onCreate }: Props) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const shown = q ? workspaces.filter((w) => w.name.toLowerCase().includes(q)) : workspaces;

  const close = () => {
    setOpened(false);
    setQuery("");
  };

  return (
    <Popover
      opened={opened}
      onChange={(next) => (next ? setOpened(true) : close())}
      position="bottom-start"
      width={360}
      radius="lg"
      shadow="lg"
      offset={8}
      trapFocus
      withinPortal
      classNames={{ dropdown: classes.switcherMenu }}
    >
      <Popover.Target>
        <UnstyledButton
          className={classes.switcherTrigger}
          aria-label={t("workspaces.switchLabel")}
          aria-expanded={opened}
          data-open={opened || undefined}
          onClick={() => (opened ? close() : setOpened(true))}
        >
          <span className={classes.switcherName}>{active.name}</span>
          <ChevronDown size={20} className={classes.chev} />
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown>
        <TextInput
          data-autofocus
          variant="unstyled"
          className={classes.switcherSearch}
          leftSection={<Search size={14} />}
          placeholder={t("workspaces.findWorkspace")}
          aria-label={t("workspaces.findWorkspace")}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />

        <div className={classes.switcherList}>
          {shown.map((w) => {
            const isActive = w._id === active._id;
            const plan = w.billing?.plan;
            return (
              <UnstyledButton
                key={w._id}
                className={classes.switcherRow}
                data-active={isActive || undefined}
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  onSelect(w._id);
                  close();
                }}
              >
                {plan && <PlanIcon slug={plan.slug} size={20} uid={`switcher-${w._id}`} />}
                <span className={classes.switcherRowText}>
                  <span className={classes.switcherRowName}>{w.name}</span>
                  <span className={classes.switcherRowMeta}>{plan?.name ?? roleLabel(w.role)}</span>
                </span>
                {isActive && <Check size={15} strokeWidth={2.5} className={classes.switcherCheck} />}
              </UnstyledButton>
            );
          })}
          {shown.length === 0 && (
            <p className={classes.switcherEmpty}>{t("workspaces.picker.noMatch", { query: query.trim() })}</p>
          )}
        </div>

        {onCreate && (
          <UnstyledButton
            className={classes.switcherNew}
            onClick={() => {
              close();
              onCreate();
            }}
          >
            <Plus size={15} />
            {t("workspaces.newWorkspace")}
          </UnstyledButton>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
