import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  count?: number;
  action?: ReactNode;
}

// Shared admin page header: title + optional count chip + optional action.
// Keeps every admin surface on the same M3 heading rhythm.
export default function PageHeader({ title, count, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2.5 min-w-0">
        <h1 className="md-title-large text-md-on-surface truncate">{title}</h1>
        {count !== undefined && (
          <span className="md-label-medium text-md-on-surface-variant bg-md-surface-container-high rounded-full px-2 py-0.5 tabular-nums shrink-0">
            {count}
          </span>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
