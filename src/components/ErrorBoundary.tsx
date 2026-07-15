import { Component, type ReactNode } from "react";
import { Center, Stack, Title, Text, Button, Group, Code, ThemeIcon } from "@mantine/core";
import { AlertTriangle, RotateCcw } from "lucide-react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Catches render-time crashes anywhere below it and shows a recoverable screen
 * instead of a blank white page. A reset re-mounts the subtree; a reload is the
 * escape hatch when the app state itself is wedged.
 *
 * Note: this only catches errors thrown during render/lifecycle — not rejected
 * promises from data fetching. Those are handled where the query is read (RTK
 * Query error states + the notify() toasts).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // Surface it for anyone watching the console; a real deployment would ship
    // this to an error tracker here.
    console.error("Uncaught UI error:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Center mih="100vh" p="lg" style={{ background: "var(--bg, #0b0f14)" }}>
        <Stack align="center" gap="md" maw={480}>
          <ThemeIcon size={64} radius="xl" variant="light" color="red">
            <AlertTriangle size={30} />
          </ThemeIcon>
          <Title order={2} ta="center">Something went wrong</Title>
          <Text c="dimmed" size="sm" ta="center">
            The page hit an unexpected error. Your data is safe — try again, and if
            it keeps happening, reach out to support and mention what you were doing.
          </Text>

          {error.message && (
            <Code block w="100%" style={{ maxHeight: 140, overflow: "auto" }}>
              {error.message}
            </Code>
          )}

          <Group gap="sm">
            <Button leftSection={<RotateCcw size={15} />} onClick={this.reset}>
              Try again
            </Button>
            <Button variant="default" onClick={() => window.location.assign("/app")}>
              Go home
            </Button>
          </Group>
        </Stack>
      </Center>
    );
  }
}
