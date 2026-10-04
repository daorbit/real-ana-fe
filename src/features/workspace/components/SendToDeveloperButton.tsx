import { Button, type ButtonProps } from "@mantine/core";
import { Send } from "lucide-react";
import { developerEmailHref } from "@/features/workspace/developerEmail";
import type { FrameworkGuide } from "@/features/workspace/frameworks";

export function SendToDeveloperButton({
  domain,
  guide,
  snippet,
  size = "xs",
  variant = "default",
}: {
  domain: string;
  guide: FrameworkGuide;
  snippet: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}) {
  return (
    <Button
      component="a"
      href={developerEmailHref({ domain, guide, snippet })}
      size={size}
      variant={variant}
      leftSection={<Send size={13} />}
    >
      Email to my developer
    </Button>
  );
}
