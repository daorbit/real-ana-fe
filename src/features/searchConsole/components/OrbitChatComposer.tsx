import { ActionIcon, Text, Textarea, Tooltip } from "@mantine/core";
import { ArrowUp, Square } from "lucide-react";
import classes from "./orbitChat.module.css";

export function OrbitChatComposer({
  value,
  onChange,
  onSend,
  onStop,
  thinking,
  started,
  placeholder,
  disclaimer = "Orbit answers from your Google Search data and can be wrong.",
  variant = "default",
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  thinking: boolean;
  started: boolean;
  placeholder: string;
  disclaimer?: string;
  variant?: "default" | "hero";
}) {
  const empty = !value.trim();

  return (
    <div className={classes.composerWrap} data-variant={variant}>
      <div className={classes.composer}>
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          variant="unstyled"
          autosize
          minRows={variant === "hero" ? 3 : started ? 1 : 2}
          maxRows={started ? 8 : 6}
          px="md"
          pt={10}
          pb={2}
          disabled={thinking}
          data-autofocus
          classNames={{ input: classes.composerInput }}
          aria-label="Question for Orbit"
        />
        <div className={classes.composerFoot}>
          <Text className={classes.composerHint}>Shift + Enter for a new line</Text>
          <Tooltip label={thinking ? "Stop" : "Send"} withArrow>
            <ActionIcon
              className={classes.send}
              color={thinking ? "red" : "emerald"}
              radius="xl"
              size={32}
              disabled={!thinking && empty}
              onClick={() => (thinking ? onStop() : onSend())}
              aria-label={thinking ? "Stop" : "Send"}
            >
              {thinking ? <Square size={11} fill="currentColor" /> : <ArrowUp size={15} />}
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
      <Text className={classes.disclaimer}>{disclaimer}</Text>
    </div>
  );
}
