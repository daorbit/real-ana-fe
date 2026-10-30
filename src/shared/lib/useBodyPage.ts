import { useEffect } from "react";

export function useBodyPage(page: string, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    document.body.dataset.page = page;
    return () => {
      delete document.body.dataset.page;
    };
  }, [page, enabled]);
}
