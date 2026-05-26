"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";

type Row = {
  type: "post" | "project";
  slug: string;
  title: string;
  path: string;
  incomingCount: number;
  outgoingCount: number;
  incomingSources: string[];
  outgoingTargets: string[];
};

type SortKey = "title" | "type" | "incomingCount" | "outgoingCount";

export default function LinkTable({ data }: { data: Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("incomingCount");
  const [sortAsc, setSortAsc] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type);
      else cmp = a[sortKey] - b[sortKey];
      return sortAsc ? cmp : -cmp;
    });
  }, [data, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((prev) => !prev);
    else {
      setSortKey(key);
      setSortAsc(key === "title" || key === "type");
    }
  };

  const columns: { key: SortKey; label: string; className: string }[] = [
    { key: "type", label: "type", className: "w-20" },
    { key: "title", label: "title", className: "flex-1 min-w-0" },
    { key: "incomingCount", label: "incoming", className: "w-24 text-right" },
    { key: "outgoingCount", label: "outgoing", className: "w-24 text-right" },
  ];

  return (
    <div className="rounded-xl border border-md-outline-variant divide-y divide-md-outline-variant overflow-hidden bg-md-surface-container-low">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-md-surface-container">
        {columns.map((col) => (
          <button
            key={col.key}
            type="button"
            onClick={() => toggleSort(col.key)}
            className={`flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors ${col.className}`}
          >
            {col.label}
            {sortKey === col.key && <Icon name="swap_vert" size={14} />}
          </button>
        ))}
      </div>

      {/* Rows */}
      {sorted.map((row) => (
        <div key={row.path}>
          <button
            type="button"
            onClick={() =>
              setExpanded(expanded === row.path ? null : row.path)
            }
            className="flex items-center gap-3 px-4 py-3 row-hover w-full text-left"
          >
            <span
              className={`md-label-small uppercase font-medium px-1.5 py-0.5 w-20 text-center ${
                row.type === "post"
                  ? "bg-md-primary-container text-md-on-primary-container"
                  : "bg-md-tertiary-container text-md-on-tertiary-container"
              }`}
            >
              {row.type}
            </span>
            <span className="text-sm flex-1 min-w-0 truncate">{row.title}</span>
            <span
              className={`text-sm w-24 text-right ${
                row.incomingCount === 0
                  ? "text-md-tertiary"
                  : "text-muted-foreground"
              }`}
            >
              {row.incomingCount}
            </span>
            <span className="text-sm text-muted-foreground w-24 text-right">
              {row.outgoingCount}
            </span>
          </button>

          {/* Expanded detail */}
          {expanded === row.path && (
            <div className="px-4 pb-3 pt-0 bg-muted/10 border-t border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    incoming ({row.incomingCount})
                  </div>
                  {row.incomingSources.length > 0 ? (
                    <ul className="space-y-1">
                      {row.incomingSources.map((src) => (
                        <li key={src} className="text-xs text-muted-foreground">
                          {src}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-yellow-500">no incoming links</p>
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    outgoing ({row.outgoingCount})
                  </div>
                  {row.outgoingTargets.length > 0 ? (
                    <ul className="space-y-1">
                      {row.outgoingTargets.map((tgt) => (
                        <li key={tgt} className="text-xs text-muted-foreground">
                          {tgt}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      no outgoing links
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={
                  row.type === "post"
                    ? `/admin/posts/${row.slug}/edit`
                    : `/admin/projects/${row.slug}/edit`
                }
                className="text-xs text-primary hover:underline"
              >
                edit {row.type}
              </Link>
            </div>
          )}
        </div>
      ))}

      {sorted.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          no published pages found.
        </div>
      )}
    </div>
  );
}
