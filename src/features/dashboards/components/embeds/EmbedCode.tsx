import { useState } from "react";
import { SegmentedControl, Stack, Text } from "@mantine/core";
import { CodeBlock } from "@/shared/ui/CodeBlock";
import { iframeSnippet, scriptSnippet } from "@/features/dashboards/embedSnippets";

export function EmbedCode({ token, widget, name }: { token: string; widget: string; name: string }) {
  const [kind, setKind] = useState<"iframe" | "script">("iframe");

  return (
    <Stack gap="sm">
      <SegmentedControl
        size="xs"
        value={kind}
        onChange={(v) => setKind(v as "iframe" | "script")}
        data={[
          { label: "iframe", value: "iframe" },
          { label: "Script tag", value: "script" },
        ]}
      />
      <CodeBlock
        code={kind === "iframe" ? iframeSnippet(token, widget, name) : scriptSnippet(token)}
        language="html"
      />
      <Text size="xs" c="dimmed">
        {kind === "iframe"
          ? "Paste anywhere HTML is allowed. The widget refreshes itself every minute."
          : "The script resizes the widget to fit its content. Add one div per widget; the script only needs to load once."}
      </Text>
    </Stack>
  );
}
