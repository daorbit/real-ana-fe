import { ActionIcon, Tooltip, UnstyledButton, useComputedColorScheme } from "@mantine/core";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ThemeMode } from "@/shared/lib/theme";
import classes from "./Rail.module.css";

const MODES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export function ThemeSwitch({ mode, onChange }: { mode: ThemeMode; onChange: (mode: ThemeMode) => void }) {
  const { t } = useTranslation();

  return (
    <div className={classes.themeSwitch} role="radiogroup" aria-label={t("settings.mode", "Mode")}>
      {MODES.map((m) => (
        <UnstyledButton
          key={m.id}
          role="radio"
          aria-checked={mode === m.id}
          data-active={mode === m.id || undefined}
          className={classes.themeOption}
          onClick={() => onChange(m.id)}
        >
          <m.icon size={14} />
          {m.label}
        </UnstyledButton>
      ))}
    </div>
  );
}

export function ThemeToggleButton({ onChange }: { onChange: (mode: ThemeMode) => void }) {
  const { t } = useTranslation();
  const dark = useComputedColorScheme("dark") === "dark";
  const label = dark ? t("nav.lightMode", "Light mode") : t("nav.darkMode", "Dark mode");

  return (
    <Tooltip label={label} withArrow openDelay={200}>
      <ActionIcon
        variant="subtle"
        color="gray"
        size={34}
        radius="md"
        className={classes.themeToggle}
        onClick={() => onChange(dark ? "light" : "dark")}
        aria-label={label}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </ActionIcon>
    </Tooltip>
  );
}
