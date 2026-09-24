export type TokenKind =
  | "plain"
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "function"
  | "property"
  | "variable"
  | "flag"
  | "punct";

export type Token = { text: string; kind: TokenKind };

export type HighlightLang = "bash" | "js" | "python" | "json";

const KEYWORDS: Record<HighlightLang, Set<string>> = {
  bash: new Set(["curl", "export"]),
  js: new Set([
    "const", "let", "var", "await", "async", "function", "return", "new", "import",
    "from", "export", "if", "else", "true", "false", "null", "undefined",
  ]),
  python: new Set([
    "import", "from", "def", "return", "if", "else", "print", "True", "False", "None", "as",
  ]),
  json: new Set(["true", "false", "null"]),
};

const PATTERN =
  /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\/\/[^\n]*|#[^\n]*)|(\$\{?[A-Za-z_]\w*\}?)|(\s-{1,2}[A-Za-z][\w-]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+)|([^\w\s])/g;

export function highlightLine(line: string, lang: HighlightLang): Token[] {
  const out: Token[] = [];
  const keywords = KEYWORDS[lang];
  let m: RegExpExecArray | null;
  PATTERN.lastIndex = 0;

  while ((m = PATTERN.exec(line))) {
    const [text, str, comment, variable, flag, num, ident, space] = m;
    const rest = line.slice(PATTERN.lastIndex);

    if (str) {
      out.push({ text, kind: lang === "json" && /^\s*:/.test(rest) ? "property" : "string" });
    } else if (comment) {
      const isComment = lang === "js" ? text.startsWith("//") : text.startsWith("#");
      out.push({ text, kind: isComment ? "comment" : "plain" });
    } else if (variable) {
      out.push({ text, kind: lang === "bash" ? "variable" : "plain" });
    } else if (flag) {
      out.push({ text, kind: lang === "bash" ? "flag" : "plain" });
    } else if (num) {
      out.push({ text, kind: "number" });
    } else if (ident) {
      if (keywords.has(text)) out.push({ text, kind: "keyword" });
      else if (/^\s*\(/.test(rest)) out.push({ text, kind: "function" });
      else if (/^\s*:/.test(rest) && lang !== "bash") out.push({ text, kind: "property" });
      else out.push({ text, kind: "plain" });
    } else if (space) {
      out.push({ text, kind: "plain" });
    } else {
      out.push({ text, kind: "punct" });
    }
  }
  return out;
}
