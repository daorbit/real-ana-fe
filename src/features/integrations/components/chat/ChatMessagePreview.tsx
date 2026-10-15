import { Text } from "@mantine/core";
import { BrandMark } from "../logos/BrandMarks";
import classes from "./Chat.module.css";

interface Props {
  appId: string;
  appName: string;
}

const SAMPLE_TITLE = "New submission: Contact us";

const SAMPLE_ANSWERS = [
  { label: "Name", value: "Priya Sharma" },
  { label: "Email", value: "priya@example.com" },
  { label: "Message", value: "Hi, I'd like a quote for 20 seats." },
];

export function ChatMessagePreview({ appId, appName }: Props) {
  return (
    <div className={classes.preview} data-app={appId}>
      <div className={classes.previewHead}>
        <span className={classes.previewMark} aria-hidden>
          <BrandMark id={appId} size={16} />
        </span>
        <Text size="xs" fw={600}>
          Quantalog Forms
        </Text>
        <Text size="xs" c="dimmed">
          in {appName}
        </Text>
      </div>
      <div className={classes.previewBody}>
        <Text size="sm" fw={650}>
          {SAMPLE_TITLE}
        </Text>
        <dl className={classes.previewFields}>
          {SAMPLE_ANSWERS.map((answer) => (
            <div key={answer.label} className={classes.previewField}>
              <dt>{answer.label}</dt>
              <dd>{answer.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
