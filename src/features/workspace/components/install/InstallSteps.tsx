import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mantine/core";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getFramework } from "@/features/workspace/frameworks";
import { SnippetBuilder } from "@/features/workspace/components/SnippetBuilder";
import { InstallCheck } from "@/features/workspace/components/InstallCheck";
import type { Site } from "@/shared/types";
import classes from "./Install.module.css";

function Step({
  n,
  done,
  title,
  body,
  children,
}: {
  n: number;
  done: boolean;
  title: string;
  body: ReactNode;
  children?: ReactNode;
}) {
  return (
    <li className={classes.step} data-done={done || undefined}>
      <span className={classes.stepMark} aria-hidden>
        {done ? <Check size={14} strokeWidth={3} /> : n}
      </span>
      <div className={classes.stepContent}>
        <h2 className={classes.stepTitle}>{title}</h2>
        <p className={classes.stepBody}>{body}</p>
        {children && <div className={classes.stepSlot}>{children}</div>}
      </div>
    </li>
  );
}

export function InstallSteps({
  site,
  workspaceId,
  live,
  onInstalled,
}: {
  site: Site;
  workspaceId: string;
  live: boolean;
  onInstalled: () => void;
}) {
  const { t } = useTranslation();
  const guide = getFramework(site.framework);
  const isApp = site.platform === "app";

  return (
    <div>
      {live && (
        <div className={classes.success} role="status">
          <span className={classes.successIcon}>
            <CheckCircle2 size={18} />
          </span>
          <div className={classes.successText}>
            <p>{t("install.liveTitle", "You're live")}</p>
            <span>
              {t("install.liveBody", {
                defaultValue: "{{site}} is sending visits to Quantalog.",
                site: site.domain || site.name,
              })}
            </span>
          </div>
          <Button component={Link} to="/app/analytics" size="sm" rightSection={<ArrowRight size={14} />}>
            {t("install.openAnalytics", "Open analytics")}
          </Button>
        </div>
      )}

      <ol className={classes.steps}>
        <Step
          n={1}
          done={live}
          title={t("install.copyTitle", "Copy your snippet")}
          body={t("install.copyBody", {
            defaultValue: "Your {{framework}} snippet, ready to paste. Open Options to change what it tracks.",
            framework: guide.label,
          })}
        >
          <SnippetBuilder
            siteId={site.siteId}
            workspaceId={workspaceId}
            options={site.trackerOptions}
            framework={site.framework}
          />
        </Step>

        <Step
          n={2}
          done={live}
          title={t("install.pasteTitle", "Add it to your site")}
          body={
            isApp
              ? t("install.pasteApp", "Add it where your app starts up, then run a build on a device or simulator.")
              : guide.note ?? t("install.pasteWeb", "Paste it inside the <head> of every page, then deploy your site.")
          }
        />

        <Step
          n={3}
          done={live}
          title={t("install.verifyTitle", "Verify it works")}
          body={t("install.verifyBody", "Open your site in another tab, then check. We listen for the first pageview.")}
        >
          <InstallCheck workspaceId={workspaceId} siteId={site.siteId} domain={site.domain} onInstalled={onInstalled} />
        </Step>
      </ol>
    </div>
  );
}
