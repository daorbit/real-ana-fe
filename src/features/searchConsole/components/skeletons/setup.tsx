import { Bone } from "../SkeletonBone";
import classes from "../skeleton.module.css";
import detail from "../pageDetail.module.css";
import picker from "../picker.module.css";
import { Loading } from "./parts";
import { range } from "./shape";

export function PropertyPickerSkeleton() {
  return (
    <Loading label="Loading properties" className={picker.layout}>
      <div className={picker.intro}>
        <Bone w={140} h={13} />
        <Bone w={260} h={20} shape="pill" />
        <div className={classes.stack}>
          <Bone w="90%" h={26} shape="block" strong />
          <Bone w="60%" h={26} shape="block" strong />
          <Bone w="80%" h={12} />
        </div>
        <Bone h={58} shape="block" />
        <Bone h={110} shape="block" />
      </div>
      <div className={picker.panel}>
        <div className={picker.panelHead}>
          <div className={classes.stack}>
            <Bone w={200} h={14} strong />
            <Bone w={140} h={11} />
          </div>
          <Bone w={80} h={24} shape="block" />
        </div>
        <div className={picker.sections}>
          <div className={picker.grid}>
            {range(4).map((i) => (
              <div key={i} className={picker.tile}>
                <div className={picker.tileTop}>
                  <Bone w={40} h={40} shape="block" strong />
                  <Bone w={18} h={18} shape="circle" />
                </div>
                <div className={classes.stack}>
                  <Bone w="70%" h={13} strong />
                  <Bone w="55%" h={11} />
                  <Bone w={90} h={16} shape="pill" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={picker.panelFoot}>
          <Bone w={220} h={11} />
          <Bone w={160} h={40} shape="block" strong />
        </div>
      </div>
    </Loading>
  );
}

export function IndexStatusSkeleton() {
  return (
    <Loading label="Checking index status" className={detail.status}>
      <div className={classes.inline}>
        <Bone w={36} h={36} shape="block" strong />
        <div className={`${classes.grow} ${classes.stack}`}>
          <Bone w="56%" h={14} strong />
          <Bone w="72%" h={11} />
        </div>
      </div>
      <div>
        {[128, 112, 72, 36, 56].map((w) => (
          <div key={w} className={classes.factRow}>
            <Bone w={80} h={11} />
            <Bone w={w} h={11} strong />
          </div>
        ))}
      </div>
      <Bone w={150} h={11} />
    </Loading>
  );
}
