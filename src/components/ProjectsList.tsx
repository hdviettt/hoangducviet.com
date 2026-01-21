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
    <div className="py-12 font-mono">
      {/* Terminal command header */}
      <div className="mb-8 text-sm">
        <span className="text-primary">$</span>{" "}
        <span className="text-muted-foreground">ls -la ./projects</span>
      </div>

      {sortedProjects.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <span className="text-primary">&gt;</span> No projects found.
        </p>
      ) : (
        <div>
          {/* Directory header */}
          <div className="text-xs text-muted-foreground mb-3 pb-2 border-b border-border/50">
            <span className="text-primary">drwxr-xr-x</span>
            <span className="mx-3">{sortedProjects.length}</span>
            <span>projects/</span>
          </div>

          {/* Projects list */}
          <ul className="space-y-1">
            {sortedProjects.map((project, index) => {
              const year = project.date_created
                ? new Date(project.date_created).getFullYear()
                : '----';

              return (
                <li key={project.slug || index}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="flex items-baseline gap-4 py-1 group text-sm"
                  >
                    <span className="text-muted-foreground text-xs w-12 shrink-0">
                      {year}
                    </span>
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      {project.title || "untitled"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Terminal prompt at bottom */}
      <div className="mt-12 text-sm text-muted-foreground">
        <span className="text-primary">$</span>{" "}
        <span className="inline-block w-2 h-4 bg-primary/80 animate-pulse" />
      </div>
    </div>
  );
}
