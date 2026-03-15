"use client";

import Link from "next/link";
import { useMemo } from "react";

interface Project {
  slug?: string;
  title?: string;
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
      const group = groupMap.get(key);
      if (group) group.push(project);
    }

    // Named groups first (in order of first appearance), ungrouped last
    const result: ProjectsByGroup[] = [];
    for (const key of groupOrder) {
      if (key !== null) {
        const items = groupMap.get(key)!;
        result.push({
          groupTitle: items[0].group_title ?? key,
          projects: items,
        });
      }
    }
    // Ungrouped projects at the end
    if (groupMap.has(null)) {
      result.push({
        groupTitle: null,
        projects: groupMap.get(null)!,
      });
    }

    return result;
  }, [projects]);

  const hasGroups = grouped.some((g) => g.groupTitle !== null);

  return (
    <div className="py-8 sm:py-12">
      <h1 className="text-xl sm:text-2xl font-medium mb-8 sm:mb-10">
        Projects
      </h1>

      {grouped.length === 0 ? (
        <p className="text-muted-foreground text-sm">No projects found.</p>
      ) : hasGroups ? (
        <div className="space-y-8 sm:space-y-10">
          {grouped.map(({ groupTitle, projects: groupProjects }) => (
            <section key={groupTitle ?? "_ungrouped"}>
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b border-border">
                {groupTitle ?? "Other"}
              </h2>
              <ul className="space-y-2">
                {groupProjects.map((project, index) => {
                  const year = project.date_created
                    ? new Date(project.date_created).getFullYear()
                    : "";
                  return (
                    <li key={project.slug || index}>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5 group text-sm"
                      >
                        <span className="text-muted-foreground text-xs w-12 shrink-0 order-2 sm:order-1">
                          {year}
                        </span>
                        <span className="text-foreground group-hover:text-primary transition-colors order-1 sm:order-2">
                          {project.title || "Untitled"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {grouped[0]?.projects.map((project, index) => {
            const year = project.date_created
              ? new Date(project.date_created).getFullYear()
              : "";
            return (
              <li key={project.slug || index}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5 group text-sm"
                >
                  <span className="text-muted-foreground text-xs w-12 shrink-0 order-2 sm:order-1">
                    {year}
                  </span>
                  <span className="text-foreground group-hover:text-primary transition-colors order-1 sm:order-2">
                    {project.title || "Untitled"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
