import { Anchor, Code, Text } from "@mantine/core";

/**
 * The small slice of Markdown Orbit's answers actually use: links, inline code
 * and bold.
 *
 * Not a Markdown library. The model is prompted for short prose with the
 * occasional link to a settings page, so a parser would be several kilobytes to
 * render three token types — and a full renderer would also honour headings and
 * tables, which would look wrong inside a chat turn.
 *
 * Shared by the floating panel and the full-page module so an answer reads the
 * same in both.
 */

const INLINE = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\))|(`[^`\n]+`)|(\*\*[^*\n]+\*\*)/g;

export function RichText({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE)) {
    const at = match.index ?? 0;
    if (at > cursor) out.push(text.slice(cursor, at));

    const [token, link, code, bold] = match;

    if (link) {
      // Split rather than a second regex: the label can contain anything except
      // a bracket, and the href anything except whitespace or a paren.
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
        <Code key={key++} style={{ fontSize: "0.85em", wordBreak: "break-all" }}>
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

  return <>{out}</>;
}
