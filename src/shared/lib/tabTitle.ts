export const TITLE_SUFFIX = "Quantalog";

let base = TITLE_SUFFIX;
let count = 0;

function render() {
  const prefix = count > 0 ? `(${count > 99 ? "99+" : count}) ` : "";
  document.title = `${prefix}${base}`;
}

export function getTitleBase(): string {
  return base;
}

export function setTitleBase(next: string) {
  base = next;
  render();
}

let pageName: string | null = null;
const pageNameListeners = new Set<() => void>();

export function getPageName(): string | null {
  return pageName;
}

export function setPageName(next: string | null) {
  if (next === pageName) return;
  pageName = next;
  pageNameListeners.forEach((listener) => listener());
}

export function subscribePageName(listener: () => void) {
  pageNameListeners.add(listener);
  return () => pageNameListeners.delete(listener);
}

export function setTitleCount(next: number) {
  if (next === count) return;
  count = next;
  render();
}
