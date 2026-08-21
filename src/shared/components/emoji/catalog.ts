/**
 * The emoji the picker offers, by group.
 *
 * A curated list rather than the full Unicode set: this is a picker for social
 * captions, and the ones people actually reach for fit in a few hundred. No
 * dependency, no 1MB data file, no network fetch — and every glyph here renders
 * on Windows, macOS and Android without a font fallback square.
 */
export type EmojiGroup = { id: string; label: string; emoji: string[] };

export const EMOJI_GROUPS: EmojiGroup[] = [
  {
    id: "popular",
    label: "Frequently used",
    emoji: ["🚀", "🎉", "🔥", "✅", "💡", "📈", "👏", "🙌", "❤️", "😊", "🤝", "⭐", "🎯", "📊", "✨", "👀"],
  },
  {
    id: "smileys",
    label: "Smileys & people",
    emoji: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
      "😘", "😗", "😋", "😛", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥳", "😏", "😢", "😭", "😤", "😠",
      "🤯", "😳", "🥺", "😱", "😴", "🤔", "🤗", "🤭", "🤫", "😬", "🙄", "😮", "😲", "🥱",
    ],
  },
  {
    id: "gestures",
    label: "Gestures",
    emoji: [
      "👍", "👎", "👌", "🤌", "✌️", "🤞", "🤟", "🤘", "👋", "🤙", "💪", "🙏", "👏", "🙌", "🤝", "✍️",
      "👉", "👈", "👆", "👇", "☝️", "✋", "🖐️", "🫶",
    ],
  },
  {
    id: "work",
    label: "Work & growth",
    emoji: [
      "📈", "📉", "📊", "💼", "🗂️", "📅", "🗓️", "⏰", "⏳", "🎯", "🧭", "🛠️", "⚙️", "🔧", "🧪", "🔍",
      "💡", "🧠", "📌", "📎", "📝", "✏️", "📚", "🏆", "🥇", "🎖️", "🚩", "🏁", "💰", "💳", "🤖", "💻",
      "🖥️", "📱", "⌨️", "🖱️", "🌐", "🔗", "📡", "☁️", "🔒", "🔑",
    ],
  },
  {
    id: "objects",
    label: "Objects & symbols",
    emoji: [
      "✅", "❌", "⚠️", "❗", "❓", "💬", "🗣️", "📣", "📢", "🔔", "⭐", "🌟", "✨", "🔥", "💥", "⚡",
      "🎉", "🎊", "🎁", "🍾", "☕", "🍕", "🌍", "🌱", "🌈", "☀️", "🌙", "❤️", "🧡", "💛", "💚", "💙",
      "💜", "🖤", "🤍", "♻️", "➡️", "⬆️", "⬇️", "🔁", "▶️", "⏸️",
    ],
  },
];

/** Every emoji in one list, for the search index. */
export const ALL_EMOJI = EMOJI_GROUPS.flatMap((g) => g.emoji);

/**
 * Search terms per emoji.
 *
 * Only for the ones whose meaning is not obvious from the group they sit in —
 * a full keyword table for several hundred glyphs is a data file, and the
 * groups already do most of the finding.
 */
export const EMOJI_KEYWORDS: Record<string, string> = {
  "🚀": "launch ship rocket growth fast",
  "🎉": "party celebrate launch congrats",
  "🎊": "party celebrate confetti",
  "🔥": "fire hot trending popular",
  "✅": "check done tick yes complete",
  "❌": "cross no wrong fail",
  "⚠️": "warning caution careful",
  "💡": "idea tip insight lightbulb",
  "📈": "chart up growth increase revenue",
  "📉": "chart down decline drop",
  "📊": "chart data analytics report",
  "👏": "clap applause well done",
  "🙌": "celebrate praise hands up",
  "🤝": "handshake deal partner agreement",
  "⭐": "star favourite rating",
  "🌟": "star sparkle shine",
  "✨": "sparkle new shiny magic",
  "🎯": "target goal focus aim",
  "👀": "eyes look watch attention",
  "🧠": "brain think smart learning",
  "🛠️": "tools build fix engineering",
  "⚙️": "settings config gear",
  "🔍": "search find look magnify",
  "🏆": "trophy win award best",
  "💰": "money revenue cash sales",
  "🤖": "robot ai automation bot",
  "💻": "laptop code work dev",
  "🌐": "web internet global site",
  "🔗": "link url connect",
  "🔒": "lock secure privacy safe",
  "📣": "announce shout news megaphone",
  "📢": "announce loud news",
  "🔔": "bell alert notification",
  "🌱": "grow seed start new",
  "☕": "coffee morning break",
  "⏰": "time clock deadline alarm",
  "⏳": "time waiting soon hourglass",
  "📅": "calendar date schedule",
  "🗓️": "calendar date schedule plan",
  "❤️": "love heart like",
  "🙏": "thanks please pray grateful",
  "👍": "thumbs up yes good like",
  "👎": "thumbs down no bad dislike",
  "💪": "strong muscle effort power",
  "😂": "laugh funny lol tears",
  "🤔": "think hmm question wonder",
  "🥳": "party celebrate birthday",
  "😎": "cool sunglasses confident",
};

/** Emoji matching a query, by keyword or by group name. */
export function searchEmoji(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: string[] = [];
  for (const group of EMOJI_GROUPS) {
    const groupMatches = group.label.toLowerCase().includes(q);
    for (const e of group.emoji) {
      if (out.includes(e)) continue;
      if (groupMatches || (EMOJI_KEYWORDS[e] ?? "").includes(q)) out.push(e);
    }
  }
  return out;
}
