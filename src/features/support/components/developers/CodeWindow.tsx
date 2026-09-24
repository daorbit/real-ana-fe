import { useState } from "react";
import { CopyButton } from "@mantine/core";
import { Check, ChevronDown, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { HighlightLang } from "../../lib/highlight";
import type { Snippet, SnippetLang } from "../../developers";
import { HighlightedCode } from "./HighlightedCode";
import classes from "./CodeWindow.module.css";

const LANG: Record<SnippetLang, HighlightLang> = {
  curl: "bash",
  node: "js",
  python: "python",
};

interface Props {
  snippets: Snippet[];
  method: string;
  path: string;
  response?: string;
}

export function CodeWindow({ snippets, method, path, response }: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState<SnippetLang>(snippets[0].id);
  const [showResponse, setShowResponse] = useState(true);
  const snippet = snippets.find((s) => s.id === active) ?? snippets[0];

  return (
    <div className={classes.window}>
      <div className={classes.bar}>
        <div className={classes.tabs} role="tablist">
          {snippets.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === active}
              data-active={s.id === active || undefined}
              className={classes.tab}
              onClick={() => setActive(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <CopyButton value={snippet.code} timeout={1600}>
          {({ copied, copy }) => (
            <button type="button" className={classes.copy} data-copied={copied || undefined} onClick={copy}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? t("developers.copied") : t("developers.copyCode")}
            </button>
          )}
        </CopyButton>
      </div>

      <div className={classes.request}>
        <span className={classes.method}>{method}</span>
        <span>{path}</span>
        <span className={classes.filename}>{snippet.filename}</span>
      </div>

      <HighlightedCode code={snippet.code} lang={LANG[snippet.id]} />

      {response && (
        <div className={classes.response}>
          <button type="button" className={classes.responseHead} onClick={() => setShowResponse((v) => !v)}>
            <span>{t("developers.response")}</span>
            <span className={classes.status}>200 OK</span>
            <ChevronDown size={14} className={classes.chevron} data-open={showResponse || undefined} />
          </button>
          {showResponse && <HighlightedCode code={response} lang="json" />}
        </div>
      )}
    </div>
  );
}
