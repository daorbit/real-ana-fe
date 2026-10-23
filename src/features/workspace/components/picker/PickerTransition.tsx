import { Check, FolderKanban } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Workspace } from "@/shared/types";
import classes from "./PickerTransition.module.css";

const STEPS = ["sites", "dashboard", "theme"] as const;

export function PickerTransition({ workspace }: { workspace: Workspace }) {
  const { t } = useTranslation();

  return (
    <div className={classes.wrap} role="status" aria-live="polite">
      <div className={classes.emblem}>
        <span className={classes.ring} />
        <span className={classes.core}>
          <FolderKanban size={34} strokeWidth={1.6} />
        </span>
      </div>

      <h2 className={classes.title}>{t("workspaces.picker.settingUp", { name: workspace.name })}</h2>
      <p className={classes.sub}>{t("workspaces.picker.settingUpSub")}</p>

      <ul className={classes.steps}>
        {STEPS.map((step) => (
          <li key={step} className={classes.step}>
            <span className={classes.tick}>
              <Check size={12} strokeWidth={2.6} />
            </span>
            {t(`workspaces.picker.steps.${step}`)}
          </li>
        ))}
      </ul>

      <div className={classes.meter}>
        <span className={classes.fill} />
      </div>
    </div>
  );
}
