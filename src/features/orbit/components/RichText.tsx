import { Anchor, Code, List, Text, Title } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";

const FENCE = /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g;

const INLINE =
  /(\[[^\]]+\]\(https?:\/\/[^\s)]+\))|(`[^`\n]+`)|(\*\*[^*\n]+\*\*)/g;

function renderInline(text: string, keyBase: number): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let key = keyBase;

  for (const match of text.matchAll(INLINE)) {
    const at = match.index ?? 0;
    if (at > cursor) out.push(text.slice(cursor, at));

    const [token, link, code, bold] = match;

    if (link) {
      const close = link.indexOf("](");
      const label = link.slice(1, close);
      const href = link.slice(close + 2, -1);
      out.push(
        <Anchor
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          c="emerald.5"
          fw={500}
          underline="always"
        >
          {label}
        </Anchor>,
      );
    } else if (code) {
      out.push(
        <Code
          key={key++}
          style={{ fontSize: "0.85em", wordBreak: "break-all" }}
        >
          {code.slice(1, -1)}
        </Code>,
      );
    } else if (bold) {
      out.push(
        <Text key={key++} span fw={600} c="var(--mantine-color-text)" inherit>
          {bold.slice(2, -2)}
        </Text>,
      );
    }

    cursor = at + token.length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));

  return out;
}

const HEADING = /^(#{1,3})\s+(.+)$/;

const HEADING_ORDER = [3, 4, 5] as const;
const BULLET = /^[-*]\s+(.+)$/;
const NUMBERED = /^\d+[.)]\s+(.+)$/;

function renderBlocks(text: string, keyBase: number): React.ReactNode[] {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let key = keyBase;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const heading = HEADING.exec(line);
    if (heading) {
      out.push(
        <Title
          key={key++}
          order={HEADING_ORDER[Math.min(heading[1].length, 3) - 1]}
          size="1em"
          fw={700}
          mt={i > 0 ? 10 : 0}
          mb={2}
        >
          {renderInline(heading[2], key * 1000)}
        </Title>,
      );
      i++;
      continue;
    }

    const bulletMatch = BULLET.exec(line);
    const numberedMatch = NUMBERED.exec(line);
    if (bulletMatch || numberedMatch) {
      const ordered = Boolean(numberedMatch);
      const items: string[] = [];
      while (i < lines.length) {
        const m = ordered ? NUMBERED.exec(lines[i]) : BULLET.exec(lines[i]);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      out.push(
        <List
          key={key++}
          type={ordered ? "ordered" : "unordered"}
          size="sm"
          spacing={4}
          mt={4}
          mb={4}
        >
          {items.map((item, idx) => (
            <List.Item key={idx}>
              {renderInline(item, key * 1000 + idx)}
            </List.Item>
          ))}
        </List>,
      );
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }
    const start = i;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !HEADING.test(lines[i]) &&
      !BULLET.test(lines[i]) &&
      !NUMBERED.test(lines[i])
    ) {
      i++;
    }
    const paragraph = lines.slice(start, i).join("\n");
    out.push(
      <Text key={key++} span display="block" mb={start > 0 ? 6 : 0}>
        {renderInline(paragraph, key * 1000)}
      </Text>,
    );
  }

  return out;
}

export function RichText({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(FENCE)) {
    const at = match.index ?? 0;
    if (at > cursor) out.push(...renderBlocks(text.slice(cursor, at), key));

    const [whole, lang, code] = match;
    out.push(
      <CodeHighlight
        key={key++}
        code={code.replace(/\n$/, "")}
        language={lang || "tsx"}
        radius="md"
        my={8}
        withCopyButton
        style={{
          fontSize: "0.85em",
          border: "1px solid var(--mantine-color-default-border)",
        }}
        styles={{ pre: { background: "var(--mantine-color-default)" } }}
      />,
    );

    cursor = at + whole.length;
    key += 1000;
  }

  if (cursor < text.length) out.push(...renderBlocks(text.slice(cursor), key));

  return <>{out}</>;
}
