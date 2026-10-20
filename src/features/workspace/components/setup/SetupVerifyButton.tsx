import { useEffect } from "react";
import { Button, Progress } from "@mantine/core";
import { Radar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useInstallCheck } from "@/features/workspace/useInstallStatus";
import classes from "./SetupScreen.module.css";

export function SetupVerifyButton({
  workspaceId,
  siteId,
  onVerified,
}: {
  workspaceId: string;
  siteId: string;
  onVerified: () => void;
}) {
  const { t } = useTranslation();
  const { phase, start, secondsLeft, progress } = useInstallCheck(workspaceId, siteId);

  useEffect(() => {
    if (phase === "installed") onVerified();
  }, [phase, onVerified]);

  const listening = phase === "listening";

  return (
    <div className={classes.verify}>
      <Button size="md" variant="default" leftSection={<Radar size={16} />} onClick={start} disabled={listening}>
        {listening
          ? t("setup.listening", { defaultValue: "Listening… {{s}}s", s: secondsLeft })
          : t("setup.checkNow", "Check now")}
      </Button>
      {listening && <Progress value={progress} size={2} radius="xl" className={classes.verifyTrack} />}
      {phase === "not-found" && (
        <p className={classes.verifyNote}>
          {t("setup.notFound", "No visit yet. Make sure the snippet is deployed, open your site, then try again.")}
        </p>
      )}
    </div>
  );
}
