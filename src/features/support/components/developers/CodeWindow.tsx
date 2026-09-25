import { useState } from "react";
import { CopyButton, Tooltip } from "@mantine/core";
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

function CopyIcon({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation();
  return (
    <CopyButton value={value} timeout={1600}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? t("developers.copied") : label} withArrow>
          <button
            type="button"
            className={classes.iconBtn}
            data-copied={copied || undefined}
            onClick={copy}
            aria-label={label}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </Tooltip>
      )}
    </CopyButton>
  );
}

export function CodeWindow({ snippets, method, path, response }: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState<SnippetLang>(snippets[0].id);
  const [showResponse, setShowResponse] = useState(true);
  const snippet = snippets.find((s) => s.id === active) ?? snippets[0];

  return (
    <div className={classes.window}>
      <div className={classes.bar}>
        <div className={classes.endpoint}>
          <span className={classes.method}>{method}</span>
          <span className={classes.path}>{path}</span>
        </div>
        <div className={classes.tabs} role="tablist" aria-label={t("developers.snippetLanguage")}>
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
        <CopyIcon value={snippet.code} label={t("developers.copyCode")} />
      </div>

      <HighlightedCode code={snippet.code} lang={LANG[snippet.id]} />

      {response && (
        <div className={classes.response}>
          <div className={classes.responseHead}>
            <button
              type="button"
              className={classes.responseToggle}
              onClick={() => setShowResponse((v) => !v)}
              aria-expanded={showResponse}
            >
              <ChevronDown size={14} className={classes.chevron} data-open={showResponse || undefined} />
              <span>{t("developers.response")}</span>
              <span className={classes.status}>200 OK</span>
            </button>
            {showResponse && <CopyIcon value={response} label={t("developers.copyCode")} />}
          </div>
          {showResponse && <HighlightedCode code={response} lang="json" />}
        </div>
      )}
    </div>
  );
}
