import { useEffect, useRef } from "react";
import { ActionIcon, Divider, Group, Tooltip } from "@mantine/core";
import {
  AtSign, Bold, Hash, Italic, List, ListOrdered, RotateCcw, Smile,
} from "lucide-react";

/**
 * The caption surface shared by the share panel and the post scheduler.
 *
 * A `contentEditable` div rather than a textarea, because links and hashtags are
 * styled inside the field as they are typed — something a textarea cannot do.
 *
 * The value stays plain text throughout: `innerText` in, highlighted spans out.
 * Nothing but text is read back, so a paste carrying markup contributes only its
 * words, and what is published is exactly what is displayed. That matters
 * because LinkedIn's commentary field accepts no markup at all — "bold" here is
 * a unicode substitution, not a `<b>`.
 */

const HASHTAG = /#[\p{L}\p{N}_]+/gu;
const URL_IN_TEXT = /https?:\/\/\S+/g;

export function countHashtags(text: string): number {
  return (text.match(HASHTAG) ?? []).length;
}

/**
 * Unicode maths alphanumerics, which is how "bold" survives a network that
 * strips markup. Only ASCII letters and digits have a counterpart; everything
 * else is passed through unchanged rather than mangled.
 */
function toMathAlphabet(text: string, kind: "bold" | "italic"): string {
  const bases = {
    bold: { upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce },
    italic: { upper: 0x1d434, lower: 0x1d44e, digit: null as number | null },
  }[kind];

  return Array.from(text)
    .map((ch) => {
      const code = ch.codePointAt(0)!;
      if (code >= 65 && code <= 90) return String.fromCodePoint(bases.upper + code - 65);
      if (code >= 97 && code <= 122) return String.fromCodePoint(bases.lower + code - 97);
      // Italic has no digit range in the maths block; leaving them plain is the
      // only faithful option.
      if (bases.digit && code >= 48 && code <= 57) {
        return String.fromCodePoint(bases.digit + code - 48);
      }
      return ch;
    })
    .join("");
}

export type CaptionEditorHandle = {
  /** Insert at the caret, or append when the field has never been focused. */
  insert: (fragment: string, opts?: { line?: boolean }) => void;
  /** Rewrite the selected run through a unicode alphabet. */
  transform: (kind: "bold" | "italic") => void;
  focus: () => void;
};

export function CaptionEditor({
  value,
  onChange,
  ariaLabel,
  handleRef,
  placeholder = "Write your post…",
  className = "caption-editor",
}: {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
  /** Filled with the imperative actions the toolbar drives. */
  handleRef?: { current: CaptionEditorHandle | null };
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // The editor owns the DOM while it has focus. Writing highlighted HTML back
  // into it on every keystroke would collapse the caret to the start on each
  // character, so re-rendering is limited to changes that came from elsewhere —
  // a reset, or the composer reopening on another post.
  const lastRendered = useRef<string>("");

  /** Escape, then wrap URLs and hashtags. Order matters — escape first. */
  function highlight(text: string): string {
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped
      .replace(URL_IN_TEXT, (m) => `<span class="caption-link">${m}</span>`)
      .replace(HASHTAG, (m) => `<span class="caption-tag">${m}</span>`);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el || value === lastRendered.current) return;
    if (document.activeElement === el) return;
    el.innerHTML = highlight(value);
    lastRendered.current = value;
  }, [value]);

  const read = () => {
    const el = ref.current;
    if (!el) return;
    // `innerText` rather than `textContent`: it honours the line breaks the
    // browser inserted as <div>/<br>, which is what the user sees and what the
    // post should carry.
    const text = el.innerText.replace(/ /g, " ");
    lastRendered.current = text;
    onChange(text);
  };

  // Built once per render and shared: the toolbar drives it through the ref, and
  // the keyboard shortcuts below call it directly.
  const handle: CaptionEditorHandle = {
    focus: () => ref.current?.focus(),
    insert: (fragment, opts) => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      // `insertText` goes in at the caret and keeps the browser's own undo
      // stack intact, which appending to the value would throw away.
      document.execCommand("insertText", false, opts?.line ? `\n${fragment}` : fragment);
      read();
    },
    transform: (kind) => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      const selected = window.getSelection()?.toString() ?? "";
      if (!selected) return;
      document.execCommand("insertText", false, toMathAlphabet(selected, kind));
      read();
    },
  };

  if (handleRef) handleRef.current = handle;

  return (
    <div
      ref={ref}
      role="textbox"
      aria-multiline="true"
      aria-label={ariaLabel}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      // Drives the CSS placeholder. Derived from the value rather than `:empty`,
      // which a leftover <br> defeats.
      data-empty={value.length === 0 || undefined}
      onInput={read}
      // The shortcuts people press without thinking. Without these the browser
      // runs its own bold on a contentEditable, inserting a <b> that `innerText`
      // then silently drops — the text would look formatted until it was read
      // back, which is worse than no shortcut at all.
      onKeyDown={(e) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        const key = e.key.toLowerCase();
        if (key !== "b" && key !== "i") return;
        e.preventDefault();
        handle.transform(key === "b" ? "bold" : "italic");
      }}
      // Re-highlight once the caret leaves, so a URL typed mid-session picks up
      // its styling without fighting the cursor while it is being typed.
      onBlur={() => {
        const el = ref.current;
        if (!el) return;
        el.innerHTML = highlight(el.innerText.replace(/ /g, " "));
      }}
      onPaste={(e) => {
        // Plain text only. A caption pasted from a rich source would otherwise
        // arrive with fonts and colours no network will honour.
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      className={className}
    />
  );
}

