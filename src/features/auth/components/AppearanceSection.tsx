import { useEffect, useRef, useState } from "react";
import { Box, Text, UnstyledButton, useMantineColorScheme } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Section } from "@/shared/ui/Page";
import { Starfield } from "@/shared/ui/Starfield";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";
import { trace } from "@/shared/lib/analytics";
import { useSaveWorkspaceThemeMutation } from "@/app/store";
import {
  BG_STYLES,
  applyTheme, readThemePrefs, saveThemePrefs, sharedThemePrefs, withThemeTransition, buildBgValue,
} from "@/shared/lib/theme";
import type { ThemePrefs } from "@/shared/lib/theme";
import { ModePicker } from "./appearance/ModePicker";

/** A group heading with real weight and its own breathing room above — the
 *  page reads as a list of distinct decisions, not one dense wall. */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text size="sm" fw={650} mb={12} style={{ letterSpacing: "-0.005em" }}>
      {children}
    </Text>
  );
}

/** Vertical gap between one control group and the next. Generous on purpose:
 *  the earlier, denser layout read as one wall of swatches with no sense of
 *  where a decision ended and the next began. */
function GroupBlock({ children }: { children: React.ReactNode }) {
  return <Box mb={32}>{children}</Box>;
}

 

/**
 * Mode, theme preset, accent and background all live in one preference object
 * and apply immediately on click — a settings page for how the app looks
 * should show the result instantly rather than waiting on a Save button.
 */
export function AppearanceSection({
  /** Skip the Section card chrome (title + surface) — used on its own full
   *  page/tab, where the page header already carries the title and boxing
   *  the content again would waste the width it's meant to spread across. */
  bare = false,
  split = false,
}: {
  bare?: boolean;
  /** Mode, preset and accent in one column, backgrounds in a second one
      beside it (from wide screens up) — for the onboarding step, which has
      the whole width to itself. */
  split?: boolean;
} = {}) {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState(readThemePrefs);
  const { setColorScheme } = useMantineColorScheme();
  const { active } = useWorkspace();
  const { user } = useAuth();
  const [saveWorkspaceTheme] = useSaveWorkspaceThemeMutation();

  // Debounced rather than fired on every click: dragging through a swatch
  // grid or clicking several controls in a row would otherwise send one PUT
  // per click. The local apply (below) is instant either way — this only
  // delays the network write, never the visible change.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const update = (patch: Partial<ThemePrefs>) => {
    trace(user?.id, "appearance_changed", "settings", Object.keys(patch)[0] ?? "theme");
    // A manual accent/bg/cta change means the active preset no longer
    // describes the look — drop back to "Custom" unless this patch is the
    // preset itself being applied.
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
    // notify.theme(describeChange(patch));

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
      <Box px={bare ? 0 : "lg"} py={bare ? 0 : "lg"} className={split ? "appearance-split" : undefined}>
        <div>
        <GroupBlock>
          <Text size="sm" fw={650}>{t("settings.interfaceTheme", "Interface theme")}</Text>
          <Text size="sm" c="dimmed" mb={16}>
            {t("settings.interfaceThemeDesc", "Select or customize your UI theme")}
          </Text>
          <ModePicker value={prefs.mode} onChange={(mode) => update({ mode })} />
        </GroupBlock>
        </div>

        <div>
        <GroupBlock>
          <GroupLabel>{t("settings.background", "Background")}</GroupLabel>
          {/* Wide enough for the full label — "Mesh — Aurora" truncated to
              "Me…" in every tile once this column narrowed. */}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
              gap: 14,
            }}
          >
            {BG_STYLES.map((bg) => {
              const active = prefs.bg === bg.id;
              return (
                <UnstyledButton
                  key={bg.id}
                  className="tile"
                  data-selected={active}
                  onClick={() => update({ bg: bg.id })}
                  p={0}
                  style={{ overflow: "hidden" }}
                >
                
                  <div
                    style={{
                      height: 64,
                      position: "relative",
                      overflow: "hidden",
                      background: buildBgValue(bg, "var(--surface-2)", "var(--border-strong)"),
                    }}
                  >
                    {bg.kind === "stars" && (
                      <Starfield variant="app" count={bg.id === "stars-dense" ? 26 : 14} />
                    )}
                  </div>
                  <Text size="xs" fw={550} px={10} py={8} truncate>
                    {bg.label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </Box>
        </GroupBlock>
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
