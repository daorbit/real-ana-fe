import { useEffect, useRef } from "react";
import { ActionIcon, ScrollArea, Stack, Title, Tooltip, UnstyledButton } from "@mantine/core";
import { ArrowUpRight, BarChart3, CornerDownRight, MessageSquareText, SquarePen, X } from "lucide-react";
import { PanelDrawer } from "@/shared/ui/PanelDrawer";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { pagePath, propertyLabel } from "../searchMetrics";
import type { SearchOrbitChat } from "../useSearchOrbitChat";
import { OrbitChatTurn, OrbitThinkingRow } from "./OrbitChatTurn";
import { OrbitChatComposer } from "./OrbitChatComposer";
import classes from "./orbitChat.module.css";

const SITE_SUGGESTIONS = [
  "What should I fix first to get more clicks?",
  "Which pages are losing traffic, and why?",
  "Which queries are close to page 1?",
  "Which pages get impressions but few clicks?",
];

const PAGE_SUGGESTIONS = [
  "How can I get more clicks to this page?",
  "Which queries could this page rank higher for?",
  "Why did this page's traffic change?",
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Working late?";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function SearchOrbitPanel({
  opened,
  onClose,
  chat,
  days,
  propertyUrl,
  pageUrl,
}: {
  opened: boolean;
  onClose: () => void;
  chat: SearchOrbitChat;
  days: number;
  propertyUrl?: string;
  pageUrl?: string;
}) {
  const bottom = useRef<HTMLDivElement>(null);
  const suggestions = pageUrl ? PAGE_SUGGESTIONS : SITE_SUGGESTIONS;
  const subject = pageUrl ? pagePath(pageUrl) : propertyUrl ? propertyLabel(propertyUrl) : "your site";
  const asked = new Set(chat.messages.filter((m) => m.role === "user").map((m) => m.content));
  const related = suggestions.filter((s) => !asked.has(s)).slice(0, 3);
  const last = chat.messages[chat.messages.length - 1];
  const typing = chat.liveId !== null && last?.id === chat.liveId;

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.messages.length, chat.thinking]);

  useEffect(() => {
    if (!typing) return;
    const id = setInterval(() => bottom.current?.scrollIntoView({ behavior: "auto", block: "end" }), 120);
    return () => clearInterval(id);
  }, [typing]);

  const composer = (
    <OrbitChatComposer
      value={chat.input}
      onChange={chat.setInput}
      onSend={() => chat.send()}
      onStop={chat.stop}
      thinking={chat.thinking}
      started={chat.started}
      placeholder={pageUrl ? "Ask about this page" : "Ask about your search data"}
    />
  );

  return (
    <PanelDrawer opened={opened} onClose={onClose} size={620} ariaLabel="Orbit AI" bare>
      <div className={classes.page}>
        <header className={classes.header}>
          <div className={classes.brand} role="heading" aria-level={2} aria-label="Orbit AI">
            <OrbitMark size={24} />
            <span className={classes.brandName}>Orbit</span>
            <span className={classes.context}>
              {subject} · {days}d
            </span>
          </div>
          <div className={classes.brand}>
            {chat.started && (
              <Tooltip label="New chat" withArrow>
                <ActionIcon variant="subtle" color="gray" size={30} onClick={chat.reset} aria-label="New chat">
                  <SquarePen size={15} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="Close" withArrow>
              <ActionIcon variant="subtle" color="gray" size={30} onClick={onClose} aria-label="Close">
                <X size={16} />
              </ActionIcon>
            </Tooltip>
          </div>
        </header>

        <div className={classes.body} data-state={chat.started ? "started" : "empty"}>
          {!chat.started ? (
            <div className={classes.hero}>
              <div className={classes.heroHead}>
                <div className={classes.heroMark}>
                  <OrbitMark size={44} />
                </div>
                <Title order={2} className={classes.heroTitle}>
                  {greeting()}
                </Title>
                <div className={classes.heroSub}>
                  Ask anything about <b>{subject}</b> in Google Search. Orbit reads your real clicks, queries and
                  rankings for the last {days} days.
                </div>
              </div>

              {composer}

              <div className={classes.starters}>
                <div className={classes.startersLabel}>Try asking</div>
                {!pageUrl && (
                  <UnstyledButton className={classes.starter} onClick={chat.summarize}>
                    <BarChart3 size={14} className={classes.starterIcon} />
                    <span className={classes.starterText}>Summarize my search performance</span>
                    <ArrowUpRight size={14} className={classes.starterArrow} />
                  </UnstyledButton>
                )}
                {suggestions.map((q) => (
                  <UnstyledButton key={q} className={classes.starter} onClick={() => chat.send(q)}>
                    <MessageSquareText size={14} className={classes.starterIcon} />
                    <span className={classes.starterText}>{q}</span>
                    <ArrowUpRight size={14} className={classes.starterArrow} />
                  </UnstyledButton>
                ))}
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className={classes.scroll} type="hover" scrollbarSize={7}>
                <div className={classes.column}>
                  <Stack gap={28}>
                    {chat.messages.map((m, i) => (
                      <OrbitChatTurn
                        key={m.id}
                        message={m}
                        live={m.id === chat.liveId}
                        isLast={i === chat.messages.length - 1}
                        busy={chat.thinking}
                        onRevealed={chat.clearLive}
                        onRegenerate={chat.regenerateLast}
                        onEdit={(text) => chat.editAndResend(m.id, text)}
                      />
                    ))}

                    {chat.thinking && <OrbitThinkingRow />}

                    {!chat.thinking && !typing && last?.role === "assistant" && !last.failed && related.length > 0 && (
                      <div className={classes.followUps}>
                        <div className={classes.followUpsLabel}>Related</div>
                        {related.map((q) => (
                          <UnstyledButton key={q} className={classes.followUp} onClick={() => chat.send(q)}>
                            <CornerDownRight size={13} className={classes.starterIcon} />
                            <span className={classes.starterText}>{q}</span>
                          </UnstyledButton>
                        ))}
                      </div>
                    )}

                    <div ref={bottom} />
                  </Stack>
                </div>
              </ScrollArea>

              {composer}
            </>
          )}
        </div>
      </div>
    </PanelDrawer>
  );
}
