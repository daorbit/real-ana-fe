import { useEffect, useRef, useState, type ReactNode } from "react";
import { Box, Text, UnstyledButton, useMantineColorScheme } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Section } from "@/shared/ui/Page";
import { Starfield } from "@/shared/ui/Starfield";
import { useWorkspace } from "@/features/workspace/context";
import { useSaveWorkspaceThemeMutation } from "@/app/store";
import {
  BG_STYLES,
  applyTheme, readThemePrefs, saveThemePrefs, sharedThemePrefs, withThemeTransition, buildBgValue,
} from "@/shared/lib/theme";
import type { ThemePrefs } from "@/shared/lib/theme";
import { ModePicker } from "./appearance/ModePicker";
import classes from "./AppearanceSection.module.css";

function Group({ title, description, children }: { title: ReactNode; description?: ReactNode; children: ReactNode }) {
  return (
    <section className={classes.group}>
      <header className={classes.head}>
        <h3 className={classes.title}>{title}</h3>
        {description && <p className={classes.description}>{description}</p>}
      </header>
      {children}
    </section>
  );
}

export function AppearanceSection({
  bare = false,
  split = false,
}: {
  bare?: boolean;
  split?: boolean;
} = {}) {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState(readThemePrefs);
  const { setColorScheme } = useMantineColorScheme();
  const { active } = useWorkspace();
  const [saveWorkspaceTheme] = useSaveWorkspaceThemeMutation();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const update = (patch: Partial<ThemePrefs>) => {
    if (
      patch.preset === undefined &&
      ("accent" in patch || "bg" in patch || "cta" in patch)
    ) {
      patch = { ...patch, preset: "none" };
    }
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveThemePrefs(next);
    withThemeTransition(() => {
      applyTheme(next);
      if (patch.mode) {
        setColorScheme(patch.mode === "system" ? "auto" : patch.mode);
      }
    });

    const sharedChanged = Object.keys(sharedThemePrefs(patch)).length > 0;
    if (active?._id && sharedChanged) {
      const workspaceId = active._id;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveWorkspaceTheme({ workspaceId, theme: sharedThemePrefs(next) });
      }, 600);
    }
  };

  const body = (
    <Box className={`${classes.body} ${split ? "appearance-split" : ""}`} data-bare={bare || undefined}>
      <div>
        <Group
          title={t("settings.interfaceTheme", "Interface theme")}
          description={t("settings.interfaceThemeDesc", "Select or customize your UI theme")}
        >
          <ModePicker value={prefs.mode} onChange={(mode) => update({ mode })} />
        </Group>
      </div>

      <div>
        <Group
          title={t("settings.background", "Background")}
          description={t("settings.backgroundDesc", "The surface behind every page. Changes apply right away.")}
        >
          <Box className={classes.bgGrid}>
            {BG_STYLES.map((bg) => {
              const on = prefs.bg === bg.id;
              return (
                <UnstyledButton
                  key={bg.id}
                  className={`tile ${classes.bgTile}`}
                  data-selected={on}
                  aria-pressed={on}
                  onClick={() => update({ bg: bg.id })}
                >
                  <Box
                    className={classes.bgSwatch}
                    __vars={{ "--bg-preview": buildBgValue(bg, "var(--surface-2)", "var(--border-strong)") }}
                  >
                    {bg.kind === "stars" && (
                      <Starfield variant="app" count={bg.id === "stars-dense" ? 26 : 14} />
                    )}
                  </Box>
                  <Text className={classes.bgLabel} truncate>
                    {bg.label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </Box>
        </Group>
      </div>
    </Box>
  );

  if (bare) return body;

  return (
    <Section
      title={t("settings.appearance", "Appearance")}
      description={t("settings.appearanceDesc", "Choose how Quantalog looks on this device.")}
    >
      {body}
    </Section>
  );
}
