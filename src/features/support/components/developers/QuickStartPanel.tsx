import { useMemo } from "react";
import { Anchor, Box, Code, Text } from "@mantine/core";
import { ArrowUpRight, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DOCS_URL, KEY_ENV_VAR, SAMPLE_RESPONSE, apiBaseUrl, quickStartSnippets,
} from "../../developers";
import { CodeWindow } from "./CodeWindow";
import { PanelHeader } from "./PanelHeader";
import classes from "./Developers.module.css";

export function QuickStartPanel() {
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

  return (
    <Box className={classes.panel}>
      <PanelHeader
        icon={Rocket}
        title={t("developers.quickStartTitle")}
        description={t("developers.quickStartDesc")}
        action={
          <Anchor
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            fw={500}
            className={classes.docsLink}
          >
            {t("developers.fullReference")}
            <ArrowUpRight size={14} />
          </Anchor>
        }
      />

      <Box className={classes.quickGrid}>
        <ol className={classes.steps}>
          {steps.map((s, i) => (
            <li key={i} className={classes.step}>
              <span className={classes.stepNum}>{i + 1}</span>
              <Box>
                <Text size="sm" fw={600}>
                  {s.title}
                </Text>
                <Text size="xs" c="dimmed" mt={3} lh={1.55}>
                  {s.body}
                </Text>
              </Box>
            </li>
          ))}
        </ol>
        <CodeWindow snippets={snippets} method="GET" path="/v1/projects" response={SAMPLE_RESPONSE} />
      </Box>
    </Box>
  );
}
