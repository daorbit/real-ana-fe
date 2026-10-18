type BadgeNavigator = Navigator & {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

export function setAppBadge(count: number) {
  const nav = navigator as BadgeNavigator;
  const pending = count > 0 ? nav.setAppBadge?.(count) : nav.clearAppBadge?.();
  pending?.catch(() => undefined);
}
