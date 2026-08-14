import { useState } from "react";
import { Box, Group, SimpleGrid, Text, UnstyledButton, useMantineColorScheme } from "@mantine/core";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Section } from "@/shared/ui/Page";
import {
  ACCENT_PRESETS, BG_STYLES, applyTheme, readThemePrefs, saveThemePrefs,
} from "@/shared/lib/theme";
import type { ThemeMode, BgStyle } from "@/shared/lib/theme";

const MODES: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

const BG_PREVIEW: Record<BgStyle, string> = {
  flat: "var(--surface-2)",
  aurora:
    "radial-gradient(at 20% 20%, rgba(59,130,246,0.35), transparent 55%), radial-gradient(at 80% 0%, rgba(139,92,246,0.28), transparent 50%), radial-gradient(at 90% 90%, rgba(236,72,153,0.22), transparent 55%), var(--surface-2)",
  meadow:
    "radial-gradient(at 15% 10%, rgba(34,197,94,0.30), transparent 55%), radial-gradient(at 85% 30%, rgba(6,182,212,0.25), transparent 50%), var(--surface-2)",
  grid:
    "linear-gradient(90deg, var(--border-strong) 1px, transparent 1px) 0 0/14px 14px, linear-gradient(var(--border-strong) 1px, transparent 1px) 0 0/14px 14px, var(--surface-2)",
};

/**
 * Mode, accent, and background all live in one preference object and apply
 * immediately on click — a settings page for how the app looks should show
 * the result instantly rather than waiting on a Save button.
 */
export function AppearanceSection() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState(readThemePrefs);
  const { setColorScheme } = useMantineColorScheme();

  const update = (patch: Partial<typeof prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveThemePrefs(next);
    applyTheme(next);
    if (patch.mode) {
      setColorScheme(patch.mode === "system" ? "auto" : patch.mode);
    }
  };

  return (
    <Section
      title={t("settings.appearance", "Appearance")}
      description={t("settings.appearanceDesc", "Choose how Quantalog looks on this device.")}
    >
      <Box px="lg" py="md">
        <Text size="xs" fw={600} c="dimmed" mb={8} style={{ letterSpacing: "0.02em" }}>
          {t("settings.mode", "MODE")}
        </Text>
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

        <Text size="xs" fw={600} c="dimmed" mb={8} style={{ letterSpacing: "0.02em" }}>
          {t("settings.accentColor", "ACCENT COLOR")}
        </Text>
        <SimpleGrid cols={{ base: 4, xs: 8 }} spacing={8} mb="lg">
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

        <Text size="xs" fw={600} c="dimmed" mb={8} style={{ letterSpacing: "0.02em" }}>
          {t("settings.background", "BACKGROUND")}
        </Text>
        <SimpleGrid cols={{ base: 2, xs: 4 }} spacing={8}>
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
                <div style={{ height: 44, background: BG_PREVIEW[bg.id] }} />
                <Text size="xs" fw={550} px={8} py={6}>
                  {bg.label}
                </Text>
              </UnstyledButton>
            );
          })}
        </SimpleGrid>
      </Box>
    </Section>
  );
}
