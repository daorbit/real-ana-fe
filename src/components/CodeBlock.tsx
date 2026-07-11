import { Fragment } from "react";
import { Box, Button, CopyButton, Group, Text } from "@mantine/core";
import { Check, Copy } from "lucide-react";

type Token = { text: string; cls: string };

/**
 * Minimal HTML tokenizer — enough to colour a script tag the way an editor
 * would. Deliberately not a full parser: we only ever render snippets we
 * generate ourselves, so the grammar is known and tiny.
 */
function tokenizeHtml(code: string): Token[] {
  const out: Token[] = [];
  // tag delimiters | attribute names | ="values" | everything else
  const re = /(<\/?|\/?>)|([a-zA-Z-][\w-]*)(?==)|(=)|("[^"]*")|(\s+)|([^\s<>="]+)/g;

  let m: RegExpExecArray | null;
  let expectTagName = false;

  while ((m = re.exec(code))) {
    const [text] = m;

    if (m[1]) {
      // < </ > />
      out.push({ text, cls: "tk-punct" });
      expectTagName = text === "<" || text === "</";
    } else if (m[2]) {
      out.push({ text, cls: "tk-attr" }); // name immediately before an =
    } else if (m[3]) {
      out.push({ text, cls: "tk-punct" }); // =
    } else if (m[4]) {
      out.push({ text, cls: "tk-string" }); // "value"
    } else if (m[5]) {
      out.push({ text, cls: "" }); // whitespace
    } else {
      // a bare word: the tag name if we just saw "<", otherwise a valueless attr
      out.push({ text, cls: expectTagName ? "tk-tag" : "tk-attr" });
      expectTagName = false;
    }
  }
  return out;
}

/**
 * A read-only editor-style code block: dark surface, line numbers, syntax
 * colours, soft wrapping, and a copy button in the title bar.
 */
export function CodeBlock({
  code,
  filename,
  language = "html",
  wrap = true,
}: {
  code: string;
  filename?: string;
  language?: string;
  wrap?: boolean;
}) {
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <Box className="cb">
      <Group justify="space-between" wrap="nowrap" className="cb-bar" px="sm" py={6}>
        <Group gap={8} wrap="nowrap">
          <span className="cb-dot r" />
          <span className="cb-dot y" />
          <span className="cb-dot g" />
          <Text size="xs" c="dimmed" ml={6}>{filename ?? language}</Text>
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

      <div className={wrap ? "cb-body wrap" : "cb-body"}>
        <pre className="cb-pre">
          <code>
            {lines.map((line, i) => (
              <div className="cb-line" key={i}>
                <span className="cb-ln">{i + 1}</span>
                <span className="cb-code">
                  {tokenizeHtml(line).map((t, j) => (
                    <Fragment key={j}>
                      {t.cls ? <span className={t.cls}>{t.text}</span> : t.text}
                    </Fragment>
                  ))}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </Box>
  );
}
