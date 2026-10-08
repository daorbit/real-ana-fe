import { notifications } from "@mantine/notifications";
import { notifyError } from "@/shared/lib/notify";
import { UndoToast } from "@/shared/ui/UndoToast";
import toastClasses from "@/shared/ui/Toast.module.css";

const UNDO_MS = 5000;
const pending = new Map<string, () => void>();
let flushOnLeave = false;

function watchPageLeave() {
  if (flushOnLeave) return;
  flushOnLeave = true;
  window.addEventListener("pagehide", () => {
    for (const flush of [...pending.values()]) flush();
  });
}

export function deferDelete(opts: {
  key: string;
  message: string;
  errorMessage: string;
  hide: () => { undo: () => void };
  commit: () => Promise<unknown>;
  onUndo?: () => void;
}) {
  pending.get(opts.key)?.();
  watchPageLeave();

  const patch = opts.hide();
  const toastId = `undo-${opts.key}`;
  let settled = false;

  const finish = () => {
    settled = true;
    clearTimeout(timer);
    pending.delete(opts.key);
    notifications.hide(toastId);
  };

  const flush = () => {
    if (settled) return;
    finish();
    opts.commit().catch((e) => {
      patch.undo();
      notifyError(e, opts.errorMessage);
    });
  };

  const undo = () => {
    if (settled) return;
    finish();
    patch.undo();
    opts.onUndo?.();
  };

  const timer = setTimeout(flush, UNDO_MS);
  pending.set(opts.key, flush);

  notifications.show({
    id: toastId,
    message: <UndoToast message={opts.message} onUndo={undo} />,
    autoClose: false,
    withCloseButton: false,
    classNames: {
      root: toastClasses.toast,
      body: toastClasses.body,
      description: toastClasses.message,
    },
  });
}
