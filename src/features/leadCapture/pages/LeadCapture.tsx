import { useEffect, useMemo } from "react";
import { Center, Text } from "@mantine/core";
import { AppShell } from "@/app/AppShell";
import { useWorkspace } from "@/features/workspace/context";
import { leadFormsUrl } from "../themeParams";
import "./LeadCapture.css";

export default function LeadCapture() {
  const { active } = useWorkspace();
  useEffect(() => {
    document.body.dataset.page = "lead-capture";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  // Rebuilt only when the workspace changes: a new src reloads the frame, and
  // doing that on every render would throw away whatever was being edited.
  const src = useMemo(
    () => (active ? leadFormsUrl(`/${active._id}/forms`) : null),
    [active],
  );

  if (!src) {
    return (
      <AppShell>
        <Center h="60vh">
          <Text c="dimmed">Select a workspace to manage its lead forms.</Text>
        </Center>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <iframe
        src={src}
        title="Lead forms"
        className="lead-capture__frame"
        allow="clipboard-write"
      />
    </AppShell>
  );
}
