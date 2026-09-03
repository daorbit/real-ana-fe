import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, Group, Skeleton, Stack, Text, Tooltip } from "@mantine/core";
import { RefreshCw, Info } from "lucide-react";
import type { SeoCompetitorBrief } from "@/shared/types";
import { useGetCompetitorBriefMutation } from "@/app/store";
import { notifyError } from "@/shared/lib/notify";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import "@/shared/ui/RunningDialog.css";

/**
 * The AI reading of one comparison.
 *
 * The table below it says what is different; this says what that difference
 * means. Those are separate jobs and the page keeps them visibly separate — the
 * measured comparison stands on its own and is never rewritten by a model, and
 * this panel is clearly marked as a reading of those numbers rather than more
 * of them.
 *
 * Dressed as Orbit rather than as a generic AI panel: the mark and the aurora
 * wash are the same ones the chat and the audit cover use, because this is the
 * same assistant reading the same workspace. A separate sparkle icon and a
 * violet of its own would imply a second, unrelated model — which is exactly
 * the thing a user should not have to wonder about.
 *
 * Generated on demand rather than with the page. The call costs money and takes
 * a few seconds, and most visits to a competitor are a glance at the score
 * rather than a sit-down with the strategy.
 */

/** One labelled paragraph of the brief. */
function Section({ title, body }: { title: string; body: string }) {
  return (
    <Box>
      <Text size="xs" fw={650} c="dimmed" mb={4}>
        {title}
      </Text>
      <Text size="sm" lh={1.55}>
        {body}
      </Text>
    </Box>
  );
}

