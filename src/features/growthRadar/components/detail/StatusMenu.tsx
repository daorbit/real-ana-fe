import { useState } from "react";
import { Button, Menu } from "@mantine/core";
import { AlarmClock, Check, ChevronDown, CircleSlash, RotateCcw, Search, CalendarClock, BellOff } from "lucide-react";
import type { OpportunityDetail, OpportunityPatch } from "../../types";
import { DismissModal } from "./DismissModal";
import { SnoozeModal } from "./SnoozeModal";

const CLOSED = new Set(["resolved", "dismissed", "archived"]);

export function StatusMenu({
  opportunity,
  busy,
  onPatch,
}: {
  opportunity: OpportunityDetail;
  busy: boolean;
  onPatch: (patch: OpportunityPatch, success: string) => Promise<boolean>;
}) {
  const [dismissing, setDismissing] = useState(false);
  const [snoozing, setSnoozing] = useState(false);
  const closed = CLOSED.has(opportunity.status);
  const snoozed = Boolean(opportunity.snoozedUntil && new Date(opportunity.snoozedUntil).getTime() > Date.now());

  return (
    <>
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <Button rightSection={<ChevronDown size={15} />} loading={busy}>
            Update status
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {closed ? (
            <Menu.Item leftSection={<RotateCcw size={15} />} onClick={() => void onPatch({ status: "open" }, "Moved back to your list")}>
              Reopen
            </Menu.Item>
          ) : (
            <>
              {opportunity.status !== "planned" && (
                <Menu.Item leftSection={<CalendarClock size={15} />} onClick={() => void onPatch({ status: "planned" }, "Marked as planned")}>
                  Mark as planned
                </Menu.Item>
              )}
              {opportunity.status !== "investigating" && (
                <Menu.Item leftSection={<Search size={15} />} onClick={() => void onPatch({ status: "investigating" }, "Marked as under investigation")}>
                  Start investigating
                </Menu.Item>
              )}
              <Menu.Item leftSection={<Check size={15} />} onClick={() => void onPatch({ status: "resolved" }, "Marked as resolved")}>
                Mark as resolved
              </Menu.Item>
              <Menu.Divider />
              {snoozed ? (
                <Menu.Item leftSection={<BellOff size={15} />} onClick={() => void onPatch({ snoozedUntil: null }, "Snooze ended")}>
                  End snooze
                </Menu.Item>
              ) : (
                <Menu.Item leftSection={<AlarmClock size={15} />} onClick={() => setSnoozing(true)}>
                  Snooze…
                </Menu.Item>
              )}
              <Menu.Item leftSection={<CircleSlash size={15} />} onClick={() => setDismissing(true)}>
                Dismiss…
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>

      <DismissModal
        opened={dismissing}
        busy={busy}
        onClose={() => setDismissing(false)}
        onDismiss={async (dismissReason) => {
          if (await onPatch({ status: "dismissed", dismissReason }, "Dismissed")) setDismissing(false);
        }}
      />
      <SnoozeModal
        opened={snoozing}
        busy={busy}
        onClose={() => setSnoozing(false)}
        onSnooze={async (snoozedUntil) => {
          if (await onPatch({ snoozedUntil }, "Snoozed")) setSnoozing(false);
        }}
      />
    </>
  );
}
