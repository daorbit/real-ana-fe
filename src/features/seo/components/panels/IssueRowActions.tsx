import { ActionIcon, CopyButton, Group, Tooltip } from "@mantine/core";
import { Check, Copy } from "lucide-react";
import { AskOrbitButton } from "@/features/orbit/components/AskOrbitButton";
import { issueText, type IssueRow } from "./issueText";

export function IssueRowActions({ row }: { row: IssueRow }) {
  return (
    <Group gap={2} wrap="nowrap" justify="flex-end">
      <AskOrbitButton
        iconOnly
        label="Ask Orbit how to fix this"
        question={`My SEO audit flagged: "${row.title}". ${row.detail} How do I fix this?`}
      />
      <CopyButton value={issueText(row)}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? "Copied" : "Copy this issue"} withArrow position="left">
            <ActionIcon
              variant="subtle"
              size="sm"
              color={copied ? "teal" : "gray"}
              onClick={copy}
              aria-label="Copy this issue"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}
