import { Button } from "@mantine/core";
import { Database, Info } from "lucide-react";
import classes from "./Backlinks.module.css";

export function IndexNotice({
  available,
  canEdit,
  syncing,
  onSync,
}: {
  available: boolean;
  canEdit: boolean;
  syncing: boolean;
  onSync: () => void;
}) {
  if (available) {
    return (
      <div className={classes.notice}>
        <Database size={15} />
        <div className={classes.noticeBody}>
          A backlink index is connected. Import pulls the strongest referring domains for you and for every tracked competitor,
          including links that have never sent a visitor.
        </div>
        {canEdit && (
          <Button size="xs" variant="default" radius="md" loading={syncing} onClick={onSync}>
            Import from index
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={classes.notice}>
      <Info size={15} />
      <div className={classes.noticeBody}>
        Competitor backlinks are found from the pages you check. Every page fetched, whether one of your backlinks or one you
        paste into Link gap, is also searched for links to each competitor you track. To pull a competitor's full profile
        automatically, the server needs a backlink index (DataForSEO) configured.
      </div>
    </div>
  );
}
