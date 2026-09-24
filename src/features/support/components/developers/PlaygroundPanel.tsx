import { Box, Button, Text } from "@mantine/core";
import { ExternalLink, FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiBaseUrl, playgroundUrl } from "../../developers";
import { CopyField } from "./CopyField";
import { PanelHeader } from "./PanelHeader";
import classes from "./Developers.module.css";

export function PlaygroundPanel({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();

  const steps = [
    t("developers.playStepAuthorize"),
    t("developers.playStepMe"),
    t("developers.playStepWid"),
  ];

  return (
    <Box className={classes.panel}>
      <PanelHeader
        icon={FlaskConical}
        title={t("developers.playgroundTitle")}
        description={t("developers.playgroundDesc")}
        action={
          <Button
            component="a"
            href={playgroundUrl()}
            target="_blank"
            rel="noopener noreferrer"
            rightSection={<ExternalLink size={14} />}
          >
            {t("developers.openPlayground")}
          </Button>
        }
      />

      <Box className={classes.playGrid}>
        <Box className={classes.copyFields}>
          <CopyField label={t("developers.workspaceId")} value={workspaceId} />
          <CopyField label={t("developers.baseUrl")} value={apiBaseUrl()} />
        </Box>
        <ol className={classes.playSteps}>
          {steps.map((step, i) => (
            <li key={i} className={classes.playStep}>
              <span className={classes.stepNum}>{i + 1}</span>
              <Text size="sm">{step}</Text>
            </li>
          ))}
        </ol>
      </Box>
    </Box>
  );
}
