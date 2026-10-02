import { useEffect, useRef } from "react";
import { ScrollArea, Stack, UnstyledButton } from "@mantine/core";
import { CornerDownRight } from "lucide-react";
import { OrbitChatComposer } from "@/features/searchConsole/components/OrbitChatComposer";
import { OrbitThinkingRow } from "@/features/searchConsole/components/OrbitChatTurn";
import { StudioTurn } from "@/features/dashboards/components/studio/StudioTurn";
import { StudioSuggestions } from "@/features/dashboards/components/studio/StudioSuggestions";
import { ORBIT_STARTERS } from "@/features/dashboards/orbitStarters";
import type { DashboardStudio } from "@/features/dashboards/hooks/useDashboardStudio";
import classes from "@/features/dashboards/components/studio/Studio.module.css";

export function StudioChat({ studio }: { studio: DashboardStudio }) {
  const { orbit, selected } = studio;
  const edit = orbit.mode === "edit";
  const bottom = useRef<HTMLDivElement>(null);
  const last = orbit.messages[orbit.messages.length - 1];
  const typing = orbit.liveId !== null && last?.id === orbit.liveId;
  const next = last?.role === "assistant" && last.draft ? last.suggestions ?? [] : [];

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [orbit.messages.length, orbit.thinking, orbit.liveId]);

  useEffect(() => {
    if (!typing) return;
    const id = setInterval(() => bottom.current?.scrollIntoView({ behavior: "auto", block: "end" }), 120);
    return () => clearInterval(id);
  }, [typing]);

  return (
    <section className={classes.chatPane} aria-label="Orbit AI">
      <ScrollArea className={classes.chatScroll} type="hover" scrollbarSize={7}>
        {!orbit.started ? (
          <div className={classes.chatIntro}>
            <div>
              <h2 className={classes.chatIntroTitle}>What should change?</h2>
              <p className={classes.chatIntroText}>
                Ask Orbit to add, remove or resize widgets, change the focus or the date range. The preview updates
                first, and nothing is saved until you apply it.
              </p>
            </div>
            <StudioSuggestions variant="list" starters={ORBIT_STARTERS.edit} onPick={(p) => orbit.send(p)} />
          </div>
        ) : (
          <div className={classes.chatColumn}>
            <Stack gap={24}>
              {orbit.messages.map((m, i) => (
                <StudioTurn
                  key={m.id}
                  message={m}
                  live={m.id === orbit.liveId}
                  isLast={i === orbit.messages.length - 1}
                  thinking={orbit.thinking}
                  selected={m.id === selected?.id}
                  onSelect={() => studio.select(m.id)}
                  onRevealed={orbit.clearLive}
                  onRegenerate={orbit.regenerateLast}
                  onEdit={(text) => orbit.editAndResend(m.id, text)}
                />
              ))}

              {orbit.thinking && (
                <OrbitThinkingRow label={orbit.versions.length ? "Updating the layout" : "Designing your dashboard"} />
              )}

              {!orbit.thinking && !typing && next.length > 0 && (
                <div className={classes.next}>
                  <div className={classes.sectionLabel}>Suggested next</div>
                  <div className={classes.nextChips}>
                    {next.map((q) => (
                      <UnstyledButton key={q} className={classes.nextChip} onClick={() => orbit.send(q)}>
                        <CornerDownRight size={13} />
                        {q}
                      </UnstyledButton>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottom} />
            </Stack>
          </div>
        )}
      </ScrollArea>

      <OrbitChatComposer
        value={orbit.input}
        onChange={orbit.setInput}
        onSend={() => orbit.send()}
        onStop={orbit.stop}
        thinking={orbit.thinking}
        started
        placeholder={orbit.versions.length || edit ? "Ask for a change" : "Describe the dashboard you need"}
        disclaimer={edit ? "Nothing is saved until you apply the changes." : "Nothing is saved until you create it."}
      />
    </section>
  );
}
