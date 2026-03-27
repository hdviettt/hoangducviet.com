"use client";

import Link from "next/link";
import { useMemo } from "react";

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

interface ProjectsByGroup {
  groupTitle: string | null;
  projects: Project[];
}

function ProjectCard({ project }: { project: Project }) {
  const year = project.date_created
    ? new Date(project.date_created).getFullYear()
    : null;
  const snippet = project.summary
    ? project.summary.length > 120
      ? project.summary.slice(0, 120).trimEnd() + "…"
      : project.summary
    : "";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col border border-border hover:border-primary/50 transition-colors bg-background overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted overflow-hidden">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title || ""}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl md:text-4xl font-medium text-muted-foreground/20 select-none">
              {(project.title || "?")[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2">
          {project.group_title && (
            <span className="text-xs uppercase tracking-wider text-primary/70">
              {project.group_title}
            </span>
          )}
          {year && (
            <span className="text-xs text-muted-foreground ml-auto">{year}</span>
          )}
        </div>

        <h3 className="text-base md:text-lg font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
          {project.title || "Untitled"}
        </h3>

        {snippet && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {snippet}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const grouped = useMemo(() => {
    const sorted = [...projects].sort(
      (a, b) =>
        new Date(b.date_created || 0).getTime() -
        new Date(a.date_created || 0).getTime(),
    );

    const groupMap = new Map<string | null, Project[]>();
    const groupOrder: (string | null)[] = [];

    for (const project of sorted) {
      const key = project.group_slug ?? null;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
        groupOrder.push(key);
      }
      groupMap.get(key)!.push(project);
    }

    const result: ProjectsByGroup[] = [];
    for (const key of groupOrder) {
      if (key !== null) {
        const items = groupMap.get(key)!;
        result.push({ groupTitle: items[0].group_title ?? key, projects: items });
      }
    }
    if (groupMap.has(null)) {
      result.push({ groupTitle: null, projects: groupMap.get(null)! });
    }

    return result;
  }, [projects]);

  const hasGroups = grouped.some((g) => g.groupTitle !== null);

  return (
    <div className="py-8 sm:py-12 md:py-16">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-medium mb-8 sm:mb-10 md:mb-12">
        Projects
      </h1>

      {grouped.length === 0 ? (
        <p className="text-muted-foreground text-sm md:text-base">No projects found.</p>
      ) : hasGroups ? (
        <div className="space-y-10 md:space-y-14">
          {grouped.map(({ groupTitle, projects: groupProjects }) => (
            <section key={groupTitle ?? "_ungrouped"}>
              {groupTitle && (
                <h2 className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground mb-5 md:mb-6 pb-2 border-b border-border">
                  {groupTitle}
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {groupProjects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {grouped[0]?.projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
