import { Badge, Tooltip } from "@mantine/core";
import { timeAgo } from "@/shared/lib";

/**
 * How old a competitor's snapshot is, said out loud.
 *
 * The comparison holds two measurements taken at different moments, and its
 * accuracy decays with the distance between them. A month-old snapshot rendered
 * in the same quiet grey as a fresh one invites the reader to trust a number
 * describing a page that may have been rewritten since — and finding that out
 * on their own is what destroys confidence in the rest of the module.
 *
 * Three states rather than a precise age, because the reader is deciding one
 * thing: whether to hit refresh before believing the table.
 */

const DAY = 24 * 60 * 60 * 1000;

/** Beyond this the comparison is stale enough to warn about. */
export const STALE_AFTER_DAYS = 7;

export function freshnessOf(checkedAt: string | null): "never" | "fresh" | "recent" | "stale" {
  if (!checkedAt) return "never";
  const age = Date.now() - new Date(checkedAt).getTime();
  if (age < DAY) return "fresh";
  if (age < STALE_AFTER_DAYS * DAY) return "recent";
  return "stale";
}

export function FreshnessBadge({ checkedAt }: { checkedAt: string | null }) {
  const state = freshnessOf(checkedAt);

  if (state === "never") {
    return (
      <Tooltip label="This page has not been fetched yet." withArrow>
        <Badge size="sm" variant="light" color="gray">
          Not checked
        </Badge>
      </Tooltip>
    );
  }

  const when = timeAgo(checkedAt as string);

  if (state === "stale") {
    return (
      <Tooltip
        label={`Fetched ${when}. Their page may have changed since — refresh to compare against what is live now.`}
        withArrow
        multiline
        w={250}
      >
        <Badge size="sm" variant="light" color="orange" style={{ cursor: "help" }}>
          Stale · {when}
        </Badge>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={`Fetched ${when}.`} withArrow>
      <Badge
        size="sm"
        variant="light"
        color={state === "fresh" ? "teal" : "gray"}
        style={{ cursor: "help" }}
      >
        {when}
      </Badge>
    </Tooltip>
  );
}
