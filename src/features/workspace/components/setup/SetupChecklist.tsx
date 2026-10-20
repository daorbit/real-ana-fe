import type { ReactNode } from "react";
import { CopyButton, UnstyledButton } from "@mantine/core";
import { ArrowUpRight, Check, Code, Copy, Globe, MousePointerClick, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trackingSnippet } from "@/features/workspace/tracker";
import type { Site } from "@/shared/types";
import classes from "./SetupScreen.module.css";

type StepState = "done" | "current" | "upcoming";

function Item({
  icon: Icon,
  state,
  title,
  detail,
  action,
}: {
  icon: LucideIcon;
  state: StepState;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <li className={classes.item} data-state={state} aria-current={state === "current" ? "step" : undefined}>
      <span className={classes.itemMark}>
        {state === "done" ? <Check size={16} strokeWidth={2.25} /> : <Icon size={16} strokeWidth={1.9} />}
      </span>
      <span className={classes.itemMain}>
        <span className={classes.itemText}>
          <span className={classes.itemTitle}>{title}</span>
          <span className={classes.itemDetail}>{detail}</span>
        </span>
        {action}
      </span>
    </li>
  );
}

export function SetupChecklist({ site }: { site: Site | null }) {
  const { t } = useTranslation();
  const stepState = (step: number): StepState => {
    const current = site ? 2 : 1;
    if (step < current) return "done";
    return step === current ? "current" : "upcoming";
  };

  return (
    <ol className={classes.checklist}>
      <Item
        icon={Globe}
        state={stepState(1)}
        title={t("setup.itemAdd", "Add your site")}
        detail={site ? site.domain || site.name : t("setup.itemAddDetail", "Your domain, so we can build the snippet")}
      />
      <Item
        icon={Code}
        state={stepState(2)}
        title={t("setup.itemPaste", "Paste the snippet")}
        detail={t("setup.itemPasteDetail", "One line, before </head> on every page")}
        action={
          site && (
            <CopyButton value={trackingSnippet(site.siteId, site.trackerOptions)}>
              {({ copied, copy }) => (
                <UnstyledButton className={classes.chip} onClick={copy} data-copied={copied || undefined}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? t("workspaces.copied", "Copied") : t("setup.copy", "Copy")}
                </UnstyledButton>
              )}
            </CopyButton>
          )
        }
      />
      <Item
        icon={MousePointerClick}
        state={stepState(3)}
        title={t("setup.itemVisit", "Open your site")}
        detail={t("setup.itemVisitDetail", "Your first visit brings this page to life")}
        action={
          site?.domain && (
            <a className={classes.chip} href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer">
              <ArrowUpRight size={13} />
              {t("setup.open", "Open")}
            </a>
          )
        }
      />
    </ol>
  );
}
