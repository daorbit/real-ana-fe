import { useMemo } from "react";
import { Code } from "@mantine/core";
import { ArrowUpRight, BookOpen, FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DOCS_URL, KEY_ENV_VAR, SAMPLE_RESPONSE, apiBaseUrl, playgroundUrl, quickStartSnippets,
} from "../../developers";
import { CodeWindow } from "./CodeWindow";
import { CopyField } from "./CopyField";
import { SectionHeader } from "./SectionHeader";
import classes from "./Developers.module.css";

export function QuickStartPanel({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();
  const snippets = useMemo(() => quickStartSnippets(apiBaseUrl()), []);

  const steps = [
    { title: t("developers.stepCreateT"), body: t("developers.stepCreateD") },
    {
      title: t("developers.stepStoreT"),
      body: (
        <>
          {t("developers.stepStoreD")} <Code>{KEY_ENV_VAR}</Code>
        </>
      ),
    },
    { title: t("developers.stepCallT"), body: t("developers.stepCallD") },
  ];

  const resources = [
    {
      icon: BookOpen,
      title: t("developers.fullReference"),
      body: t("developers.docsDesc"),
      href: DOCS_URL,
    },
    {
      icon: FlaskConical,
      title: t("developers.playgroundTitle"),
      body: t("developers.playgroundShort"),
      href: playgroundUrl(),
    },
  ];

  return (
    <div className={classes.quickLayout}>
      <section>
        <SectionHeader title={t("developers.quickStartTitle")} description={t("developers.quickStartDesc")} />
        <div className={classes.quickGrid}>
          <ol className={classes.steps}>
            {steps.map((s, i) => (
              <li key={i} className={classes.step}>
                <span className={classes.stepNum}>{i + 1}</span>
                <div>
                  <div className={classes.stepTitle}>{s.title}</div>
                  <div className={classes.stepBody}>{s.body}</div>
                </div>
              </li>
            ))}
          </ol>
          <CodeWindow snippets={snippets} method="GET" path="/v1/projects" response={SAMPLE_RESPONSE} />
        </div>
      </section>

      <div className={classes.sideGrid}>
        <section>
          <SectionHeader title={t("developers.connectionTitle")} description={t("developers.connectionDesc")} />
          <div className={`${classes.card} ${classes.fieldList}`}>
            <CopyField label={t("developers.workspaceId")} value={workspaceId} />
            <CopyField label={t("developers.baseUrl")} value={apiBaseUrl()} />
          </div>
        </section>

        <section>
          <SectionHeader title={t("developers.resourcesTitle")} />
          <div className={classes.resources}>
            {resources.map(({ icon: Icon, title, body, href }) => (
              <a key={href} className={classes.resource} href={href} target="_blank" rel="noopener noreferrer">
                <Icon size={16} className={classes.resourceIcon} />
                <span className={classes.resourceText}>
                  <span className={classes.resourceTitle}>{title}</span>
                  <span className={classes.resourceBody}>{body}</span>
                </span>
                <ArrowUpRight size={15} className={classes.resourceArrow} />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
