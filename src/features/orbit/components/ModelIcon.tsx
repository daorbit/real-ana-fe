/**
 * Vendor marks for the model picker.
 *
 * Inline SVG rather than remote images: a picker that waits on four CDN
 * requests shows four blank squares on a slow connection, and the whole point
 * of the icons is being recognisable at a glance. These are also the marks'
 * official geometry, so they stay sharp at any size and follow the text colour
 * where the brand allows it.
 *
 * Each is drawn in its brand colour, which is what makes them scannable — four
 * monochrome glyphs in a list would be four grey shapes.
 */

/**
 * Gemini's four-pointed spark, in its own blue-to-violet gradient.
 *
 * Not the Google G: that is the company mark, and using it here would put the
 * same icon beside two different models. The spark is what Gemini is actually
 * branded with, and it is the one people recognise.
 *
 * The gradient id is suffixed per instance — two SVGs on a page with the same
 * `id` means the second silently paints with the first one's gradient.
 */
function Gemini({ size }: { size: number }) {
  const gradientId = `gemini-spark-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4796E3" />
          <stop offset="50%" stopColor="#9177C7" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M12 0c0 6.63 5.37 12 12 12-6.63 0-12 5.37-12 12 0-6.63-5.37-12-12-12 6.63 0 12-5.37 12-12z"
      />
    </svg>
  );
}

/** Google's four-colour G. Gemma is a Google model but has no mark of its own. */
function Google({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 41.2 44 36 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

/** OpenAI's knot. Monochrome by design, so it takes the current text colour. */
function OpenAI({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6 6 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .75 7.09 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.52 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zM13.26 22.43a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zM3.6 18.3a4.47 4.47 0 0 1-.535-3.01l.142.085 4.783 2.762a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.49 4.49 0 0 1 2.35-1.98v5.68a.77.77 0 0 0 .39.68l5.82 3.36-2.02 1.17a.08.08 0 0 1-.07 0l-4.83-2.79A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.86l-5.84-3.4L15.1 7.2a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.39-.66zm2.01-3.02l-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.42 9.24V6.91a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.32 12.86L6.3 11.69a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.37-3.45l-.14.08-4.78 2.76a.79.79 0 0 0-.39.68v6.72zm1.1-2.36L12 9l2.6 1.5v3L12 15l-2.6-1.5v-3z" />
    </svg>
  );
}

/** DeepSeek's whale. */
function DeepSeek({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#4D6BFE" aria-hidden="true">
      <path d="M23.75 4.6c-.24-.12-.35.11-.49.22-.05.04-.09.09-.13.13-.38.41-.83.68-1.42.65-.86-.05-1.6.22-2.25.88-.14-.82-.6-1.3-1.3-1.62-.37-.16-.74-.32-1-.68-.18-.25-.23-.53-.32-.81-.06-.17-.11-.34-.3-.37-.21-.03-.29.14-.37.29-.33.6-.46 1.26-.44 1.93.03 1.5.67 2.7 1.93 3.55.14.1.18.19.13.33-.08.28-.19.55-.28.83-.06.18-.14.22-.33.14a5.1 5.1 0 0 1-1.63-1.25c-.79-.83-1.5-1.75-2.4-2.48a10.7 10.7 0 0 0-.65-.48c-.92-.9.12-1.63.36-1.72.25-.1.09-.41-.72-.4-.81 0-1.55.27-2.5.63-.13.06-.28.1-.43.13a8.5 8.5 0 0 0-2.53-.1c-1.73.2-3.11.1-4.18 1.42C.32 8.42.04 10.4.38 12.5c.36 2.2 1.48 4.03 3.2 5.46 1.79 1.48 3.85 2.2 6.2 2.06 1.43-.08 3.02-.27 4.82-1.79.45.23.93.32 1.72.39.61.06 1.2-.03 1.65-.12.71-.15.66-.8.4-.93-2.05-.95-1.6-.56-2.01-.88 1.04-1.23 2.6-2.5 3.22-6.64.05-.33.01-.53 0-.8-.01-.16.03-.22.21-.24.5-.06.98-.2 1.43-.44 1.29-.7 1.81-1.84 1.93-3.22.02-.21 0-.43-.22-.55zM11.83 18.2c-2.02-1.6-3-2.12-3.4-2.1-.38.02-.31.46-.23.74.09.28.2.47.36.72.11.16.19.4-.1.58-.63.4-1.73-.13-1.78-.15-1.28-.76-2.35-1.76-3.1-3.13a6.94 6.94 0 0 1-.84-2.9c-.02-.4.1-.55.5-.62.53-.1 1.07-.12 1.6-.04 2.23.32 4.13 1.32 5.72 2.9.9.9 1.59 1.98 2.3 3.02.75 1.11 1.56 2.17 2.59 3.04.36.3.65.54.93.71-.83.1-2.22.12-3.55-.77zm.97-6.22c0-.17.13-.3.3-.3.04 0 .08 0 .1.02.05.02.1.05.13.1.05.05.07.12.07.18a.3.3 0 0 1-.3.3.3.3 0 0 1-.3-.3zm3.05 1.57c-.2.08-.4.15-.58.16a1.2 1.2 0 0 1-.78-.25c-.27-.23-.47-.36-.55-.75a1.68 1.68 0 0 1 .02-.6c.07-.32-.01-.53-.24-.72a.29.29 0 0 1-.11-.2c0-.5.03-.9.06-.13.13-.16.72-.4 1.11-.3.36.09.6.32.71.7.06.24.03.5-.03.75-.06.28-.16.55-.14.83.02.19.1.3.28.32.11 0 .22-.4.33-.06.09-.02.18-.04.26.03.1.09.06.2.02.3z" />
    </svg>
  );
}

/** NVIDIA's eye mark, in its green. */
function Nvidia({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#76B900" aria-hidden="true">
      <path d="M8.95 9.4v-1.4c.14-.01.28-.02.42-.02 3.87-.12 6.4 3.33 6.4 3.33s-2.74 3.8-5.68 3.8c-.4 0-.78-.06-1.14-.18v-4.25c1.5.18 1.81.85 2.71 2.36l2.01-1.7s-1.47-1.93-3.95-1.93c-.27 0-.53.02-.77.05zm0-4.62v2.09l.42-.03c5.38-.18 8.89 4.41 8.89 4.41s-4.03 4.9-8.22 4.9c-.38 0-.75-.04-1.09-.1v1.29c.29.04.6.06.91.06 3.9 0 6.72-1.99 9.45-4.35.45.36 2.3 1.24 2.68 1.62-2.6 2.17-8.65 3.93-12.07 3.93-.33 0-.64-.02-.96-.05v1.82H24V4.78H8.95zm0 10.08v1.1c-3.61-.64-4.61-4.39-4.61-4.39s1.73-1.92 4.61-2.23v1.21h-.01c-1.51-.18-2.7 1.24-2.7 1.24s.67 2.39 2.71 3.07zM2.59 11.41s2.14-3.16 6.37-3.48V6.79C4.28 7.17 0 11.13 0 11.13s2.42 7 8.95 7.62v-1.21c-4.79-.6-6.36-6.13-6.36-6.13z" />
    </svg>
  );
}

/** Meta's mark, for the Llama models. */
function Meta({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#0081FB" aria-hidden="true">
      <path d="M6.9 4.5c-2.2 0-3.9 1.7-4.9 4C1.1 10.4.7 12.6.7 14.1c0 2.9 1.4 4.9 3.7 4.9 1.6 0 2.8-.8 4.8-4.3l1.4-2.5c.2-.3.3-.6.5-.9.2.3.3.6.5.9l2.1 3.6c1.9 3.1 3 3.2 4.3 3.2 2.3 0 3.6-2 3.6-5 0-1.6-.4-3.7-1.3-5.6-1-2.2-2.6-3.9-4.8-3.9-1.7 0-3 1.1-4.2 2.9C10 5.6 8.7 4.5 6.9 4.5zm-.1 2.7c1 0 1.8.7 2.8 2.2l-1 1.6c-1.7 2.9-2.3 3.6-3.3 3.6-.9 0-1.5-.8-1.5-2.3 0-1.2.3-2.7.9-4 .6-1.3 1.4-2.1 2.1-2.1zm10.3 0c.9 0 1.7.8 2.3 2.1.6 1.4.9 2.9.9 4.1 0 1.4-.5 2.3-1.5 2.3-.9 0-1.4-.6-3-3.3l-1.3-2.2c1.1-1.9 2-3 2.6-3z" />
    </svg>
  );
}

/** Cohere's mark. */
function Cohere({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#39594D" aria-hidden="true">
      <path d="M7.36 14.42c.6 0 1.8-.03 3.45-.71 1.93-.8 5.72-2.24 8.46-3.7 1.91-1.03 2.75-2.38 2.75-4.2A4.32 4.32 0 0 0 17.7 1.5H6.9A6.9 6.9 0 0 0 0 8.4a6.02 6.02 0 0 0 6.02 6.02h1.34z" />
      <path d="M9.79 19.06a4.5 4.5 0 0 1 2.75-4.13l3.6-1.5c3.64-1.52 7.86 1.15 7.86 5.1A5.47 5.47 0 0 1 18.53 24H14.3a4.5 4.5 0 0 1-4.5-4.5v-.44z" />
      <path d="M4.02 15.9A4.02 4.02 0 0 0 0 19.92v.06A4.02 4.02 0 0 0 4.02 24h.06A4.02 4.02 0 0 0 8.1 19.98v-.06a4.02 4.02 0 0 0-4.02-4.02h-.06z" />
    </svg>
  );
}

/**
 * The icon for a model id.
 *
 * Keyed on the id from `orbit-models.ts` rather than on the vendor, since that
 * is what the client actually holds. An unknown id — a model added server-side
 * that this build has not seen — renders nothing rather than a broken box.
 */
export function ModelIcon({ id, size = 15 }: { id: string; size?: number }) {
  switch (id) {
    case "gemini-flash":
      return <Gemini size={size} />;
    case "gemma":
      return <Google size={size} />;
    case "gpt-oss":
      return <OpenAI size={size} />;
    case "nemotron":
      return <Nvidia size={size} />;
    case "deepseek":
      return <DeepSeek size={size} />;
    case "north-mini":
      return <Cohere size={size} />;
    case "llama-fast":
    case "llama-8b":
      return <Meta size={size} />;
    default:
      return null;
  }
}
