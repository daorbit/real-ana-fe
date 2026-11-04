import { usePageName } from "@/shared/lib/useTitle";
import classes from "./MobileLargeTitle.module.css";

export function MobileLargeTitle() {
  const pageName = usePageName();
  if (!pageName) return null;
  return <h1 className={classes.title}>{pageName}</h1>;
}
