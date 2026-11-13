import { Tooltip } from "@mantine/core";
import { longDate } from "@/shared/lib/format";
import { STATUS_LABEL } from "../lib/labels";
import { NOT_DETECTED_HELP, SNOOZED_HELP, STATUS_HELP } from "../lib/help";
import type { OpportunityCard } from "../types";
import rows from "./Rows.module.css";

const CLOSED = new Set(["resolved", "dismissed", "archived"]);

function describe(card: OpportunityCard): { text: string; help: string } {
  if (card.snoozedUntil && new Date(card.snoozedUntil).getTime() > Date.now()) {
    return { text: `Snoozed until ${longDate(card.snoozedUntil)}`, help: SNOOZED_HELP };
  }
  if (card.status === "dismissed" && card.dismissReason) {
    return { text: `Dismissed: ${card.dismissReason}`, help: STATUS_HELP.dismissed };
  }
  if (!card.detected && !CLOSED.has(card.status)) {
    return { text: `${STATUS_LABEL[card.status]}, no longer seen`, help: NOT_DETECTED_HELP };
  }
  return { text: STATUS_LABEL[card.status], help: STATUS_HELP[card.status] };
}

export function StatusText({ card }: { card: OpportunityCard }) {
  const { text, help } = describe(card);
  return (
    <Tooltip label={help} multiline w={260} withArrow>
      <span className={rows.status} data-status={card.status}>
        {text}
      </span>
    </Tooltip>
  );
}
