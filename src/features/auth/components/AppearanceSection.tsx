import { useState } from "react";
import { Box, Group, SimpleGrid, Text, UnstyledButton, useMantineColorScheme } from "@mantine/core";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Section } from "@/shared/ui/Page";
import {
  ACCENT_PRESETS, BG_STYLES, RADIUS_STYLES, DENSITIES,
  applyTheme, readThemePrefs, saveThemePrefs, withThemeTransition, buildBgValue,
} from "@/shared/lib/theme";
import type { ThemeMode } from "@/shared/lib/theme";

const MODES: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text size="xs" fw={600} c="dimmed" mb={8} style={{ letterSpacing: "0.02em" }}>
      {children}
    </Text>
  );
}

/**
 * Mode, accent, background, radius, and density all live in one preference
 * object and apply immediately on click — a settings page for how the app
 * looks should show the result instantly rather than waiting on a Save
 * button. Laid out two columns wide (controls left, a live preview right)
 * so the section uses the same width as the rest of the page instead of
 * stopping at the narrow single-column form measure.
 */
export function AppearanceSection() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState(readThemePrefs);
  const { setColorScheme } = useMantineColorScheme();

  const update = (patch: Partial<typeof prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveThemePrefs(next);
    withThemeTransition(() => {
      applyTheme(next);
      if (patch.mode) {
        setColorScheme(patch.mode === "system" ? "auto" : patch.mode);
      }
    });
  };

  return (
    <Section
      title={t("settings.appearance", "Appearance")}
      description={t("settings.appearanceDesc", "Choose how Quantalog looks on this device.")}
    >
      <Box px="lg" py="md">
        <div>
          <GroupLabel>{t("settings.mode", "MODE")}</GroupLabel>
          <Group gap="xs" mb="lg">
            {MODES.map((m) => (
              <UnstyledButton
                key={m.id}
                className="tile"
                data-selected={prefs.mode === m.id}
                onClick={() => update({ mode: m.id })}
                px="md"
                py={7}
                style={{ fontSize: 13, fontWeight: 550 }}
              >
                {m.label}
              </UnstyledButton>
            ))}
          </Group>

          <GroupLabel>{t("settings.accentColor", "ACCENT COLOR")}</GroupLabel>
          <SimpleGrid cols={{ base: 6, xs: 8, sm: 10 }} spacing={8} mb="lg">
            {ACCENT_PRESETS.map((preset) => {
              const active = prefs.accent === preset.id;
              return (
                <UnstyledButton
                  key={preset.id}
                  onClick={() => update({ accent: preset.id })}
                  aria-label={preset.label}
                  title={preset.label}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: preset.hex,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: active
                      ? `0 0 0 2px var(--surface), 0 0 0 4px ${preset.hex}`
                      : "0 0 0 1px var(--border)",
                  }}
                >
                  {active && <Check size={14} color="#fff" strokeWidth={3} />}
                </UnstyledButton>
              );
            })}
          </SimpleGrid>

          <GroupLabel>{t("settings.background", "BACKGROUND")}</GroupLabel>
          <SimpleGrid cols={{ base: 3, xs: 4, sm: 5 }} spacing={8} mb="lg">
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
                  <div style={{ height: 40, background: buildBgValue(bg, "var(--surface-2)", "var(--border-strong)") }} />
                  <Text size="10.5px" fw={550} px={7} py={5} truncate>
                    {bg.label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>

          <Group gap={28} align="flex-start">
            <div>
              <GroupLabel>{t("settings.cornerRadius", "CORNER RADIUS")}</GroupLabel>
              <Group gap="xs">
                {RADIUS_STYLES.map((r) => {
                  const active = prefs.radius === r.id;
                  return (
                    <UnstyledButton
                      key={r.id}
                      onClick={() => update({ radius: r.id })}
                      title={r.label}
                      aria-label={r.label}
                      style={{
                        width: 40,
                        height: 40,
                        display: "grid",
                        placeItems: "center",
                        background: "var(--surface-2)",
                        boxShadow: active
                          ? "inset 0 0 0 2px var(--accent)"
                          : "inset 0 0 0 1px var(--border)",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderTopLeftRadius: r.px * 0.7,
                          border: "2px solid var(--text-2)",
                          borderRight: "none",
                          borderBottom: "none",
                        }}
                      />
                    </UnstyledButton>
                  );
                })}
              </Group>
            </div>

            <div>
              <GroupLabel>{t("settings.density", "DENSITY")}</GroupLabel>
              <Group gap="xs">
                {DENSITIES.map((d) => (
                  <UnstyledButton
                    key={d.id}
                    className="tile"
                    data-selected={prefs.density === d.id}
                    onClick={() => update({ density: d.id })}
                    px="md"
                    py={7}
                    style={{ fontSize: 13, fontWeight: 550 }}
                  >
                    {d.label}
                  </UnstyledButton>
                ))}
              </Group>
            </div>
          </Group>
        </div>
      </Box>
    </Section>
  );
}
