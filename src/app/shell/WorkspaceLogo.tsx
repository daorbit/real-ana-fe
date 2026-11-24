import { useWorkspaceLogo } from "@/features/workspace/hooks/useWorkspaceLogo";
import type { WorkspaceIcon } from "@/shared/types";

export function WorkspaceLogo({ icon, className }: { icon?: WorkspaceIcon | null; className?: string }) {
  const { src, onError } = useWorkspaceLogo(icon);

  return <img src={src} alt="" aria-hidden className={className} referrerPolicy="no-referrer" onError={onError} />;
}
