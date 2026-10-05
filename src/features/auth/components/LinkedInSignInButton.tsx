import { Button } from "@mantine/core";
import { LinkedInMark } from "@/shared/ui/LinkedInMark";
import { useOAuthLoginReturn } from "@/features/auth/useOAuthLoginReturn";
import { OAUTH_START_URL } from "@/features/auth/oauthStart";

export function LinkedInSignInButton({
  label = "Continue with LinkedIn",
  onError,
  onRequires2fa,
}: {
  label?: string;
  onError?: (message: string) => void;
  onRequires2fa?: (pendingToken: string) => void;
}) {
  const [busy, setBusy] = useOAuthLoginReturn({
    param: "linkedinLogin",
    method: "linkedin",
    provider: "LinkedIn",
    onError,
    onRequires2fa,
  });

  return (
    <Button
      variant="default"
      size="md"
      fullWidth
      loading={busy}
      aria-label="Continue with LinkedIn"
      leftSection={<LinkedInMark />}
      onClick={() => {
        setBusy(true);
        window.location.href = OAUTH_START_URL.linkedin;
      }}
    >
      {label}
    </Button>
  );
}

export default LinkedInSignInButton;
