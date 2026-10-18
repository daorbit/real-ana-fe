import { ActionIcon, Tooltip } from "@mantine/core";
import { Share } from "lucide-react";
import { canNativeShare, nativeShare } from "@/shared/lib/nativeShare";

export function NativeShareButton({
  url,
  title,
  text,
  size = 36,
}: {
  url: string;
  title?: string;
  text?: string;
  size?: number;
}) {
  if (!canNativeShare()) return null;

  return (
    <Tooltip label="Share" withArrow>
      <ActionIcon
        variant="default"
        size={size}
        onClick={() => void nativeShare({ url, title, text })}
        aria-label="Share"
      >
        <Share size={15} />
      </ActionIcon>
    </Tooltip>
  );
}
