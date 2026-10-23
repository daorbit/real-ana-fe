import { useEffect, useState } from "react";
import { useWorkspace } from "@/features/workspace/context";

const QUANTALOG_MARK = "/brand-mark.png";

export function WorkspaceLogo({ className }: { className?: string }) {
  const { active } = useWorkspace();
  const brandLogo = active?.icon?.brandLogoUrl ?? null;
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [brandLogo]);

  const src = brandLogo && !failed ? brandLogo : QUANTALOG_MARK;

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={className}
      referrerPolicy="no-referrer"
      onError={brandLogo && !failed ? () => setFailed(true) : undefined}
    />
  );
}
