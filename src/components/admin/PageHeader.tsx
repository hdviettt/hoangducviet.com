import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  count?: number;
  action?: ReactNode;
}

// Same voice as a reader-facing page title — medium weight, tight tracking —
// one step down the scale, because a working list is not a landing page.
export default function PageHeader({ title, count, action }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8 pt-2">
      <div className="flex items-baseline gap-3 min-w-0">
        <h1 className="text-[28px] leading-9 md:text-[36px] md:leading-[44px] font-medium tracking-tight text-md-on-surface truncate">
          {title}
        </h1>
        {count !== undefined && (
          <span className="text-[14px] leading-5 text-md-on-surface-variant tabular-nums shrink-0">
            {count}
          </span>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
