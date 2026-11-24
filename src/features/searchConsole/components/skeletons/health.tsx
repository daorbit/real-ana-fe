import { Tiles } from "@/features/seo/components/shared/Tile";
import seoUi from "@/features/seo/components/shared/seoUi.module.css";
import vitals from "@/features/seo/components/panels/performance/performance.module.css";
import backlinks from "@/features/backlinks/components/Backlinks.module.css";
import { Bone } from "../SkeletonBone";
import classes from "../skeleton.module.css";
import layout from "../searchConsole.module.css";
import sitemaps from "../sitemaps.module.css";
import { ChartCardSkeleton, HeadlineSkeleton, Loading } from "./parts";
import { LABEL_WIDTHS, range } from "./shape";
import { TableCardSkeleton } from "./tables";

function VitalTiles() {
  return (
    <Tiles wide>
      {range(5).map((i) => (
        <div key={i} className={vitals.vital}>
          <div className={vitals.vitalTop}>
            <Bone w={34} h={13} strong />
            <Bone w={66} h={22} shape="pill" />
          </div>
          <Bone w={84} h={26} shape="block" strong />
          <Bone w="72%" h={11} />
          <Bone h={8} strong />
          <Bone w="88%" h={11} />
        </div>
      ))}
    </Tiles>
  );
}

export function VitalsSkeleton() {
  return (
    <Loading label="Loading Web vitals" className={layout.section}>
      <HeadlineSkeleton />
      <VitalTiles />
      <ChartCardSkeleton />
      <TableCardSkeleton columns={["num", "pill", "pill", "pill", "pill"]} />
    </Loading>
  );
}

export function IndexingSkeleton() {
  return (
    <Loading label="Loading indexing" className={layout.section}>
      <HeadlineSkeleton action={<Bone w={140} h={36} shape="block" strong />} />
      <Tiles>
        {range(4).map((i) => (
          <div key={i} className={seoUi.tile}>
            <Bone w={78} h={11} />
            <Bone w={52} h={26} shape="block" strong />
            <Bone w={118} h={11} />
          </div>
        ))}
      </Tiles>
      <TableCardSkeleton rows={3} columns={["pill", "num"]} chevron={false} />
      <TableCardSkeleton large rows={8} columns={["pill", "text", "num", "num", "num"]} />
    </Loading>
  );
}

export function LinksSkeleton() {
  return (
    <Loading label="Loading links" className={layout.section}>
      <div className={classes.spread}>
        <Bone w="44%" h={12} />
        <div className={classes.inline}>
          <Bone w={142} h={36} shape="block" />
          <Bone w={142} h={36} shape="block" strong />
        </div>
      </div>
      <div className={backlinks.summary}>
        {range(5).map((i) => (
          <div key={i} className={`${backlinks.stat} ${classes.stack}`}>
            <Bone w={96} h={10} />
            <Bone w={58} h={26} shape="block" strong />
            <Bone w="78%" h={11} />
          </div>
        ))}
      </div>
      <TableCardSkeleton rows={5} columns={["num", "num"]} chevron={false} />
      <div className={layout.tables}>
        <TableCardSkeleton rows={5} columns={["pill", "num"]} chevron={false} />
        <TableCardSkeleton rows={5} columns={["pill", "num"]} chevron={false} />
      </div>
    </Loading>
  );
}

export function SitemapsSkeleton() {
  return (
    <Loading label="Loading sitemaps" className={sitemaps.root}>
      <div className={sitemaps.submitCard}>
        <div className={`${sitemaps.submitText} ${classes.stack}`}>
          <Bone w={120} h={14} strong />
          <Bone w={260} h={11} />
        </div>
        <div className={sitemaps.urlBar}>
          <div className={classes.grow}>
            <Bone h={36} shape="block" />
          </div>
          <Bone w={84} h={36} shape="block" strong />
        </div>
      </div>
      <div className={sitemaps.listCard}>
        <div className={sitemaps.listHead}>
          <Bone w={120} h={11} />
          <Bone w={110} h={11} />
        </div>
        <div className={sitemaps.list}>
          {range(4).map((i) => (
            <div key={i} className={sitemaps.row}>
              <Bone w={34} h={34} shape="block" strong />
              <div className={`${sitemaps.rowMain} ${classes.stack}`}>
                <Bone w={LABEL_WIDTHS[i]} h={13} strong />
                <Bone w="46%" h={11} />
              </div>
              <Bone w={78} h={22} shape="pill" />
            </div>
          ))}
        </div>
      </div>
    </Loading>
  );
}
