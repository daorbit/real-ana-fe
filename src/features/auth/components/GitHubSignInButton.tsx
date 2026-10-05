import { Button } from "@mantine/core";
import { GitHubMark } from "@/shared/ui/GitHubMark";
import { useOAuthLoginReturn } from "@/features/auth/useOAuthLoginReturn";
import { OAUTH_START_URL } from "@/features/auth/oauthStart";

export function GitHubSignInButton({
  label = "Continue with GitHub",
  onError,
  onRequires2fa,
}: {
  label?: string;
  onError?: (message: string) => void;
  onRequires2fa?: (pendingToken: string) => void;
}) {
  const [busy, setBusy] = useOAuthLoginReturn({
    param: "githubLogin",
    method: "github",
    provider: "GitHub",
    onError,
    onRequires2fa,
  });

  return (
    <Button
      variant="default"
      size="md"
      fullWidth
      loading={busy}
      aria-label="Continue with GitHub"
      leftSection={<GitHubMark />}
      onClick={() => {
        setBusy(true);
        window.location.href = OAUTH_START_URL.github;
      }}
    >
      {label}
    </Button>
  );
}

export default GitHubSignInButton;
