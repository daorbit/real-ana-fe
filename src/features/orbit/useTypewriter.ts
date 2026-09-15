import { useEffect, useRef, useState } from "react";

/**
 * Paint `text` in a word at a time rather than all at once.
 *
 * The answer already arrived whole — this is presentation, not streaming. It
 * earns its place anyway: an answer that appears as a finished block is read
 * from the top after it lands, while one that arrives at reading speed is read
 * as it comes, so the same wait feels like progress instead of a pause.
 *
 * By word, not by character. A per-character reveal at a readable rate takes
 * several seconds on a paragraph, and the eye is already ahead of it — the
 * word boundary is where reading actually happens.
 *
 * `enabled` false renders the whole string immediately: restored history and
 * every turn above the newest are finished answers, and replaying them on
 * mount would animate a conversation someone is scrolling back through.
 */
export function useTypewriter(
  text: string,
  enabled: boolean,
  onDone?: () => void,
): string {
  const [shown, setShown] = useState(enabled ? "" : text);

  // Which string is being animated. A ref as well as the effect's dependency
  // so a re-render for any other reason doesn't restart the reveal.
  const animating = useRef<string | null>(null);

  // Held in a ref so a caller passing an inline arrow — the normal way to
  // call this — doesn't restart the reveal on every render.
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      animating.current = null;
      return;
    }

    if (animating.current === text) return;
    animating.current = text;

    // Word boundaries, keeping the whitespace with the word before it so the
    // slices rejoin into exactly the original string.
    const chunks = text.match(/\S+\s*/g) ?? [];
    if (!chunks.length) {
      setShown(text);
      done.current?.();
      return;
    }

    let i = 0;
    setShown("");

    // Paced by wall clock rather than a fixed step per tick: a long answer
    // would otherwise take proportionally longer, and the last paragraph of a
    // ten-line reply would still be arriving after the reader got there.
    const perWord = Math.max(8, Math.min(28, 2400 / chunks.length));

    const id = setInterval(() => {
      i += 1;
      setShown(chunks.slice(0, i).join(""));
      if (i >= chunks.length) {
        clearInterval(id);
        done.current?.();
      }
    }, perWord);

    return () => clearInterval(id);
  }, [text, enabled]);

  return shown;
}