export function CompetitorBriefCard({
  workspaceId,
  siteId,
  competitorId,
  label,
  recommendations,
  briefAvailable,
}: {
  workspaceId: string;
  siteId: string;
  competitorId: string;
  label: string;
  /**
   * The measured recommendations, shown until Orbit has read them.
   *
   * These used to sit in a card of their own directly above this one, which put
   * two lists of what-to-fix on the page saying the same thing in different
   * words — the rule that fires on `internal-links` and Orbit's reading of that
   * same row are one finding, not two. They live here now: the measured list is
   * what the card shows by default, and generating a brief replaces it with the
   * interpretation rather than adding a second opinion beside it.
   */
  recommendations: string[];
  /**
   * Whether Orbit can be asked at all — false where the deployment has no model
   * credentials, or where this competitor has never been fetched. The card
   * still renders its measured list; only the control disappears.
   */
  briefAvailable: boolean;
}) {
  const [generate, { isLoading }] = useGetCompetitorBriefMutation();
  const [brief, setBrief] = useState<SeoCompetitorBrief | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  // A brief describes one specific competitor, so switching to another must
  // clear it rather than leave the previous rival's strategy under a new name.
  useEffect(() => {
    setBrief(null);
    setFailed(null);
  }, [competitorId]);

  const run = async () => {
    setFailed(null);
    try {
      const result = await generate({ workspaceId, siteId, competitorId }).unwrap();
      setBrief(result.brief);
    } catch (e) {
      // Held locally as well as toasted: a toast is gone in four seconds and
      // the empty panel left behind would look like nothing happened.
      const message =
        typeof e === "object" && e && "data" in e
          ? String((e.data as { error?: string })?.error ?? "The briefing could not be generated")
          : "The briefing could not be generated";
      setFailed(message);
      notifyError(e, "Briefing failed");
    }
  };

  return (
    <Card
      withBorder
      radius="md"
      padding="lg"
      className="orbit-brief"
      // The wash is inset well past the card's edges and has to be clipped by
      // it; `position: relative` is what the absolutely-positioned wash layer
      // resolves against.
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* The same drifting gradient behind Orbit's chat panel and the audit
          cover. Sits under everything, so the content keeps its contrast — the
          sibling rule below lifts each child above it. */}
      <div className="aurora-wash" aria-hidden="true" style={{ zIndex: 0 }} />

      {/* The Stack owns the gap between header and body rather than a margin on
          the header: the body is one of four states and each used to need the
          margin re-decided, which is how the list state ended up rendering
          flush against the title. */}
      <Stack gap="md" style={{ position: "relative", zIndex: 1 }}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap={8} wrap="nowrap">
            <OrbitMark size={18} />
            {/* Names what the card holds rather than who wrote it: before a
                brief is generated the content is the measured list, and a
                header reading "Orbit on this comparison" over server-computed
                rules would be claiming an author it does not have. */}
            <Text fw={650} size="sm">
              What would close the gap
            </Text>
            {briefAvailable && (
              <Tooltip
                label="Orbit is given only the measured numbers above. It is not told anything else about this competitor, and cannot see their traffic, rankings or backlinks."
                withArrow
                multiline
                w={290}
              >
                <Info size={13} style={{ opacity: 0.45, cursor: "help" }} />
              </Tooltip>
            )}
          </Group>
          {!briefAvailable ? null : brief ? (
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<RefreshCw size={13} />}
              loading={isLoading}
              onClick={run}
            >
              Regenerate
            </Button>
          ) : (
            // Emerald and an Orbit mark rather than a violet sparkle: this is
            // the same assistant as every other "Ask Orbit" control in the app,
            // and `AskOrbitButton` leads with the mark for the same reason.
            <Button
              size="xs"
              variant="light"
              color="emerald"
              leftSection={<OrbitMark size={14} />}
              loading={isLoading}
              onClick={run}
            >
              Read the gap
            </Button>
          )}
        </Group>

        {/* Four bars matching the four sections, so the panel does not resize
            under the reader when the real text lands. The same pulse Orbit's
            chat uses while a reply is in flight, rather than Mantine's sweep —
            two different waiting animations for the same assistant reads as two
            different systems. */}
        {isLoading && (
          <Stack gap="md" className="orbit-thinking">
            <Skeleton height={12} radius="sm" width="70%" animate={false} />
            <Skeleton height={34} radius="sm" animate={false} />
            <Skeleton height={34} radius="sm" animate={false} />
            <Skeleton height={12} radius="sm" width="55%" animate={false} />
          </Stack>
        )}

        {!isLoading && failed && (
          <Alert color="orange" variant="light" radius="md" p="sm">
            <Text size="xs">{failed}</Text>
          </Alert>
        )}

        {!isLoading && !failed && brief && (
          <Stack gap="lg">
            {/* The headline carries the finding, so it is the one line sized to
                be read from across the page rather than into. */}
            <Text size="md" fw={650} lh={1.4}>
              {brief.headline}
            </Text>
            <Section title={`What ${label} is optimising for`} body={brief.theirStrategy} />
            <Section title="The move worth making first" body={brief.topMove} />
            <Section title="Where you are already ahead" body={brief.yourEdge} />
            <Text size="xs" c="dimmed">
              Orbit's reading of the measured comparison above. Check it against the numbers before
              acting.
            </Text>
          </Stack>
        )}

        {/* The measured list, until Orbit has been asked. Ranked by the server,
            so the numbering is meaningful and a bullet would hide that. */}
        {!isLoading && !failed && !brief && (
          <Stack gap="lg">
            {/* Wider than the 10 it started at: each item is a full sentence
                that wraps to two or three lines, so a gap smaller than the line
                height makes four items read as one paragraph with numbers in
                it. */}
            <Stack gap="sm">
              {recommendations.map((rec, i) => (
                <Group key={i} gap={12} align="flex-start" wrap="nowrap">
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    // Nudged to sit on the first line's baseline rather than its
                    // box top, which the larger line height above pushed it off.
                    style={{ minWidth: 14, marginTop: 3 }}
                  >
                    {i + 1}
                  </Text>
                  <Text size="sm" style={{ minWidth: 0 }} lh={1.55}>
                    {rec}
                  </Text>
                </Group>
              ))}
            </Stack>
            <Text size="xs" c="dimmed">
              {briefAvailable
                ? "Measured from the comparison below. Ask Orbit to read what they add up to."
                : "Measured from the comparison below."}
            </Text>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
