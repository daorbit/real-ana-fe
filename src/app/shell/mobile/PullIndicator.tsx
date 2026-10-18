import { forwardRef } from "react";
import { RefreshCw } from "lucide-react";

export const PullIndicator = forwardRef<HTMLDivElement>(function PullIndicator(_props, ref) {
  return (
    <div ref={ref} className="m-ptr" aria-hidden>
      <RefreshCw size={17} strokeWidth={2.2} />
    </div>
  );
});
