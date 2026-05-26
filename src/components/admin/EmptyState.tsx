import { Icon } from "@/components/ui/Icon";

interface EmptyStateProps {
  title: string;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  icon?: string;
}

export default function EmptyState({
  title,
  hint,
  action,
  icon = "inbox",
}: EmptyStateProps) {
  return (
    <div className="py-12 px-6 text-center">
      <Icon
        name={icon}
        size={48}
        className="text-md-on-surface-variant/40 mb-4 inline-block"
      />
      <p className="md-title-medium text-md-on-surface mb-2">{title}</p>
      {hint && (
        <div className="md-body-small text-md-on-surface-variant">{hint}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const isPublished = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 md-label-small px-2 py-0.5 rounded-full ${
        isPublished
          ? "bg-md-primary-container text-md-on-primary-container"
          : "bg-md-secondary-container text-md-on-secondary-container"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPublished ? "bg-md-primary" : "bg-md-on-surface-variant"
        }`}
      />
      {status}
    </span>
  );
}
