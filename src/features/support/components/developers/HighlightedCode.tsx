import { highlightLine, type HighlightLang } from "../../lib/highlight";
import classes from "./CodeWindow.module.css";

export function HighlightedCode({ code, lang }: { code: string; lang: HighlightLang }) {
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <div className={classes.body}>
      <pre className={classes.pre}>
        <code>
          {lines.map((line, i) => (
            <div className={classes.line} key={i}>
              {highlightLine(line, lang).map((t, j) => (
                <span key={j} className={classes[t.kind]}>
                  {t.text}
                </span>
              ))}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
