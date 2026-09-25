import { Button } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppearanceSection } from "@/features/auth/components/AppearanceSection";
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
      <div className={s.grid}>
        {/* No mock preview: the choices apply to the whole screen as they
            are made, so the page itself is the preview. */}
        <div className={`${s.controls} ${s.narrow}`}>
          <AppearanceSection bare split />
        </div>
      </div>

      <div className={s.actionsRow}>
        <div className={s.actions}>
          <Button
            className={`auth-btn ${s.back}`}
            variant="default"
            leftSection={<ArrowLeft size={15} />}
            onClick={onBack}
          >
            Back
          </Button>
          <Button className={`auth-btn ${s.primary}`} onClick={onDone} rightSection={<ArrowRight size={16} />}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
