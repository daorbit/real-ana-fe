import type { ReactNode } from "react";
import { ActionIcon, Box, Code, CopyButton, Text, Tooltip } from "@mantine/core";
import { Check, Copy } from "lucide-react";
import classes from "./AddSiteWizard.module.css";

export function CreatedBanner({ title, hint }: { title: string; hint: string }) {
  return (
    <Box className={classes.done} role="status">
      <span className={classes.doneIcon}>
        <Check size={14} strokeWidth={3} />
      </span>
      <Box>
        <Text size="sm" fw={600}>
          {title}
        </Text>
        <Text size="xs" c="dimmed">
          {hint}
        </Text>
      </Box>
    </Box>
  );
}

export function Task({ n, title, hint, children }: { n: number; title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <Box className={classes.task}>
      <span className={classes.taskNum}>{n}</span>
      <Box miw={0}>
        <div className={classes.taskTitle}>{title}</div>
        {hint && <p className={classes.taskHint}>{hint}</p>}
        {children}
      </Box>
    </Box>
  );
}

export function SiteIdRow({ siteId }: { siteId: string }) {
  return (
    <Box className={classes.idRow}>
      Site ID <Code>{siteId}</Code>
      <CopyButton value={siteId} timeout={1600}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? "Copied" : "Copy site ID"} withArrow>
            <ActionIcon variant="subtle" color={copied ? "teal" : "gray"} size="sm" onClick={copy} aria-label="Copy site ID">
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Box>
  );
}
