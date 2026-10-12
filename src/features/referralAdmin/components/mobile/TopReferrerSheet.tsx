import { useEffect, useState } from "react";
import { Avatar, Switch } from "@mantine/core";
import { LogIn } from "lucide-react";
import { num } from "@/shared/lib";
import { PanelDrawer } from "@/shared/ui/PanelDrawer";
import { InsetList, InsetRow, RowIcon } from "@/shared/ui/InsetList";
import type { TopReferrer } from "@/shared/types";
import { StatTile, StatTileGrid } from "@/shared/ui/StatTile";
import classes from "./ReferralMobile.module.css";

interface Props {
  referrer: TopReferrer | null;
  rank: number;
  toggling: boolean;
  busy: boolean;
  onClose: () => void;
  onToggle: (userId: string, active: boolean) => void;
  onEnter: (user: { id: string; email: string }) => void;
}

export function TopReferrerSheet({ referrer, rank, toggling, busy, onClose, onToggle, onEnter }: Props) {
  const [shown, setShown] = useState({ referrer, rank });

  useEffect(() => {
    if (referrer) setShown({ referrer, rank });
  }, [referrer, rank]);

  const r = shown.referrer;
  const rate = r && r.total ? Math.round((r.rewarded / r.total) * 100) : 0;

  return (
    <PanelDrawer
      opened={Boolean(referrer)}
      onClose={onClose}
      ariaLabel="Referrer details"
      header={
        r && (
          <div className={classes.profile}>
            <Avatar size={48} radius="xl" name={r.user?.name ?? "?"} color="initials" />
            <div className={classes.profileText}>
              <span className={classes.sheetTitle}>{r.user?.name ?? "Deleted account"}</span>
              <span className={classes.sheetMeta}>
                {r.user?.email ?? "No account"} · #{shown.rank}
              </span>
            </div>
          </div>
        )
      }
    >
      {r && (
        <>
          <StatTileGrid>
            <StatTile label="Referrals" value={num(r.total)} />
            <StatTile label="Rewarded" value={num(r.rewarded)} />
            <StatTile label="Reward rate" value={`${rate}%`} />
          </StatTileGrid>

          <InsetList
            header="Referral link"
            footer={r.code ? "When off, the link stops recording new referrals. Existing ones are kept." : undefined}
          >
            <InsetRow title="Code" trailing={<span className={classes.mono}>{r.code?.code ?? "—"}</span>} />
            {r.user && r.code && (
              <InsetRow
                title="Link active"
                trailing={
                  <Switch
                    checked={r.code.active}
                    disabled={toggling}
                    onChange={(e) => onToggle(r.user!.id, e.currentTarget.checked)}
                    aria-label="Referral link active"
                  />
                }
              />
            )}
          </InsetList>

          {r.user && (
            <InsetList>
              <InsetRow
                leading={<RowIcon tone="blue"><LogIn size={15} /></RowIcon>}
                title="Open dashboard as this user"
                disabled={busy}
                onClick={() => onEnter(r.user!)}
                chevron
              />
            </InsetList>
          )}
        </>
      )}
    </PanelDrawer>
  );
}
