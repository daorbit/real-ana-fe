import { Building2 } from "lucide-react";
import { useWorkspaceLogo } from "@/features/workspace/hooks/useWorkspaceLogo";
import type { WorkspaceIcon } from "@/shared/types";
import classes from "./WorkspaceLogo.module.css";

export function WorkspaceLogo({ icon, className }: { icon?: WorkspaceIcon | null; className?: string }) {
  const { src, onError } = useWorkspaceLogo(icon);

  if (!src) {
    return (
      <span className={[classes.fallback, className].filter(Boolean).join(" ")} aria-hidden>
        <Building2 strokeWidth={1.8} />
      </span>
    );
  }

  return <img src={src} alt="" aria-hidden className={className} referrerPolicy="no-referrer" onError={onError} />;
}
