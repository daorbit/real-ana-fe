import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Button, Code, Group, Stack, Text, Title } from "@mantine/core";
import { RefreshCw, Home } from "lucide-react";

 
type Props = {
  children: ReactNode;
  resetKey?: string;
  variant?: "app" | "route";
};

type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isApp = this.props.variant === "app";

    return (
      <Box
        style={{
          minHeight: isApp ? "100dvh" : "60vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
        }}
      >
        <Stack gap="md" maw={440} align="center" ta="center">
          <Title order={3}>Something broke on this screen</Title>
          <Text size="sm" c="dimmed">
            The rest of the app is fine. Reloading this page usually clears it —
            if it keeps happening, let us know what you were doing.
          </Text>

          <Code block style={{ fontSize: 12, maxWidth: "100%", overflowX: "auto" }}>
            {error.message || String(error)}
          </Code>

          <Group gap="sm" mt="xs">
            <Button
              leftSection={<RefreshCw size={15} />}
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
            {!isApp && (
              <Button
                variant="default"
                leftSection={<Home size={15} />}
                onClick={() => {
                  this.setState({ error: null });
                  window.location.assign("/app");
                }}
              >
                Back to dashboard
              </Button>
            )}
          </Group>
        </Stack>
      </Box>
    );
  }
}