/**
 * Formatting actions for the caption.
 *
 * Every one is a plain-text edit — LinkedIn accepts no markup, so "bold" means
 * unicode letters and "bullet list" means the `•` character. Bold and italic act
 * on the selection; the rest insert at the caret.
 */
export function CaptionToolbar({
  editor,
  onUndo,
  canUndo,
  labels,
}: {
  editor: { current: CaptionEditorHandle | null };
  onUndo?: () => void;
  canUndo?: boolean;
  labels?: Partial<Record<"bold" | "italic" | "emoji" | "bullets" | "numbers" | "mention" | "hashtag" | "undo", string>>;
}) {
  const l = {
    bold: "Bold", italic: "Italic", emoji: "Emoji", bullets: "Bullet list",
    numbers: "Numbered list", mention: "Mention", hashtag: "Hashtag", undo: "Undo",
    ...labels,
  };

  /** `null` is a separator. Grouped by what the action does to the text. */
  type Item = { icon: typeof Smile; label: string; hint?: string; run: () => void; disabled?: boolean };
  const items: (Item | null)[] = [
    { icon: Bold, label: l.bold, hint: "Ctrl+B", run: () => editor.current?.transform("bold") },
    { icon: Italic, label: l.italic, hint: "Ctrl+I", run: () => editor.current?.transform("italic") },
    null,
    { icon: List, label: l.bullets, run: () => editor.current?.insert("• ", { line: true }) },
    { icon: ListOrdered, label: l.numbers, run: () => editor.current?.insert("1. ", { line: true }) },
    null,
    { icon: Smile, label: l.emoji, run: () => editor.current?.insert("🚀") },
    { icon: AtSign, label: l.mention, run: () => editor.current?.insert("@") },
    { icon: Hash, label: l.hashtag, run: () => editor.current?.insert("#") },
    ...(onUndo ? [null, { icon: RotateCcw, label: l.undo, run: onUndo, disabled: !canUndo }] : []),
  ];

  return (
    <Group
      gap={2}
      px={8}
      py={6}
      wrap="nowrap"
      style={{
        borderBottom: "1px solid var(--mantine-color-default-border)",
        background: "var(--mantine-color-default)",
      }}
    >
      {items.map((item, i) =>
        item === null ? (
          <Divider key={`sep-${i}`} orientation="vertical" mx={5} my={3} />
        ) : (
          <Tooltip
            key={item.label}
            label={item.hint ? `${item.label} · ${item.hint}` : item.label}
            withArrow
            openDelay={400}
          >
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              // The selection has to survive the click, or "bold" would act on
              // nothing: focusing the button clears it first.
              onMouseDown={(e) => e.preventDefault()}
              onClick={item.run}
              disabled={item.disabled}
              aria-label={item.label}
            >
              <item.icon size={16} />
            </ActionIcon>
          </Tooltip>
        ),
      )}
    </Group>
  );
}
