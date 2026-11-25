import { Brick, Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";
import skeleton from "../skeletons/BioSkeleton.module.css";
import classes from "./BioStudio.module.css";

const EDITOR_ROWS: BrickRow[] = [{ height: 92 }, { height: 260 }, { height: 150 }];

export function BioStudioSkeleton() {
  return (
    <div className={classes.studio}>
      <Bricks rows={EDITOR_ROWS} label="Loading the editor" />
      <div className={classes.previewCol}>
        <div className={skeleton.stage}>
          <Brick height={590} width={290} />
        </div>
      </div>
    </div>
  );
}
