import { Group, Stack, Text } from "@mantine/core";
import { Zap } from "lucide-react";
import { StepFooter } from "./StepFooter";
import { BrandIcon } from "@/shared/ui/BrandIcon";
import { CodeBlock } from "@/shared/ui/CodeBlock";
import { InstallCheck } from "@/features/workspace/components/InstallCheck";
import { SendToDeveloperButton } from "@/features/workspace/components/SendToDeveloperButton";
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
  const snippet = guide.code(site.siteId, {});

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
        code={snippet}
        filename={guide.filename}
        language={frameworkLanguage(guide.id)}
      />

      <Group justify="space-between" gap="sm" wrap="wrap">
        <Text size="sm" c="dimmed">
          Someone else looks after your site?
        </Text>
        <SendToDeveloperButton domain={site.domain} guide={guide} snippet={snippet} size="sm" />
      </Group>

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

export function ReadyStepFooter({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  return <StepFooter onBack={onBack} onSubmit={onContinue} />;
}
