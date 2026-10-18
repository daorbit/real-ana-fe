export function isIosStandalone(): boolean {
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function isStandalone(): boolean {
  return isIosStandalone() || (window.matchMedia?.("(display-mode: standalone)").matches ?? false);
}
