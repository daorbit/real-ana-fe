import { useMemo, useState } from "react";
import { Box, Popover, Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import { Search } from "lucide-react";
import { EMOJI_GROUPS, searchEmoji } from "./catalog";
import { pushRecent, readRecent } from "./recent";

/**
 * The emoji picker behind the toolbar's smiley.
 *
 * Built here rather than pulled in: emoji-mart and its peers ship a megabyte of
 * data and a stylesheet that does not follow our theme, for a control that
 * needs a grid and a search box. What people pick is remembered per browser, so
 * the first row is theirs after a few posts.
 */
export function EmojiPicker({
  children,
  onPick,
}: {
  /** The control that opens it — the toolbar button. */
  children: React.ReactNode;
  onPick: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(readRecent);

  const results = useMemo(() => searchEmoji(query), [query]);

  const pick = (emoji: string) => {
    onPick(emoji);
    setRecent(pushRecent(emoji));
    // Left open on purpose: captions usually take more than one, and reopening
    // the picker for each is the thing that makes people paste from elsewhere.
  };

  return (
    <Popover
      opened={open}
      onChange={setOpen}
      position="bottom-start"
      shadow="md"
      radius="md"
      withinPortal
      trapFocus
      onClose={() => setQuery("")}
    >
      <Popover.Target>
        <Box onClick={() => setOpen((o) => !o)} style={{ display: "inline-flex" }}>
          {children}
        </Box>
      </Popover.Target>

      <Popover.Dropdown p={0} style={{ width: 316 }}>
        <Box p={8} style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
          <TextInput
            size="xs"
            placeholder="Search emoji"
            leftSection={<Search size={13} />}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            autoFocus
          />
        </Box>

        <Box style={{ maxHeight: 260, overflowY: "auto" }}>
          <Stack gap={12} p={10}>
            {query ? (
              results.length
                ? <Section label="Results" emoji={results} onPick={pick} />
                : <Text size="xs" c="dimmed" ta="center" py={16}>Nothing for “{query}”.</Text>
            ) : (
              <>
                {recent.length > 0 && <Section label="Recent" emoji={recent} onPick={pick} />}
                {EMOJI_GROUPS.map((g) => (
                  <Section key={g.id} label={g.label} emoji={g.emoji} onPick={pick} />
                ))}
              </>
            )}
          </Stack>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
}

function Section({
  label,
  emoji,
  onPick,
}: {
  label: string;
  emoji: string[];
  onPick: (emoji: string) => void;
}) {
  return (
    <div>
      <Text size="10px" c="dimmed" fw={600} tt="uppercase" mb={6} style={{ letterSpacing: "0.05em" }}>
        {label}
      </Text>
      <Box style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2 }}>
        {emoji.map((e, i) => (
          <UnstyledButton
            key={`${e}-${i}`}
            onClick={() => onPick(e)}
            aria-label={e}
            style={{
              display: "grid",
              placeItems: "center",
              height: 32,
              fontSize: 19,
              lineHeight: 1,
              borderRadius: 6,
            }}
            className="emoji-cell"
          >
            {e}
          </UnstyledButton>
        ))}
      </Box>
    </div>
  );
}
