import { useState } from "react";
import { Card, Group, Text, Button, CopyButton, ScrollArea } from "@mantine/core";
import { Copy, Check } from "lucide-react";

export type Snippets = Record<string, string>;

// Code block with language tabs + copy button.
export function CodeTabs({ snippets, caption }: { snippets: Snippets; caption?: string }) {
  const langs = Object.keys(snippets);
  const [lang, setLang] = useState(langs[0]);
  const code = snippets[lang] ?? "";

  return (
    <Card withBorder radius="md" padding={0} className="code-tabs">
      <Group justify="space-between" wrap="nowrap" px="sm" py={6} className="code-tabs-head">
        <Group gap={4} wrap="nowrap">
          {langs.map((l) => (
            <button
              key={l}
              type="button"
              className={l === lang ? "ct-tab active" : "ct-tab"}
              onClick={() => setLang(l)}
            >
              {l}
            </button>
          ))}
        </Group>
        <CopyButton value={code}>
          {({ copied, copy }) => (
            <Button
              size="compact-xs"
              variant="subtle"
              color={copied ? "teal" : "gray"}
              onClick={copy}
              leftSection={copied ? <Check size={12} /> : <Copy size={12} />}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </CopyButton>
      </Group>
      <ScrollArea>
        <pre className="ct-code">{code}</pre>
      </ScrollArea>
      {caption && (
        <Text size="xs" c="dimmed" px="sm" py={6} className="code-tabs-foot">{caption}</Text>
      )}
    </Card>
  );
}
