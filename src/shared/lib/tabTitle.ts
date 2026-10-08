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

export function setTitleCount(next: number) {
  if (next === count) return;
  count = next;
  render();
}
