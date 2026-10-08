declare const __APP_BUILD__: {
  commit: string;
  branch: string;
  env: string;
  builtAt: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

const builtAt = new Date(__APP_BUILD__.builtAt);

export const BUILD = {
  version: `v${builtAt.getUTCFullYear()}.${pad(builtAt.getUTCMonth() + 1)}.${pad(builtAt.getUTCDate())}`,
  commit: __APP_BUILD__.commit.slice(0, 7),
  fullCommit: __APP_BUILD__.commit,
  branch: __APP_BUILD__.branch,
  env: __APP_BUILD__.env,
  builtAt,
};
