import { CopyButton, Tooltip, UnstyledButton } from "@mantine/core";
import { Check, GitCommitHorizontal } from "lucide-react";
import { dateTime } from "@/shared/lib";
import { BUILD } from "@/shared/lib/buildInfo";
import classes from "@/features/auth/components/settings/SettingsPage.module.css";

export function AppVersion() {
  return (
    <footer className={classes.version} aria-label="App version">
      <span className={classes.versionName}>Quantalog {BUILD.version}</span>
      {BUILD.commit ? (
        <CopyButton value={BUILD.fullCommit} timeout={1500}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? "Copied" : "Copy build id"} withArrow>
              <UnstyledButton className={classes.versionCommit} onClick={copy}>
                {copied ? <Check size={12} /> : <GitCommitHorizontal size={12} />}
                {BUILD.commit}
              </UnstyledButton>
            </Tooltip>
          )}
        </CopyButton>
      ) : (
        <span className={classes.versionMeta}>local build</span>
      )}
      <span className={classes.versionMeta}>Updated {dateTime(BUILD.builtAt)}</span>
      {BUILD.env !== "production" && <span className={classes.versionEnv}>{BUILD.env}</span>}
    </footer>
  );
}
