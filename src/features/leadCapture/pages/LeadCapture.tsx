import { useEffect, useMemo, useState } from "react";
import { Center, Text, useComputedColorScheme } from "@mantine/core";
import { AppShell } from "@/app/AppShell";
import { useWorkspace } from "@/features/workspace/context";
import { leadFormsUrl } from "../themeParams";
import "./LeadCapture.css";

export default function LeadCapture() {
  const { active } = useWorkspace();
  const [themeVersion, setThemeVersion] = useState(0);
  const colorScheme = useComputedColorScheme("light");
  useEffect(() => {
    document.body.dataset.page = "lead-capture";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  useEffect(() => {
    const refresh = () => setThemeVersion((version) => version + 1);
    window.addEventListener("quantalog-theme-change", refresh);
    return () => window.removeEventListener("quantalog-theme-change", refresh);
  }, []);

  // Rebuilt only when the workspace changes: a new src reloads the frame, and
  // doing that on every render would throw away whatever was being edited.
  const src = useMemo(
    () => {
      if (!active) return null;
      const url = leadFormsUrl(`/${active._id}/forms`, colorScheme);
      return `${url}&themeRevision=${themeVersion}`;
    },
    [active, colorScheme, themeVersion],
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
        key={src}
        src={src}
        title="Lead forms"
        className="lead-capture__frame"
        allow="clipboard-write"
      />
    </AppShell>
  );
}
