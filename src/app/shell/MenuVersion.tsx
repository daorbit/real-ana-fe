import { CopyButton, Tooltip, UnstyledButton } from "@mantine/core";
import { Check, GitCommitHorizontal } from "lucide-react";
import { dateTime } from "@/shared/lib";
import { BUILD } from "@/shared/lib/buildInfo";
import classes from "./MenuVersion.module.css";

export function MenuVersion() {
  return (
    <footer className={classes.root} aria-label="App version">
      <div className={classes.top}>
        <span className={classes.name}>Quantalog {BUILD.version}</span>
        {BUILD.env !== "production" && <span className={classes.env}>{BUILD.env}</span>}
        {BUILD.commit && (
          <CopyButton value={BUILD.fullCommit} timeout={1500}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "Copied" : "Copy build id"} withArrow position="top">
                <UnstyledButton className={classes.commit} onClick={copy}>
                  {copied ? <Check size={11} /> : <GitCommitHorizontal size={11} />}
                  {BUILD.commit}
                </UnstyledButton>
              </Tooltip>
            )}
          </CopyButton>
        )}
      </div>
      <span className={classes.meta}>Updated {dateTime(BUILD.builtAt)}</span>
    </footer>
  );
}
