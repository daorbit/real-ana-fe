type NetworkInfo = { saveData?: boolean; effectiveType?: string };

export function onIdle(run: () => void, timeout = 2000): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(run, 200);
  return () => window.clearTimeout(id);
}

export function whenIdle(timeout = 2000): Promise<void> {
  return new Promise((resolve) => {
    onIdle(resolve, timeout);
  });
}

export function isConstrainedNetwork(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  if (!connection) return false;
  return Boolean(connection.saveData) || /2g|3g/.test(connection.effectiveType ?? "");
}
