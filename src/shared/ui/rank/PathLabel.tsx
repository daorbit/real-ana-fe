import classes from "./Rank.module.css";

export function PathLabel({ path }: { path: string }) {
  if (!path || path === "/") {
    return (
      <>
        <span className={classes.pathDir}>/</span>
        <span className={classes.pathHome}>Homepage</span>
      </>
    );
  }

  const trimmed = path.endsWith("/") ? path.slice(0, -1) : path;
  const cut = trimmed.lastIndexOf("/");
  const dir = trimmed.slice(0, cut + 1);
  const leaf = trimmed.slice(cut + 1) + (trimmed === path ? "" : "/");

  return (
    <>
      {dir && <span className={classes.pathDir}>{dir}</span>}
      {leaf}
    </>
  );
}

export function isPathKey(key: string) {
  return key.startsWith("/");
}

