import { Button, Text, Title } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppearanceSection } from "@/features/auth/components/AppearanceSection";
import { ThemePreview } from "@/features/auth/components/onboarding/ThemePreview";
import s from "./AppearanceStep.module.css";

/**
 * The last step drops the narrow form column the earlier steps use — the
 * swatch grids need real width — and lays out as controls beside a live
 * preview of the app under the theme being chosen.
 *
 * The viewport itself never scrolls: the header and the preview stay put and
 * only the control list moves, so what a swatch changes is always on screen
 * next to the swatch being clicked.
 */
export function AppearanceStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  return (
    <div className={`auth-split ${s.shell}`}>
      <div className={s.page}>
        <div className={s.head}>
          <div className={s.headText}>
            <Text size="xs" c="dimmed" fw={600} mb={6} style={{ letterSpacing: "0.06em" }}>
              LAST STEP
            </Text>
            <Title order={2} style={{ letterSpacing: "-0.02em" }}>
              Make it yours
            </Title>
            <Text c="dimmed" size="sm" mt={4}>
              Pick a mode, an accent, and a background — you can change any of
              it later from Settings.
            </Text>
          </div>

          <div className={s.actions}>
            <Button
              className="auth-btn"
              variant="default"
              leftSection={<ArrowLeft size={15} />}
              onClick={onBack}
            >
              Back
            </Button>
            <Button className="auth-btn" onClick={onDone} rightSection={<ArrowRight size={16} />}>
              Continue
            </Button>
          </div>
        </div>

        <div className={s.grid}>
          <div className={s.controls}>
            <AppearanceSection bare />
          </div>

          <aside className={s.aside}>
            <ThemePreview />
            <Text size="xs" c="dimmed" className={s.caption}>
              Live preview — how the app will look.
            </Text>
          </aside>
        </div>
      </div>
    </div>
  );
}
