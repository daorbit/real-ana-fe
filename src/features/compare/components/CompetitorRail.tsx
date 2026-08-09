import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import type { SeoCompetitorComparison } from "@/shared/types";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";

/**
 * The list of tracked competitors, and the selector for the detail beside it.
 *
 * Your own site sits at the top as a fixed reference row rather than a
 * selectable one: it is the baseline every competitor is measured against, and
 * making it selectable would imply there is a "your page vs your page" view.
 *
 * Each row carries the standing rather than only the score, because "95" alone
 * does not say whether that is ahead or behind — which is the only thing the
 * rail is being scanned for.
 */
export function CompetitorRail({
  competitors,
  selectedId,
  onSelect,
  myScore,
  myDomain,
  myFramework,
  toughestId,
}: {
  competitors: SeoCompetitorComparison[];
  selectedId: string | null;
  onSelect: (competitorId: string) => void;
  myScore: number;
  myDomain: string;
  /**
   * The site's framework, for the fallback mark.
   *
   * Plenty of sites — this one included — declare their icon with
   * `<link rel="icon">` and serve nothing at /favicon.ico, so the fetch misses
   * and the fallback is what actually renders. A framework logo says more than
   * a generic globe.
   */
  myFramework?: string;
  /** Whoever leads by the most, marked so the rail has an obvious entry point. */
  toughestId: string | null;
}) {
  // Worst standing first: the competitor beating you by the most is the one
  // worth opening, so it should not be buried under the ones you already beat.
  const ordered = [...competitors].sort((a, b) => b.gap.scoreGap - a.gap.scoreGap);

  return (
    <Stack gap={2}>
      <Box
        px="sm"
        py={10}
        style={{
          borderRadius: 8,
          border: "1px solid var(--mantine-color-emerald-filled)",
          background: "var(--mantine-color-default-hover)",
        }}
      >
        <Group gap="sm" wrap="nowrap">
          <SiteFavicon domain={myDomain} framework={myFramework} size={18} />
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Text size="sm" fw={600} truncate>
              {myDomain}
            </Text>
            <Text size="xs" c="emerald">
              Your page
            </Text>
          </Box>
          <Text size="sm" fw={700} style={{ fontVariantNumeric: "tabular-nums" }}>
            {myScore}
          </Text>
        </Group>
      </Box>

      <Text size="xs" c="dimmed" fw={650} mt="md" mb={4} px="sm">
        Competitors
      </Text>

      {ordered.map((c) => {
        const selected = c.competitorId === selectedId;
        const theyLead = c.gap.scoreGap > 0;
        return (
          <UnstyledButton
            key={c.competitorId}
            onClick={() => onSelect(c.competitorId)}
            px="sm"
            py={10}
            style={{
              borderRadius: 8,
              border: "1px solid transparent",
              background: selected ? "var(--mantine-color-default-hover)" : undefined,
              borderColor: selected ? "var(--mantine-color-default-border)" : "transparent",
            }}
          >
            <Group gap="sm" wrap="nowrap">
              <SiteFavicon domain={c.url} size={18} />
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Group gap={5} wrap="nowrap">
                  <Text size="sm" fw={selected ? 600 : 500} truncate>
                    {c.label}
                  </Text>
                  {c.competitorId === toughestId && (
                    <Box
                      w={5}
                      h={5}
                      style={{
                        borderRadius: "50%",
                        background: "var(--mantine-color-orange-5)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Group>
                <Text size="xs" c={theyLead ? "red" : c.gap.scoreGap === 0 ? "dimmed" : "teal"}>
                  {theyLead
                    ? `${c.gap.scoreGap} ahead`
                    : c.gap.scoreGap === 0
                    ? "Level"
                    : `${Math.abs(c.gap.scoreGap)} behind`}
                </Text>
              </Box>
              <Text
                size="sm"
                fw={700}
                c={selected ? undefined : "dimmed"}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {c.snapshot.score}
              </Text>
            </Group>
          </UnstyledButton>
        );
      })}
    </Stack>
  );
}
