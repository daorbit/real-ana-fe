import type { ReactNode } from "react";
import { CopyButton, UnstyledButton } from "@mantine/core";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trackingSnippet } from "@/features/workspace/tracker";
import type { Site } from "@/shared/types";
import classes from "./SetupScreen.module.css";

type StepState = "done" | "current" | "upcoming";

function Item({
  n,
  state,
  title,
  detail,
  action,
  children,
}: {
  n: number;
  state: StepState;
  title: string;
  detail: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <li className={classes.item} data-state={state} aria-current={state === "current" ? "step" : undefined}>
      <span className={classes.itemMark}>{state === "done" ? <Check size={14} strokeWidth={2.5} /> : n}</span>
      <div className={classes.itemMain}>
        <div className={classes.itemRow}>
          <span className={classes.itemText}>
            <span className={classes.itemTitle}>{title}</span>
            <span className={classes.itemDetail}>{detail}</span>
          </span>
          {action}
        </div>
        {children}
      </div>
    </li>
  );
}

export function SetupChecklist({ site, currentStep }: { site: Site | null; currentStep: number }) {
  const { t } = useTranslation();
  const stepState = (step: number): StepState =>
    step < currentStep ? "done" : step === currentStep ? "current" : "upcoming";
  const snippet = site ? trackingSnippet(site.siteId, site.trackerOptions) : "";

  return (
    <ol className={classes.checklist}>
      <Item
        n={1}
        state={stepState(1)}
        title={t("setup.itemAdd", "Add your site")}
        detail={site ? site.domain || site.name : t("setup.itemAddDetail", "Your domain, so we can build the snippet")}
      />
      <Item
        n={2}
        state={stepState(2)}
        title={t("setup.itemPaste", "Paste the snippet")}
        detail={t("setup.itemPasteDetail", "One line, before </head> on every page")}
        action={
          site && (
            <CopyButton value={snippet}>
              {({ copied, copy }) => (
                <UnstyledButton className={classes.chip} onClick={copy} data-copied={copied || undefined}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? t("workspaces.copied", "Copied") : t("setup.copy", "Copy")}
                </UnstyledButton>
              )}
            </CopyButton>
          )
        }
      >
        {site && <code className={classes.snippet}>{snippet}</code>}
      </Item>
      <Item
        n={3}
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
