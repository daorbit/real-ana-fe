import { useMemo } from "react";
import { Center, Text } from "@mantine/core";
import { AppShell } from "@/app/AppShell";
import { useWorkspace } from "@/features/workspace/context";
import { leadFormsUrl } from "../themeParams";
import "./LeadMagnet.css";

/**
 * Lead Magnet — the forms service, embedded whole.
 *
 * Building, sharing and reading entries all already exist in that service, so
 * this page frames it rather than reimplementing the same screens against its
 * API. The workspace in the path scopes the forms; the theme travels on the
 * query string, and `embedded=1` tells the service to drop its own outer
 * chrome so what shows through is the page, not a site inside a page.
 */
export default function LeadMagnet() {
  const { active } = useWorkspace();

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
      <div className="lead-magnet">
        <iframe
          src={src}
          title="Lead forms"
          className="lead-magnet__frame"
          allow="clipboard-write"
        />
      </div>
    </AppShell>
  );
}
