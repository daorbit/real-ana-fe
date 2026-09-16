import { Button, Group, Stack, Text } from "@mantine/core";
import { ArrowRight, Zap } from "lucide-react";
import { BrandIcon } from "@/shared/ui/BrandIcon";
import { CodeBlock } from "@/shared/ui/CodeBlock";
import { InstallCheck } from "@/features/workspace/components/InstallCheck";
import { frameworkLanguage, type FrameworkGuide } from "@/features/workspace/frameworks";
import type { FrameworkId } from "@/features/workspace/frameworks";
import type { Site } from "@/shared/types";

export function ReadyStepBody({
  site,
  framework,
  guide,
  aiCopy,
  workspaceId,
}: {
  site: Site;
  framework: FrameworkId;
  guide: FrameworkGuide;
  aiCopy: { readyHeadline: string; readyDescription: string } | null;
  workspaceId: string | null;
}) {
  return (
    <Stack gap="lg">
      {/* The shell shows the step's title; this is the framework-specific
          placement line that goes with the snippet below it. */}
      <Group gap={8} wrap="nowrap">
        <BrandIcon framework={framework} size={15} />
        <Text c="dimmed" size="sm">
          {aiCopy?.readyDescription ?? guide.placement}
        </Text>
      </Group>

      <CodeBlock
        code={guide.code(site.siteId, {})}
        filename={guide.filename}
        language={frameworkLanguage(guide.id)}
      />

      {guide.note && (
        <Text size="xs" c="dimmed">
          {guide.note}
        </Text>
      )}

      {workspaceId && (
        <InstallCheck workspaceId={workspaceId} siteId={site.siteId} domain={site.domain} />
      )}

      <Group gap={6}>
        <Zap size={14} style={{ color: "var(--violet-2)" }} />
        <Text size="xs" c="dimmed">
          Numbers appear within seconds of your first visitor.
        </Text>
      </Group>
    </Stack>
  );
}

export function ReadyStepFooter({ onContinue }: { onContinue: () => void }) {
  return (
    <Group justify="flex-end">
      <Button
        className="auth-btn"
        size="md"
        onClick={onContinue}
        rightSection={<ArrowRight size={16} />}
      >
        Continue
      </Button>
    </Group>
  );
}
