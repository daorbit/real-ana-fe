import { Panel } from "./Panel";
import classes from "../Opportunity.module.css";

export function TextListPanel({
  id,
  title,
  help,
  items,
  ordered = false,
}: {
  id: string;
  title: string;
  help: string;
  items: string[];
  ordered?: boolean;
}) {
  if (!items.length) return null;
  return (
    <Panel id={id} title={title} help={help}>
      {ordered ? (
        <ol className={classes.steps}>
          {items.map((item) => (
            <li key={item} className={classes.step}>
              {item}
            </li>
          ))}
        </ol>
      ) : (
        <ul className={classes.limits}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
