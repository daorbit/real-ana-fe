import { Button, Text } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppearanceSection } from "@/features/auth/components/AppearanceSection";
import { ThemePreview } from "@/features/auth/components/onboarding/ThemePreview";
import s from "./AppearanceStep.module.css";


export function AppearanceStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  return (
    <div className={`onb-form ${s.page}`}>
      <div className={s.actionsRow}>
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
  );
}
