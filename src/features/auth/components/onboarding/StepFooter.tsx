import type { ReactNode } from "react";
import { Button } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import s from "./Onboarding.module.css";

/**
 * The actions at the foot of a setup step: Back on the left, the primary
 * action on the right, with an optional quiet secondary beside it.
 *
 * On a phone the row becomes an app-style action bar — Back moves up into the
 * header's chevron (see `Onboarding.tsx`), and the primary button stretches to
 * a full-width thumb target. The styling lives in `Onboarding.module.css`
 * under `.actions`.
 */
export function StepFooter({
  onBack,
  onSubmit,
  loading,
  label = "Continue",
  secondary,
}: {
  /** Absent when this is the first screen of the flow. */
  onBack?: () => void;
  onSubmit: () => void;
  loading?: boolean;
  label?: string;
  secondary?: ReactNode;
}) {
  return (
    <div className={s.actions}>
      {onBack ? (
        <Button
          className={`auth-btn ${s.actionsBack}`}
          size="sm"
          variant="subtle"
          color="gray"
          leftSection={<ArrowLeft size={14} />}
          onClick={onBack}
        >
          Back
        </Button>
      ) : (
        <span className={s.actionsBack} />
      )}

      <div className={s.actionsMain}>
        {secondary}
        <Button
          className={`auth-btn ${s.actionsPrimary}`}
          size="sm"
          loading={loading}
          onClick={onSubmit}
          rightSection={<ArrowRight size={15} />}
        >
          {label}
        </Button>
      </div>
    </div>
  );
}
