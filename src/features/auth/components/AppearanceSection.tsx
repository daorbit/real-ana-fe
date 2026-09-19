import { useEffect, useRef, useState } from "react";
import { Box, Group, Text, UnstyledButton, useMantineColorScheme } from "@mantine/core";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Section } from "@/shared/ui/Page";
import { Starfield } from "@/shared/ui/Starfield";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";
import { trace } from "@/shared/lib/analytics";
import { useSaveWorkspaceThemeMutation } from "@/app/store";
import {
  ACCENT_PRESETS, BG_STYLES, THEME_PRESETS,
  // Appearance offers mode, preset, accent and background only. Radius,
  // density, font size, table rows and motion were pulled back out: they are
  // fine-tuning nobody asked for, and each one is another way for the app to
  // look wrong. Their defaults in `theme.ts` still apply.
  applyTheme, readThemePrefs, saveThemePrefs, withThemeTransition, buildBgValue,
  contrastOn,
} from "@/shared/lib/theme";
import type { ThemeMode, ThemePrefs } from "@/shared/lib/theme";

const MODES: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

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
}: {
  bare?: boolean;
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

    if (active?._id) {
      const workspaceId = active._id;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveWorkspaceTheme({ workspaceId, theme: next });
      }, 600);
    }
  };

  const body = (
      <Box px={bare ? 0 : "lg"} py={bare ? 0 : "lg"}>
        <GroupBlock>
          <GroupLabel>{t("settings.mode", "Mode")}</GroupLabel>
          <Group gap="sm">
            {MODES.map((m) => (
              <UnstyledButton
                key={m.id}
                className="tile"
                data-selected={prefs.mode === m.id}
                onClick={() => update({ mode: m.id })}
                px="lg"
                py={10}
                style={{ fontSize: 13.5, fontWeight: 550 }}
              >
                {m.label}
              </UnstyledButton>
            ))}
          </Group>
        </GroupBlock>

        <GroupBlock>
          <GroupLabel>{t("settings.themePreset", "Theme preset")}</GroupLabel>
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
              gap: 14,
            }}
          >
            {THEME_PRESETS.map((p) => {
              const selected = prefs.preset === p.id;
              return (
                <UnstyledButton
                  key={p.id}
                  className="tile"
                  data-selected={selected}
                  onClick={() =>
                    update(
                      p.apply
                        ? { preset: p.id, ...p.apply }
                        : { preset: p.id }
                    )
                  }
                  p={0}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ height: 56, background: p.swatch }} />
                  <Text size="xs" fw={550} px={10} py={8} truncate>
                    {p.label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </Box>
          <Text size="xs" c="dimmed" mt={8}>
            {t(
              "settings.themePresetHint",
              "A preset sets accent, background and CTA style at once. Adjust any control below to fine-tune."
            )}
          </Text>
        </GroupBlock>

        <GroupBlock>
          <GroupLabel>{t("settings.accentColor", "Accent color")}</GroupLabel>
          {/* Auto-fill rather than fixed counts: this block is rendered both
              full-width in Settings and in the onboarding step's narrower
              control column, where a fixed 14 columns overflowed sideways. */}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(38px, 1fr))",
              gap: 14,
              justifyItems: "center",
            }}
          >
            {ACCENT_PRESETS.map((preset) => {
              const active = prefs.accent === preset.id;
              return (
                <UnstyledButton
                  key={preset.id}
                  onClick={() => update({ accent: preset.id })}
                  aria-label={preset.label}
                  title={preset.label}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: preset.hex,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: active
                      ? `0 0 0 2px var(--surface), 0 0 0 4px ${preset.hex}`
                      : "0 0 0 1px var(--border)",
                    transition: "box-shadow 0.12s ease",
                  }}
                >
                  {active && (
                    <Check size={15} color={contrastOn(preset.hex)} strokeWidth={3} />
                  )}
                </UnstyledButton>
              );
            })}
          </Box>
        </GroupBlock>

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
