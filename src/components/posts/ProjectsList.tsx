"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface Project {
  slug?: string;
  title?: string;
  url?: string | null;
  summary?: string | null;
  description?: string;
  thumbnail?: string | null;
  date_created?: string;
  group_slug?: string | null;
  group_title?: string | null;
}

interface ProjectsListProps {
  projects: Project[];
}

function ProjectRow({ project }: { project: Project }) {
  const year = project.date_created
    ? new Date(project.date_created).getFullYear()
    : null;

  return (
    <Link href={`/projects/${project.slug}`} className="block py-6 md:py-8 group">
      <div className="flex items-baseline gap-6">
        <h3 className="flex-1 min-w-0 text-2xl md:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {project.title || "Untitled"}
        </h3>
        {year && (
          <span className="text-sm tabular-nums text-muted-foreground/60 shrink-0">
            {year}
          </span>
        )}
      </div>
      {project.summary && (
        <p className="mt-3 text-base md:text-lg text-foreground/70 leading-relaxed max-w-2xl line-clamp-2">
          {project.summary}
        </p>
      )}
    </Link>
  );
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const { groups, sorted } = useMemo(() => {
    const sorted = [...projects].sort(
      (a, b) =>
        new Date(b.date_created || 0).getTime() -
        new Date(a.date_created || 0).getTime(),
    );

    const seen = new Set<string>();
    const groups: { slug: string; title: string }[] = [];
    for (const p of sorted) {
      if (p.group_slug && !seen.has(p.group_slug)) {
        seen.add(p.group_slug);
        groups.push({ slug: p.group_slug, title: p.group_title ?? p.group_slug });
      }
    }

    return { groups, sorted };
  }, [projects]);

  const visible = activeGroup
    ? sorted.filter((p) => p.group_slug === activeGroup)
    : sorted;

  return (
    <div className="pt-16 sm:pt-24 md:pt-32 pb-24 md:pb-32">
      <span className="deck-label">things i've built</span>
      <h1 className="deck-display text-5xl sm:text-6xl md:text-7xl mb-12 sm:mb-16 md:mb-24">
        projects.
      </h1>

      {groups.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-16 md:mb-20">
          <button
            onClick={() => setActiveGroup(null)}
            className={`text-sm font-medium transition-colors ${
              activeGroup === null
                ? "text-foreground"
                : "text-muted-foreground/60 hover:text-foreground"
            }`}
          >
            all
          </button>
          {groups.map((g) => (
            <button
              key={g.slug}
              onClick={() => setActiveGroup(g.slug)}
              className={`text-sm font-medium transition-colors ${
                activeGroup === g.slug
                  ? "text-foreground"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              {g.title.toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-muted-foreground">No projects found.</p>
      ) : (
        <ul className="divide-y divide-border/50">
          {visible.map((project) => (
            <li key={project.slug}>
              <ProjectRow project={project} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
