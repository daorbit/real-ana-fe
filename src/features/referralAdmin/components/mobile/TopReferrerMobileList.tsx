import { useState } from "react";
import { num } from "@/shared/lib";
import { InsetList, InsetRow } from "@/shared/ui/InsetList";
import type { TopReferrer } from "@/shared/types";
import { TopReferrerSheet } from "./TopReferrerSheet";
import classes from "./ReferralMobile.module.css";

interface Props {
  rows: TopReferrer[];
  toggling: string | null;
  busy: string | null;
  onToggle: (userId: string, active: boolean) => void;
  onEnter: (user: { id: string; email: string }) => void;
}

export function TopReferrerMobileList({ rows, toggling, busy, onToggle, onEnter }: Props) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const keyOf = (r: TopReferrer, i: number) => r.user?.id ?? `row-${i}`;
  const index = rows.findIndex((r, i) => keyOf(r, i) === selectedKey);
  const selected = index >= 0 ? rows[index] : null;

  return (
    <>
      <InsetList>
        {rows.map((r, i) => (
          <InsetRow
            key={keyOf(r, i)}
            onClick={() => setSelectedKey(keyOf(r, i))}
            leading={<span className={classes.rank} data-top={i < 3 || undefined}>{i + 1}</span>}
            title={r.user?.name ?? "Deleted account"}
            subtitle={`${num(r.total)} referrals · ${num(r.rewarded)} rewarded`}
            trailing={
              r.code && <span className={classes.linkDot} data-on={r.code.active || undefined} aria-label={r.code.active ? "Link on" : "Link off"} />
            }
            chevron
          />
        ))}
      </InsetList>

      <TopReferrerSheet
        referrer={selected}
        rank={index + 1}
        toggling={Boolean(selected?.user && toggling === selected.user.id)}
        busy={Boolean(selected?.user && busy === selected.user.id)}
        onClose={() => setSelectedKey(null)}
        onToggle={onToggle}
        onEnter={onEnter}
      />
    </>
  );
}
