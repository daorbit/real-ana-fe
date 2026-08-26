import { useEffect, useRef, useState } from "react";
import { Box, Group, SimpleGrid, Text, UnstyledButton, useMantineColorScheme, Switch } from "@mantine/core";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Section } from "@/shared/ui/Page";
import { SwitchVisual } from "@/shared/ui/SwitchOverlay";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";
import { trace } from "@/shared/lib/analytics";
import { useSaveWorkspaceThemeMutation } from "@/app/store";
import {
  ACCENT_PRESETS, BG_STYLES, RADIUS_STYLES, DENSITIES, LOADER_VARIANTS,
  FONT_SIZES, TABLE_STYLES,
  // no SIDEBAR_STYLES: the sidebar-compact control was pulled back out of
  // Appearance, see theme.ts.
  applyTheme, readThemePrefs, saveThemePrefs, withThemeTransition, buildBgValue,
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
 * Mode, accent, background, radius, density, and loading-screen animation
 * all live in one preference object and apply immediately on click — a
 * settings page for how the app looks should show the result instantly
 * rather than waiting on a Save button.
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
          <GroupLabel>{t("settings.accentColor", "Accent color")}</GroupLabel>
          <SimpleGrid cols={{ base: 5, xs: 8, sm: 10, md: 12, lg: 14 }} spacing={14}>
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
                  {active && <Check size={15} color="#fff" strokeWidth={3} />}
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        </GroupBlock>

        <GroupBlock>
          <GroupLabel>{t("settings.background", "Background")}</GroupLabel>
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5, lg: 6 }} spacing={14}>
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
                      background: buildBgValue(bg, "var(--surface-2)", "var(--border-strong)"),
                    }}
                  />
                  <Text size="xs" fw={550} px={10} py={8} truncate>
                    {bg.label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        </GroupBlock>

        <Group gap={40} align="flex-start" mb={32} wrap="wrap">
          <div>
            <GroupLabel>{t("settings.cornerRadius", "Corner radius")}</GroupLabel>
            <Group gap="sm">
              {RADIUS_STYLES.map((r) => {
                const active = prefs.radius === r.id;
                return (
                  <UnstyledButton
                    key={r.id}
                    onClick={() => update({ radius: r.id })}
                    title={r.label}
                    aria-label={r.label}
                    style={{
                      width: 44,
                      height: 44,
                      display: "grid",
                      placeItems: "center",
                      background: "var(--surface-2)",
                      boxShadow: active
                        ? "inset 0 0 0 2px var(--accent)"
                        : "inset 0 0 0 1px var(--border)",
                      borderRadius: 11,
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
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
            <GroupLabel>{t("settings.density", "Density")}</GroupLabel>
            <Group gap="sm">
              {DENSITIES.map((d) => (
                <UnstyledButton
                  key={d.id}
                  className="tile"
                  data-selected={prefs.density === d.id}
                  onClick={() => update({ density: d.id })}
                  px="lg"
                  py={10}
                  style={{ fontSize: 13.5, fontWeight: 550 }}
                >
                  {d.label}
                </UnstyledButton>
              ))}
            </Group>
          </div>

          <div>
            <GroupLabel>{t("settings.fontSize", "Font size")}</GroupLabel>
            <Group gap="sm">
              {FONT_SIZES.map((f) => (
                <UnstyledButton
                  key={f.id}
                  className="tile"
                  data-selected={prefs.fontSize === f.id}
                  onClick={() => update({ fontSize: f.id })}
                  px="lg"
                  py={10}
                  style={{ fontSize: 13.5, fontWeight: 550 }}
                >
                  {f.label}
                </UnstyledButton>
              ))}
            </Group>
          </div>

          <div>
            <GroupLabel>{t("settings.tableStyle", "Table rows")}</GroupLabel>
            <Group gap="sm">
              {TABLE_STYLES.map((tb) => (
                <UnstyledButton
                  key={tb.id}
                  className="tile"
                  data-selected={prefs.table === tb.id}
                  onClick={() => update({ table: tb.id })}
                  px="lg"
                  py={10}
                  style={{ fontSize: 13.5, fontWeight: 550 }}
                >
                  {tb.label}
                </UnstyledButton>
              ))}
            </Group>
          </div>

          <div>
            <GroupLabel>{t("settings.motion", "Motion")}</GroupLabel>
            <Switch
              checked={prefs.motion}
              onChange={(e) => update({ motion: e.currentTarget.checked })}
              label={prefs.motion ? t("settings.motionOn", "Animations on") : t("settings.motionOff", "Animations off")}
              size="md"
            />
          </div>
        </Group>

        <Box>
          <GroupLabel>{t("settings.loadingScreen", "Loading screen")}</GroupLabel>
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 5 }} spacing={14}>
            {LOADER_VARIANTS.map((v) => {
              const active = prefs.loader === v.id;
              return (
                <UnstyledButton
                  key={v.id}
                  className="tile"
                  data-selected={active}
                  onClick={() => update({ loader: v.id })}
                  p={0}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    style={{
                      height: 84,
                      background: "var(--bg-2)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* SwitchVisual sizes its stage with vw/vh-based CSS
                        (min(Npx, Nvw)), meant for a full viewport — scaled
                        down here rather than restyled, so the preview stays
                        pixel-identical to what boot/switch actually shows. */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        transform: "scale(0.3)",
                        transformOrigin: "center",
                        width: "334%",
                        height: "334%",
                        left: "-117%",
                        top: "-117%",
                      }}
                    >
                      <SwitchVisual variant={v.id} loop inline />
                    </div>
                  </div>
                  <Text size="xs" fw={550} px={10} py={8} truncate>
                    {v.label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        </Box>
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
