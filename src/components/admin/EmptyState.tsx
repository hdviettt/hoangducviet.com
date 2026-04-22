interface EmptyStateProps {
  title: string;
  hint?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({ title, hint, action }: EmptyStateProps) {
  return (
    <div className="py-14 px-6 text-center font-mono">
      <pre className="text-muted-foreground/40 text-[11px] leading-tight mb-5 select-none inline-block text-left">
{`┌─────────────────────────┐
│                         │
│     ${title.slice(0, 17).padEnd(17)}   │
│                         │
└─────────────────────────┘`}
      </pre>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const isPublished = status === "published";
  const label = status.toUpperCase();
  return (
    <span
      className={`font-mono text-[10px] tracking-wider px-1.5 py-0.5 border ${
        isPublished
          ? "text-green-500 border-green-500/30 bg-green-500/5"
          : "text-yellow-500 border-yellow-500/30 bg-yellow-500/5"
      }`}
    >
      [{label}]
    </span>
  );
}
