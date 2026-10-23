import { Button, Modal } from "@mantine/core";
import { Check, CircleCheck, PackagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { creditType } from "../lib/credits";
import type { Celebration } from "../hooks/useCheckout";
import { PlanIcon } from "./PlanIcons";
import classes from "./CelebrationModal.module.css";

interface Props {
  celebration: Celebration | null;
  onClose: () => void;
}

function useCelebrationCopy(celebration: Celebration) {
  const { t } = useTranslation();

  if (celebration.kind === "addon") {
    const n = celebration.pack.quantity * celebration.packs;
    return {
      title: t("billing.celebrationAddonTitle"),
      body: t("billing.celebrationAddonBody", { n, type: creditType(t, celebration.pack.type, n) }),
    };
  }

  const extras = celebration.credits.length
    ? t("billing.celebrationPlanExtra", {
        extras: celebration.credits
          .map((c) => `${c.credits} ${creditType(t, c.type, c.credits)}`)
          .join(t("billing.and")),
      })
    : "";

  return {
    title: celebration.planSlug
      ? t("billing.celebrationWelcome", { plan: celebration.planName })
      : t("billing.celebrationPlanTitle"),
    body: `${t("billing.celebrationPlanBody", { plan: celebration.planName })}${extras}`,
  };
}

function CelebrationBody({ celebration, onClose }: { celebration: Celebration; onClose: () => void }) {
  const { t } = useTranslation();
  const { title, body } = useCelebrationCopy(celebration);
  const highlights = celebration.kind === "plan" ? celebration.highlights ?? [] : [];

  return (
    <div className={classes.card}>
      <span className={classes.emblem}>
        {celebration.kind === "plan" && celebration.planSlug ? (
          <PlanIcon slug={celebration.planSlug} size={40} uid="celebration" />
        ) : (
          <PackagePlus size={30} strokeWidth={1.6} />
        )}
      </span>

      <span className={classes.confirmed}>
        <CircleCheck size={14} strokeWidth={2} />
        {t("billing.celebrationConfirmed")}
      </span>

      <h2 className={classes.title}>{title}</h2>
      <p className={classes.body}>{body}</p>

      {highlights.length > 0 && (
        <div className={classes.included}>
          <span className={classes.includedLabel}>{t("billing.celebrationIncluded")}</span>
          <ul className={classes.list}>
            {highlights.map((feature) => (
              <li key={feature} className={classes.item}>
                <Check size={15} strokeWidth={2.2} className={classes.check} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button fullWidth size="md" radius="xl" className={classes.cta} onClick={onClose} data-autofocus>
        {t("billing.letsGo")}
      </Button>
    </div>
  );
}

export function CelebrationModal({ celebration, onClose }: Props) {
  return (
    <Modal
      opened={!!celebration}
      onClose={onClose}
      centered
      radius={24}
      padding={0}
      withCloseButton={false}
      size={420}
      overlayProps={{ backgroundOpacity: 0.55, blur: 6 }}
      transitionProps={{ transition: "pop", duration: 240 }}
    >
      {celebration && <CelebrationBody celebration={celebration} onClose={onClose} />}
    </Modal>
  );
}
