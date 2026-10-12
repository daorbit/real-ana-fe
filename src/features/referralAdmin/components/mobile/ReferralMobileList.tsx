import { useState } from "react";
import { Avatar } from "@mantine/core";
import { shortDate } from "@/shared/lib";
import { InsetList, InsetRow } from "@/shared/ui/InsetList";
import type { AdminReferral } from "@/shared/types";
import type { ReferralAction } from "../../hooks/useReferralActions";
import { StatusPill } from "./StatusPill";
import { ReferralSheet } from "./ReferralSheet";

interface Props {
  rows: AdminReferral[];
  busy: string | null;
  onAct: (referral: AdminReferral, action: ReferralAction) => void;
}

export function ReferralMobileList({ rows, busy, onAct }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((r) => r.id === selectedId) ?? null;

  return (
    <>
      <InsetList>
        {rows.map((r) => (
          <InsetRow
            key={r.id}
            onClick={() => setSelectedId(r.id)}
            leading={<Avatar size={38} radius="xl" name={r.referee?.name ?? "?"} color="initials" />}
            title={r.referee?.name ?? "Deleted account"}
            subtitle={`via ${r.referrer?.name ?? "deleted account"} · ${shortDate(r.createdAt)}`}
            trailing={<StatusPill status={r.status} />}
            chevron
          />
        ))}
      </InsetList>

      <ReferralSheet
        referral={selected}
        busy={selected ? busy === selected.id : false}
        onClose={() => setSelectedId(null)}
        onAct={(referral, action) => {
          setSelectedId(null);
          onAct(referral, action);
        }}
      />
    </>
  );
}
