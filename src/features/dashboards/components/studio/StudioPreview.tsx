import { Loader, ScrollArea, SegmentedControl, TextInput } from "@mantine/core";
import { LayoutGrid } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PreviewSkeleton } from "@/features/dashboards/components/studio/PreviewSkeleton";
import { PreviewWidgets } from "@/features/dashboards/components/studio/PreviewWidgets";
import { useRangeAllowed } from "@/features/dashboards/hooks/useRangeAllowed";
import { rangeLong } from "@/features/dashboards/types";
import type { DashboardStudio } from "@/features/dashboards/hooks/useDashboardStudio";
import classes from "@/features/dashboards/components/studio/Studio.module.css";

export function StudioPreview({ studio, workspaceId }: { studio: DashboardStudio; workspaceId: string }) {
  const { draft, selected, orbit, changes } = studio;
  const allowed = useRangeAllowed();
  const range = draft && allowed(draft.range) ? draft.range : "24h";
  const fresh = new Set(changes.filter((c) => c.kind === "add" && c.widget).map((c) => c.widget as string));
  const versions = orbit.versions.map((v) => ({ value: v.id, label: `v${v.version ?? 1}` }));

  return (
    <section className={classes.previewPane} aria-label="Dashboard preview">
      <div className={classes.previewHead}>
        <div className={classes.previewTitles}>
          {draft ? (
            <TextInput
              variant="unstyled"
              className={classes.nameInput}
              value={studio.name}
              onChange={(e) => studio.setName(e.currentTarget.value)}
              disabled={!selected}
              maxLength={80}
              aria-label="Dashboard name"
            />
          ) : (
            <div className={classes.namePlaceholder}>Untitled dashboard</div>
          )}
          <div className={classes.facts}>
            {draft ? (
              <>
                {draft.layout.length} widgets
                <span className={classes.factDot} />
                {rangeLong(range)}
                <span className={classes.factDot} />
                <span className={classes.liveTag}><span className={classes.liveDot} /> Your live data</span>
              </>
            ) : (
              "Preview"
            )}
          </div>
        </div>
        {versions.length > 1 && selected && (
          <SegmentedControl
            size="xs"
            value={selected.id}
            onChange={studio.select}
            data={versions}
            disabled={orbit.thinking}
            aria-label="Version"
          />
        )}
      </div>

      {orbit.thinking && (
        <div className={classes.status} role="status">
          <Loader size={13} color="gray" />
          {draft && selected ? "Orbit is updating the layout…" : "Orbit is designing your dashboard…"}
        </div>
      )}

      <ScrollArea className={classes.previewScroll} type="hover" scrollbarSize={8}>
        <div className={classes.previewBody} data-busy={(orbit.thinking && Boolean(selected)) || undefined}>
          {!draft && orbit.thinking ? (
            <PreviewSkeleton />
          ) : !draft ? (
            <EmptyState
              compact
              icon={LayoutGrid}
              title="Nothing to preview yet"
              description="Describe the dashboard in the chat and Orbit lays it out here with your live data."
            />
          ) : draft.layout.length === 0 ? (
            <EmptyState
              compact
              icon={LayoutGrid}
              title="No widgets yet"
              description="Ask Orbit what this dashboard should show, and the widgets appear here."
            />
          ) : (
            <PreviewWidgets workspaceId={workspaceId} layout={draft.layout} range={range} fresh={fresh} />
          )}
        </div>
      </ScrollArea>
    </section>
  );
}
