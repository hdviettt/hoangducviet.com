"use client";

import { useMemo } from "react";
import Link from "next/link";

interface Project {
  slug?: string;
  title?: string;
  date_created?: string;
}

interface ProjectsListProps {
  projects: Project[];
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) =>
      new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime()
    );
  }, [projects]);

  return (
    <div className="py-8 sm:py-12">
      <h1 className="text-xl sm:text-2xl font-medium mb-8 sm:mb-10">Projects</h1>

      {sortedProjects.length === 0 ? (
        <p className="text-muted-foreground text-sm">No projects found.</p>
      ) : (
        <ul className="space-y-2">
          {sortedProjects.map((project, index) => {
            const year = project.date_created
              ? new Date(project.date_created).getFullYear()
              : '';

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
